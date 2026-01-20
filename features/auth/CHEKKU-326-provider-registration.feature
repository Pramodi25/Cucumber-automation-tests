@smoke @e2e
Feature: Provider Registration

  @CHEKKU_326
  Scenario: CHEKKU-326 Verify provider registration
      Given I am on the Chekku registration page
      Then I should see the registration page with required fields
      When I complete the provider registration form with valid details
      And I submit the registration
      Then I should be redirected to the "One step closer" page