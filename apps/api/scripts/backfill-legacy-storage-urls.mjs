import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { loadApiEnv, preferDirectDatabaseUrl } from './load-api-env.mjs';

const LEGACY_UPLOAD_MARKER = '/uploads/';

const fieldConfigs = [
  {
    label: 'users.avatarUrl',
    delegate: 'user',
    field: 'avatarUrl',
    kind: 'single',
    select: { id: true, avatarUrl: true },
    getObjectPath: (row, legacyRelativePath) => `avatars/${row.id}/${path.posix.basename(legacyRelativePath)}`,
  },
  {
    label: 'companies.logoUrl',
    delegate: 'company',
    field: 'logoUrl',
    kind: 'single',
    select: { id: true, logoUrl: true },
    getObjectPath: (_row, legacyRelativePath) => `images/${path.posix.basename(legacyRelativePath)}`,
  },
  {
    label: 'companies.verificationDocs',
    delegate: 'company',
    field: 'verificationDocs',
    kind: 'array',
    select: { id: true, verificationDocs: true },
    getObjectPath: (_row, legacyRelativePath) => `documents/${path.posix.basename(legacyRelativePath)}`,
  },
  {
    label: 'jobs.companyImages',
    delegate: 'job',
    field: 'companyImages',
    kind: 'array',
    select: { id: true, companyImages: true },
    getObjectPath: (_row, legacyRelativePath) => `images/${path.posix.basename(legacyRelativePath)}`,
  },
  {
    label: 'resumes.fileUrl',
    delegate: 'resume',
    field: 'fileUrl',
    kind: 'single',
    select: { id: true, userId: true, fileUrl: true },
    getObjectPath: (row, legacyRelativePath) => `resumes/${row.userId}/${path.posix.basename(legacyRelativePath)}`,
  },
  {
    label: 'languageTests.fileUrl',
    delegate: 'languageTest',
    field: 'fileUrl',
    kind: 'single',
    select: { id: true, fileUrl: true },
    getObjectPath: (_row, legacyRelativePath) => `documents/${path.posix.basename(legacyRelativePath)}`,
  },
  {
    label: 'certificates.imageUrl',
    delegate: 'certificate',
    field: 'imageUrl',
    kind: 'single',
    select: { id: true, imageUrl: true },
    getObjectPath: (_row, legacyRelativePath) => `images/${path.posix.basename(legacyRelativePath)}`,
  },
];

function parseCliArgs(argv) {
  const options = {
    apply: false,
    json: false,
    uploadsDir: 'uploads',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--apply') {
      options.apply = true;
      continue;
    }

    if (arg === '--json') {
      options.json = true;
      continue;
    }

    if (arg === '--uploads-dir') {
      options.uploadsDir = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.uploadsDir) {
    throw new Error('Missing value for --uploads-dir');
  }

  return options;
}

function getSupabaseUrl() {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL');
  }

  return supabaseUrl.replace(/\/$/, '');
}

function getBucketName() {
  return process.env.SUPABASE_STORAGE_BUCKET || 'jobsabuy-assets';
}

function getServiceRoleKey() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return serviceRoleKey;
}

function encodeObjectPath(objectPath) {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function getPublicUrl(objectPath) {
  return `${getSupabaseUrl()}/storage/v1/object/public/${getBucketName()}/${encodeObjectPath(objectPath)}`;
}

function isLegacyUploadUrl(value) {
  return typeof value === 'string' && value.includes(LEGACY_UPLOAD_MARKER);
}

function normalizeUrlArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string');
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [trimmed];
  }
}

function resolveLegacyRelativePath(fileUrl) {
  try {
    const url = new URL(fileUrl);
    const markerIndex = url.pathname.indexOf(LEGACY_UPLOAD_MARKER);
    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(markerIndex + LEGACY_UPLOAD_MARKER.length));
  } catch {
    const markerIndex = fileUrl.indexOf(LEGACY_UPLOAD_MARKER);
    if (markerIndex === -1) {
      return null;
    }

    return fileUrl.slice(markerIndex + LEGACY_UPLOAD_MARKER.length);
  }
}

function resolveLegacyAbsolutePath(fileUrl, uploadsRoot) {
  const relativePath = resolveLegacyRelativePath(fileUrl);
  if (!relativePath) {
    return null;
  }

  const safeSegments = relativePath.split('/').filter(Boolean);
  const absolutePath = path.resolve(uploadsRoot, ...safeSegments);
  if (!absolutePath.startsWith(uploadsRoot)) {
    return null;
  }

  return absolutePath;
}

function inferContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

async function uploadFileToSupabase(filePath, objectPath) {
  const response = await fetch(
    `${getSupabaseUrl()}/storage/v1/object/${getBucketName()}/${encodeObjectPath(objectPath)}`,
    {
      method: 'POST',
      headers: {
        apikey: getServiceRoleKey(),
        Authorization: `Bearer ${getServiceRoleKey()}`,
        'Content-Type': inferContentType(filePath),
        'x-upsert': 'true',
      },
      body: await fs.readFile(filePath),
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return getPublicUrl(objectPath);
}

async function readErrorMessage(response) {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return String(data.message || data.error || JSON.stringify(data));
    }

    return (await response.text()) || response.statusText;
  } catch {
    return response.statusText || 'Unknown Supabase error';
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function processSingleField(prisma, config, row, uploadsRoot, apply) {
  const currentUrl = row[config.field];
  if (!isLegacyUploadUrl(currentUrl)) {
    return { changed: false, legacyUrlCount: 0, missingCount: 0, errorCount: 0 };
  }

  const filePath = resolveLegacyAbsolutePath(currentUrl, uploadsRoot);
  if (!filePath || !(await fileExists(filePath))) {
    return {
      changed: false,
      legacyUrlCount: 1,
      missingCount: 1,
      errorCount: 0,
      missingFiles: [currentUrl],
    };
  }

  const objectPath = config.getObjectPath(row, resolveLegacyRelativePath(currentUrl));

  if (apply) {
    const publicUrl = await uploadFileToSupabase(filePath, objectPath);
    await prisma[config.delegate].update({
      where: { id: row.id },
      data: { [config.field]: publicUrl },
    });
  }

  return {
    changed: true,
    legacyUrlCount: 1,
    missingCount: 0,
    errorCount: 0,
  };
}

async function processArrayField(prisma, config, row, uploadsRoot, apply) {
  const currentUrls = normalizeUrlArray(row[config.field]);
  const legacyUrls = currentUrls.filter(isLegacyUploadUrl);
  if (legacyUrls.length === 0) {
    return { changed: false, legacyUrlCount: 0, missingCount: 0, errorCount: 0 };
  }

  const nextUrls = [];
  const missingFiles = [];

  for (const currentUrl of currentUrls) {
    if (!isLegacyUploadUrl(currentUrl)) {
      nextUrls.push(currentUrl);
      continue;
    }

    const filePath = resolveLegacyAbsolutePath(currentUrl, uploadsRoot);
    if (!filePath || !(await fileExists(filePath))) {
      missingFiles.push(currentUrl);
      nextUrls.push(currentUrl);
      continue;
    }

    const objectPath = config.getObjectPath(row, resolveLegacyRelativePath(currentUrl));
    nextUrls.push(apply ? await uploadFileToSupabase(filePath, objectPath) : getPublicUrl(objectPath));
  }

  if (apply) {
    await prisma[config.delegate].update({
      where: { id: row.id },
      data: { [config.field]: nextUrls },
    });
  }

  return {
    changed: true,
    legacyUrlCount: legacyUrls.length,
    missingCount: missingFiles.length,
    errorCount: 0,
    missingFiles,
  };
}

async function processFieldConfig(prisma, config, uploadsRoot, apply) {
  const rows = await prisma[config.delegate].findMany({ select: config.select });
  const result = {
    field: config.label,
    rowsScanned: rows.length,
    rowsUpdated: 0,
    legacyUrlCount: 0,
    missingCount: 0,
    errorCount: 0,
    missingFiles: [],
  };

  for (const row of rows) {
    try {
      const rowResult = config.kind === 'array'
        ? await processArrayField(prisma, config, row, uploadsRoot, apply)
        : await processSingleField(prisma, config, row, uploadsRoot, apply);

      result.legacyUrlCount += rowResult.legacyUrlCount;
      result.missingCount += rowResult.missingCount;
      result.errorCount += rowResult.errorCount;
      result.missingFiles.push(...(rowResult.missingFiles || []));
      if (rowResult.changed) {
        result.rowsUpdated += 1;
      }
    } catch (error) {
      result.errorCount += 1;
      result.missingFiles.push(`${row.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return result;
}

function printHumanReadable(summary) {
  console.log(`Mode: ${summary.mode}`);
  console.log(`Uploads directory: ${summary.uploadsDir}`);
  for (const result of summary.results) {
    console.log(
      `${result.field} -> rows=${result.rowsScanned}, updated=${result.rowsUpdated}, legacyUrls=${result.legacyUrlCount}, missing=${result.missingCount}, errors=${result.errorCount}`,
    );
    if (result.missingFiles.length > 0) {
      for (const missingFile of result.missingFiles.slice(0, 10)) {
        console.log(`  - ${missingFile}`);
      }
      if (result.missingFiles.length > 10) {
        console.log(`  - ... ${result.missingFiles.length - 10} more`);
      }
    }
  }
}

async function main() {
  loadApiEnv();
  preferDirectDatabaseUrl();

  const options = parseCliArgs(process.argv.slice(2));
  const uploadsRoot = path.resolve(process.cwd(), options.uploadsDir);
  const prisma = new PrismaClient();

  try {
    const results = [];
    for (const config of fieldConfigs) {
      results.push(await processFieldConfig(prisma, config, uploadsRoot, options.apply));
    }

    const summary = {
      mode: options.apply ? 'apply' : 'dry-run',
      uploadsDir: uploadsRoot,
      bucket: getBucketName(),
      results,
      totals: {
        rowsScanned: results.reduce((sum, item) => sum + item.rowsScanned, 0),
        rowsUpdated: results.reduce((sum, item) => sum + item.rowsUpdated, 0),
        legacyUrlCount: results.reduce((sum, item) => sum + item.legacyUrlCount, 0),
        missingCount: results.reduce((sum, item) => sum + item.missingCount, 0),
        errorCount: results.reduce((sum, item) => sum + item.errorCount, 0),
      },
    };

    if (options.json) {
      console.log(JSON.stringify(summary, null, 2));
      return;
    }

    printHumanReadable(summary);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
