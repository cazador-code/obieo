import { describe } from 'node:test'
import * as moduleUnderTest from '@/lib/sms-campaign-runner/repository'

describe('lib/sms-campaign-runner/repository', () => {
  void moduleUnderTest.getSmsCampaignDefaults
  void moduleUnderTest.createOrFindSmsCampaignJob
  void moduleUnderTest.listSmsCampaignJobs
  void moduleUnderTest.getSmsCampaignJobDetail
  void moduleUnderTest.enqueueSmsCampaignRun

  describe('getSmsCampaignDefaults', () => {})
  describe('createOrFindSmsCampaignJob', () => {})
  describe('listSmsCampaignJobs', () => {})
  describe('getSmsCampaignJobDetail', () => {})
  describe('enqueueSmsCampaignRun', () => {})
})
