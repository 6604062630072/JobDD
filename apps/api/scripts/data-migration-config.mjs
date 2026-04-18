export const tableConfigs = [
  {
    label: 'users',
    fileName: 'users.json',
    delegate: 'user',
    dependsOn: [],
    dateFields: ['createdAt', 'updatedAt'],
    jsonFields: [],
    booleanFields: [],
    integerFields: [],
  },
  {
    label: 'companies',
    fileName: 'companies.json',
    delegate: 'company',
    dependsOn: ['users'],
    dateFields: ['verifiedAt', 'createdAt'],
    jsonFields: ['socialLinks', 'verificationDocs'],
    booleanFields: ['isVerified'],
    integerFields: [],
  },
  {
    label: 'jobs',
    fileName: 'jobs.json',
    delegate: 'job',
    dependsOn: ['companies'],
    dateFields: ['publishedAt', 'expiresAt', 'createdAt'],
    jsonFields: ['benefits', 'requiredSkills', 'additionalQualifications', 'transportation', 'companyImages'],
    booleanFields: ['salaryVisible', 'canOnlineInterview', 'isQuickApply', 'welcomeRecentGrads'],
    integerFields: ['positions', 'qualificationAgeMin', 'qualificationAgeMax', 'qualificationExperience', 'viewCount'],
  },
  {
    label: 'resumes',
    fileName: 'resumes.json',
    delegate: 'resume',
    dependsOn: ['users'],
    dateFields: ['createdAt'],
    jsonFields: ['experience', 'education', 'skills', 'certifications'],
    booleanFields: ['isPrimary'],
    integerFields: [],
  },
  {
    label: 'user_profiles',
    fileName: 'user_profiles.json',
    delegate: 'userProfile',
    dependsOn: ['users'],
    dateFields: ['birthDate', 'createdAt', 'updatedAt'],
    jsonFields: [],
    booleanFields: [],
    integerFields: [],
  },
  {
    label: 'educations',
    fileName: 'educations.json',
    delegate: 'education',
    dependsOn: ['users'],
    dateFields: ['createdAt', 'updatedAt'],
    jsonFields: [],
    booleanFields: ['hasHonors'],
    integerFields: ['graduationYear'],
  },
  {
    label: 'work_histories',
    fileName: 'work_histories.json',
    delegate: 'workHistory',
    dependsOn: ['users'],
    dateFields: ['createdAt', 'updatedAt'],
    jsonFields: [],
    booleanFields: ['isCurrent'],
    integerFields: [],
  },
  {
    label: 'user_languages',
    fileName: 'user_languages.json',
    delegate: 'userLanguage',
    dependsOn: ['users'],
    dateFields: ['createdAt'],
    jsonFields: [],
    booleanFields: [],
    integerFields: [],
  },
  {
    label: 'language_tests',
    fileName: 'language_tests.json',
    delegate: 'languageTest',
    dependsOn: ['users'],
    dateFields: ['createdAt'],
    jsonFields: [],
    booleanFields: [],
    integerFields: [],
  },
  {
    label: 'certificates',
    fileName: 'certificates.json',
    delegate: 'certificate',
    dependsOn: ['users'],
    dateFields: ['createdAt'],
    jsonFields: [],
    booleanFields: [],
    integerFields: [],
  },
  {
    label: 'applications',
    fileName: 'applications.json',
    delegate: 'application',
    dependsOn: ['jobs', 'users', 'resumes'],
    dateFields: ['interviewDate', 'appliedAt', 'updatedAt'],
    jsonFields: [],
    booleanFields: [],
    integerFields: [],
  },
  {
    label: 'saved_jobs',
    fileName: 'saved_jobs.json',
    delegate: 'savedJob',
    dependsOn: ['jobs', 'users'],
    dateFields: ['savedAt'],
    jsonFields: [],
    booleanFields: [],
    integerFields: [],
  },
  {
    label: 'notifications',
    fileName: 'notifications.json',
    delegate: 'notification',
    dependsOn: ['users'],
    dateFields: ['createdAt'],
    jsonFields: [],
    booleanFields: ['isRead'],
    integerFields: [],
  },
];

export const tableConfigMap = new Map(tableConfigs.map((config) => [config.label, config]));

export function parseTableSelection(rawValue) {
  if (!rawValue) {
    return tableConfigs;
  }

  const requested = rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const unknown = requested.filter((value) => !tableConfigMap.has(value));
  if (unknown.length > 0) {
    throw new Error(`Unknown tables: ${unknown.join(', ')}`);
  }

  return tableConfigs.filter((config) => requested.includes(config.label));
}

export function normalizeRow(config, row) {
  const normalized = { ...row };

  for (const field of config.dateFields) {
    const value = normalized[field];
    if (value === null || value === undefined || value === '') {
      normalized[field] = null;
      continue;
    }
    normalized[field] = value instanceof Date ? value : new Date(value);
  }

  for (const field of config.jsonFields) {
    const value = normalized[field];
    if (value === null || value === undefined || value === '') {
      normalized[field] = null;
      continue;
    }
    normalized[field] = typeof value === 'string' ? JSON.parse(value) : value;
  }

  for (const field of config.booleanFields) {
    const value = normalized[field];
    if (value === null || value === undefined || value === '') {
      normalized[field] = null;
      continue;
    }
    if (value === 1 || value === '1') {
      normalized[field] = true;
      continue;
    }
    if (value === 0 || value === '0') {
      normalized[field] = false;
      continue;
    }
    normalized[field] = Boolean(value);
  }

  for (const field of config.integerFields) {
    const value = normalized[field];
    if (value === null || value === undefined || value === '') {
      normalized[field] = null;
      continue;
    }
    normalized[field] = typeof value === 'number' ? value : Number(value);
  }

  return normalized;
}

export function parseCliArgs(argv) {
  const options = {
    apply: false,
    allowNonEmpty: false,
    exportDir: 'migration-data',
    tables: '',
    batchSize: 200,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--apply') {
      options.apply = true;
      continue;
    }

    if (arg === '--allow-non-empty') {
      options.allowNonEmpty = true;
      continue;
    }

    if (arg === '--json') {
      options.json = true;
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

    if (arg === '--batch-size') {
      options.batchSize = Number(argv[index + 1] ?? '200');
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.exportDir) {
    throw new Error('Missing value for --export-dir');
  }

  if (!Number.isFinite(options.batchSize) || options.batchSize <= 0) {
    throw new Error('Batch size must be a positive number');
  }

  return options;
}
