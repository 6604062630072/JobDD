import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { loadApiEnv, preferDirectDatabaseUrl } from './load-api-env.mjs';

function parseCliArgs(argv) {
  const options = {
    json: false,
    baseUrl: 'http://127.0.0.1:3001/api/v1',
    imagePath: path.resolve(process.cwd(), 'uploads', 'avatar-1772875046432-194041838.jpg'),
    pdfPath: path.resolve(process.cwd(), 'uploads', 'doc-1772912094465-452043300.pdf'),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--json') {
      options.json = true;
      continue;
    }

    if (arg === '--base-url') {
      options.baseUrl = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--image-path') {
      options.imagePath = path.resolve(process.cwd(), argv[index + 1] ?? '');
      index += 1;
      continue;
    }

    if (arg === '--pdf-path') {
      options.pdfPath = path.resolve(process.cwd(), argv[index + 1] ?? '');
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function loadEnvObject(filePath) {
  const env = {};
  const content = fs.readFileSync(filePath, 'utf8');

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function resolveMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

function isSupabaseStorageUrl(value) {
  return typeof value === 'string' && value.includes('.supabase.co/storage/v1/object/');
}

async function assertLocalFileExists(filePath) {
  await fs.promises.access(filePath);
  return filePath;
}

async function uploadMultipart(baseUrl, endpoint, token, filePath) {
  const buffer = await fs.promises.readFile(filePath);
  const form = new FormData();
  const file = new File([buffer], path.basename(filePath), { type: resolveMimeType(filePath) });
  form.append('file', file);

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  const url = body?.url ?? body?.avatarUrl ?? body?.fileUrl ?? null;
  return {
    endpoint,
    status: response.status,
    ok: response.ok,
    url,
    isSupabaseUrl: isSupabaseStorageUrl(url),
  };
}

async function fetchJson(url, token) {
  const response = await fetch(url, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return {
    status: response.status,
    ok: response.ok,
    body,
  };
}

async function fetchAsset(url) {
  if (!url) {
    return null;
  }

  try {
    const response = await fetch(url, { method: 'GET' });
    return {
      ok: response.ok,
      status: response.status,
      isSupabaseUrl: isSupabaseStorageUrl(url),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      isSupabaseUrl: isSupabaseStorageUrl(url),
    };
  }
}

async function main() {
  loadApiEnv();
  preferDirectDatabaseUrl();

  const options = parseCliArgs(process.argv.slice(2));
  await assertLocalFileExists(options.imagePath);
  await assertLocalFileExists(options.pdfPath);

  const env = loadEnvObject(path.resolve(process.cwd(), '.env'));
  const jwtSecret = env.JWT_SECRET || 'dev-secret-key';
  const jwtService = new JwtService({ secret: jwtSecret, signOptions: { expiresIn: '1h' } });
  const prisma = new PrismaClient();

  try {
    const [jobseeker, employer] = await Promise.all([
      prisma.user.findFirst({ where: { role: 'JOBSEEKER' }, select: { id: true, email: true, role: true } }),
      prisma.user.findFirst({ where: { role: 'EMPLOYER' }, select: { id: true, email: true, role: true } }),
    ]);

    if (!jobseeker || !employer) {
      throw new Error('Missing JOBSEEKER or EMPLOYER user for smoke test');
    }

    const jobseekerToken = jwtService.sign({ sub: jobseeker.id, email: jobseeker.email, role: jobseeker.role });
    const employerToken = jwtService.sign({ sub: employer.id, email: employer.email, role: employer.role });

    const uploadResults = [
      await uploadMultipart(options.baseUrl, '/users/me/avatar', jobseekerToken, options.imagePath),
      await uploadMultipart(options.baseUrl, '/resumes/upload', jobseekerToken, options.pdfPath),
      await uploadMultipart(options.baseUrl, '/upload', employerToken, options.imagePath),
      await uploadMultipart(options.baseUrl, '/upload/document', employerToken, options.pdfPath),
    ];

    const [authMe, resumes, companyJob] = await Promise.all([
      fetchJson(`${options.baseUrl}/auth/me`, jobseekerToken),
      fetchJson(`${options.baseUrl}/resumes`, jobseekerToken),
      prisma.job.findFirst({ where: { companyImages: { not: null } }, select: { slug: true } }),
    ]);

    const jobDetail = companyJob
      ? await fetchJson(`${options.baseUrl}/jobs/${companyJob.slug}`)
      : { status: 404, ok: false, body: null };

    const avatarUrl = authMe.body?.avatarUrl ?? null;
    const resumeUrl = Array.isArray(resumes.body) ? resumes.body[0]?.fileUrl ?? null : null;
    const companyImages = Array.isArray(jobDetail.body?.companyImages) ? jobDetail.body.companyImages : [];

    const assetChecks = {
      avatar: await fetchAsset(avatarUrl),
      resume: await fetchAsset(resumeUrl),
      companyImages: await Promise.all(companyImages.slice(0, 3).map((url) => fetchAsset(url))),
    };

    const summary = {
      baseUrl: options.baseUrl,
      uploadResults,
      frontendDataChecks: {
        avatarUrl,
        avatarIsSupabase: isSupabaseStorageUrl(avatarUrl),
        resumeUrl,
        resumeIsSupabase: isSupabaseStorageUrl(resumeUrl),
        companyImages,
        companyImagesAreSupabase: companyImages.every((url) => isSupabaseStorageUrl(url)),
      },
      assetChecks,
    };

    if (options.json) {
      console.log(JSON.stringify(summary, null, 2));
      return;
    }

    console.log(summary);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
