import path from 'node:path'

export const SMS_CAMPAIGN_RUNNER_ROOT = path.join(process.cwd(), '.tools', 'sms-campaign-runner')
export const SMS_CAMPAIGN_RUNNER_DB_PATH = path.join(SMS_CAMPAIGN_RUNNER_ROOT, 'runner.db')
export const SMS_CAMPAIGN_RUNNER_JOBS_DIR = path.join(SMS_CAMPAIGN_RUNNER_ROOT, 'jobs')
export const SMS_CAMPAIGN_RUNNER_DEFAULT_SOURCE_PATH = '/Users/hunterlapeyre/Downloads/merged.csv'

export const SMS_CAMPAIGN_REQUIRED_HEADERS = [
  'firstName',
  'lastName',
  'phoneNumber',
  'street',
  'city',
  'state',
  'zip',
] as const

export const SMS_CAMPAIGN_REQUIRED_SOURCE_COLUMNS = [
  'firstName',
  'lastName',
  'propertyAddress',
  'phone1',
  'phone1_type',
  'phone2',
  'phone2_type',
  'phone3',
  'phone3_type',
] as const

export const SMS_CAMPAIGN_OPTIONAL_SOURCE_COLUMNS = ['email1', 'email2', 'email3'] as const

export const SMS_CAMPAIGN_MAX_CHUNK_SIZE = 15000
export const SMS_CAMPAIGN_TEXTS_PER_LEAD_OPTIONS = [500, 750, 1000] as const

export const SMS_CAMPAIGN_SOURCE_PROFILE = 'merged_master_v1' as const

