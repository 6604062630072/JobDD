import fs from 'node:fs/promises';

function toCamelCaseKey(key) {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function decodeEscapedCharacter(char) {
  switch (char) {
    case '0':
      return '\0';
    case 'b':
      return '\b';
    case 'n':
      return '\n';
    case 'r':
      return '\r';
    case 't':
      return '\t';
    case 'Z':
      return String.fromCharCode(26);
    case '\\':
      return '\\';
    case "'":
      return "'";
    case '"':
      return '"';
    default:
      return char;
  }
}

function parseSqlString(input, startIndex) {
  let index = startIndex + 1;
  let value = '';

  while (index < input.length) {
    const char = input[index];

    if (char === '\\') {
      const nextChar = input[index + 1] ?? '';
      value += decodeEscapedCharacter(nextChar);
      index += 2;
      continue;
    }

    if (char === "'") {
      if (input[index + 1] === "'") {
        value += "'";
        index += 2;
        continue;
      }

      return {
        value,
        nextIndex: index + 1,
      };
    }

    value += char;
    index += 1;
  }

  throw new Error('Unterminated SQL string literal in dump file');
}

function convertLiteral(token) {
  const trimmed = token.trim();

  if (!trimmed) {
    return null;
  }

  if (/^null$/i.test(trimmed)) {
    return null;
  }

  if (/^-?\d+$/.test(trimmed)) {
    const parsed = Number(trimmed);
    return Number.isSafeInteger(parsed) ? parsed : trimmed;
  }

  if (/^-?\d+\.\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

function parseValuesBlock(input) {
  const rows = [];
  let index = 0;

  while (index < input.length) {
    while (index < input.length && /[\s,]/.test(input[index])) {
      index += 1;
    }

    if (index >= input.length) {
      break;
    }

    if (input[index] !== '(') {
      throw new Error(`Expected tuple start at index ${index}`);
    }

    index += 1;
    const row = [];

    while (index < input.length) {
      while (index < input.length && /\s/.test(input[index])) {
        index += 1;
      }

      if (input[index] === "'") {
        const parsed = parseSqlString(input, index);
        row.push(parsed.value);
        index = parsed.nextIndex;
      } else {
        let tokenStart = index;
        while (index < input.length && input[index] !== ',' && input[index] !== ')') {
          index += 1;
        }
        row.push(convertLiteral(input.slice(tokenStart, index)));
      }

      while (index < input.length && /\s/.test(input[index])) {
        index += 1;
      }

      if (input[index] === ',') {
        index += 1;
        continue;
      }

      if (input[index] === ')') {
        index += 1;
        break;
      }

      throw new Error(`Unexpected token in values block at index ${index}`);
    }

    rows.push(row);
  }

  return rows;
}

function extractInsertStatements(sql) {
  const statements = [];
  let searchIndex = 0;

  while (true) {
    const insertIndex = sql.indexOf('INSERT INTO `', searchIndex);
    if (insertIndex === -1) {
      break;
    }

    const tableNameStart = insertIndex + 'INSERT INTO `'.length;
    const tableNameEnd = sql.indexOf('`', tableNameStart);
    const tableName = sql.slice(tableNameStart, tableNameEnd);

    const columnsStart = sql.indexOf('(', tableNameEnd);
    const columnsEnd = sql.indexOf(')', columnsStart);
    const columnsSegment = sql.slice(columnsStart + 1, columnsEnd);
    const columns = Array.from(columnsSegment.matchAll(/`([^`]+)`/g), (match) => match[1]);

    const valuesKeywordIndex = sql.indexOf('VALUES', columnsEnd);
    let cursor = valuesKeywordIndex + 'VALUES'.length;
    let inString = false;

    while (cursor < sql.length) {
      const char = sql[cursor];
      const previous = sql[cursor - 1];

      if (char === "'" && previous !== '\\') {
        inString = !inString;
      }

      if (char === ';' && !inString) {
        break;
      }

      cursor += 1;
    }

    const valuesSegment = sql.slice(valuesKeywordIndex + 'VALUES'.length, cursor);
    statements.push({
      tableName,
      columns,
      valuesSegment,
    });

    searchIndex = cursor + 1;
  }

  return statements;
}

export async function loadRowsFromDumpFile(dumpFilePath, selectedTableLabels) {
  const sql = await fs.readFile(dumpFilePath, 'utf8');
  const requestedTables = new Set(selectedTableLabels);
  const rowsByTable = new Map();

  for (const statement of extractInsertStatements(sql)) {
    if (!requestedTables.has(statement.tableName)) {
      continue;
    }

    const parsedRows = parseValuesBlock(statement.valuesSegment).map((row) =>
      Object.fromEntries(
        statement.columns.map((column, index) => [toCamelCaseKey(column), row[index] ?? null]),
      ),
    );

    const existingRows = rowsByTable.get(statement.tableName) ?? [];
    rowsByTable.set(statement.tableName, existingRows.concat(parsedRows));
  }

  return rowsByTable;
}
