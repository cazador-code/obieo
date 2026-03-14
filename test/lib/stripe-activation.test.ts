import { describe } from 'node:test'
import * as moduleUnderTest from '@/lib/stripe-activation'

describe('lib/stripe-activation', () => {
  void moduleUnderTest.getPortalLoginUrl
  void moduleUnderTest.getInvitationRedirectUrl
  void moduleUnderTest.getActivationCandidateFromCheckout
  void moduleUnderTest.getActivationCandidateFromInvoice
  void moduleUnderTest.activateCustomer

  describe('getPortalLoginUrl', () => {})
  describe('getInvitationRedirectUrl', () => {})
  describe('getActivationCandidateFromCheckout', () => {})
  describe('getActivationCandidateFromInvoice', () => {})
  describe('activateCustomer', () => {})
})
