import { describe } from 'node:test'
import * as moduleUnderTest from '@/lib/airtable-client-zips'

describe('lib/airtable-client-zips', () => {
  void moduleUnderTest.checkAirtableZipConflictsForApproval
  void moduleUnderTest.syncApprovedZipCodesToAirtable
  void moduleUnderTest.syncPortalProfileToAirtable

  describe('checkAirtableZipConflictsForApproval', () => {})
  describe('syncApprovedZipCodesToAirtable', () => {})
  describe('syncPortalProfileToAirtable', () => {})
})
