import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { parseTableSelection } from './data-migration-config.mjs';
import { loadApiEnv } from './load-api-env.mjs';
import { loadRowsFromDumpFile } from './parse-mysql-dump.mjs';

loadApiEnv();

function parseArgs(argv) {
  const options = {
    apply: false,
    exportDir: 'migration-data',
    tables: '',
    json: false,
    force: false,
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

    if (arg === '--force') {
      options.force = true;
      continue;
    }

    if (arg === '--export-dir') {
      options.exportDir = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--tables') {
      options.tables = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.exportDir) {
    throw new Error('Missing value for --export-dir');
  }

  return options;
}

function resolveLegacyMysqlUrl() {
  const candidates = [
    process.env.LEGACY_MYSQL_URL,
    process.env.MYSQL_DATABASE_URL,
    process.env.MYSQL_URL,
    process.env.DATABASE_URL,
  ].filter(Boolean);

  const selected = candidates.find((value) => /^mysql:|^mariadb:/i.test(value));
  if (!selected) {
    throw new Error('Missing LEGACY_MYSQL_URL (or MYSQL_DATABASE_URL / MYSQL_URL) pointing to the old MySQL database');
  }

  return selected;
}

async function resolveLegacySource() {
  const dumpCandidates = [
    process.env.LEGACY_MYSQL_DUMP_PATH,
    path.resolve(process.cwd(), 'migration-data', 'jobsabuy.sql'),
  ].filter(Boolean);

  for (const candidate of dumpCandidates) {
    const resolvedPath = path.resolve(process.cwd(), candidate);
    if (await fileExists(resolvedPath)) {
      return {
        kind: 'dump',
        dumpFilePath: resolvedPath,
      };
    }
  }

  return {
    kind: 'mysql',
    mysqlUrl: resolveLegacyMysqlUrl(),
  };
}

function toCamelCaseKey(key) {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function normalizeSourceRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [toCamelCaseKey(key), value]),
  );
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureExportDir(exportDir) {
  await fs.mkdir(exportDir, { recursive: true });
}

async function getTableCounts(connection, tableConfigs) {
  const results = [];

  for (const config of tableConfigs) {
    const [rows] = await connection.query(`SELECT COUNT(*) AS total FROM \`${config.label}\``);
    const total = Array.isArray(rows) && rows[0] ? Number(rows[0].total ?? 0) : 0;
    results.push({
      table: config.label,
      fileName: config.fileName,
      rowCount: total,
      dependsOn: config.dependsOn,
    });
  }

  return results;
}

function getDumpTableCounts(rowsByTable, tableConfigs) {
  return tableConfigs.map((config) => ({
    table: config.label,
    fileName: config.fileName,
    rowCount: (rowsByTable.get(config.label) ?? []).length,
    dependsOn: config.dependsOn,
  }));
}

async function writeExportFile(exportDir, config, normalizedRows, force) {
  const outputPath = path.join(exportDir, config.fileName);
  if ((await fileExists(outputPath)) && !force) {
    throw new Error(`Refusing to overwrite ${config.fileName}. Re-run with --force if this is intentional.`);
  }

  const payload = {
    table: config.label,
    exportedAt: new Date().toISOString(),
    rowCount: normalizedRows.length,
    rows: normalizedRows,
  };

  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  return {
    table: config.label,
    fileName: config.fileName,
    rowCount: normalizedRows.length,
  };
}

async function exportTable(connection, exportDir, config, force) {
  const [rows] = await connection.query(`SELECT * FROM \`${config.label}\``);
  const normalizedRows = rows.map((row) => normalizeSourceRow(row));
  return writeExportFile(exportDir, config, normalizedRows, force);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const exportDir = path.resolve(process.cwd(), options.exportDir);
  const selectedConfigs = parseTableSelection(options.tables);
  const source = await resolveLegacySource();

  if (source.kind === 'dump') {
    const rowsByTable = await loadRowsFromDumpFile(
      source.dumpFilePath,
      selectedConfigs.map((config) => config.label),
    );

    const counts = getDumpTableCounts(rowsByTable, selectedConfigs);

    if (!options.apply) {
      const output = {
        mode: 'dry-run',
        source: {
          kind: 'dump',
          dumpFilePath: source.dumpFilePath,
        },
        exportDir,
        tables: selectedConfigs.map((config) => config.label),
        counts,
      };

      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        for (const item of counts) {
          console.log(`${item.table}: rows=${item.rowCount}`);
        }
      }
      return;
    }

    await ensureExportDir(exportDir);

    const results = [];
    for (const config of selectedConfigs) {
      results.push(
        await writeExportFile(exportDir, config, rowsByTable.get(config.label) ?? [], options.force),
      );
    }

    const output = {
      mode: 'apply',
      source: {
        kind: 'dump',
        dumpFilePath: source.dumpFilePath,
      },
      exportDir,
      results,
    };

    if (options.json) {
      console.log(JSON.stringify(output, null, 2));
    } else {
      for (const result of results) {
        console.log(`${result.table}: exported=${result.rowCount}`);
      }
    }
    return;
  }

  const connection = await mysql.createConnection({
    uri: source.mysqlUrl,
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });

  try {
    const counts = await getTableCounts(connection, selectedConfigs);

    if (!options.apply) {
      const output = {
        mode: 'dry-run',
        source: {
          kind: 'mysql',
        },
        exportDir,
        tables: selectedConfigs.map((config) => config.label),
        counts,
      };

      if (options.json) {
        console.log(JSON.stringify(output, null, 2));
      } else {
        for (const item of counts) {
          console.log(`${item.table}: rows=${item.rowCount}`);
        }
      }
      return;
    }

    await ensureExportDir(exportDir);

    const results = [];
    for (const config of selectedConfigs) {
      results.push(await exportTable(connection, exportDir, config, options.force));
    }

    const output = {
      mode: 'apply',
      source: {
        kind: 'mysql',
      },
      exportDir,
      results,
    };

    if (options.json) {
      console.log(JSON.stringify(output, null, 2));
    } else {
      for (const result of results) {
        console.log(`${result.table}: exported=${result.rowCount}`);
      }
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
