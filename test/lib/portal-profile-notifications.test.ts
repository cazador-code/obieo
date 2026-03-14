import { describe } from 'node:test'
import * as moduleUnderTest from '@/lib/portal-profile-notifications'

describe('lib/portal-profile-notifications', () => {
  void moduleUnderTest.sendPortalProfileChangeNotification
  void moduleUnderTest.sendPortalZipChangeRequestNotification

  describe('sendPortalProfileChangeNotification', () => {})
  describe('sendPortalZipChangeRequestNotification', () => {})
})
