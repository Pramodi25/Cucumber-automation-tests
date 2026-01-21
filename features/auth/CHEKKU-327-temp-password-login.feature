@smoke @e2e
Feature: Provider Registration

  Background:
      Given I am on the Chekku registration page
      Then I should see the registration page with required fields

  @CHEKKU_326
  Scenario: CHEKKU-326 Verify provider registration
      When I complete the provider registration form with valid details
      And I submit the registration
      Then I should be redirected to the "One step closer" page

  @CHEKKU_327
  Scenario: CHEKKU-237 Login using temporary password from email
      When I complete the provider registration form with a new Mailinator email
      And I submit the registration
      Then I should be redirected to the "One step closer" page

      When I open the Mailinator inbox and read the temporary password
      And I navigate to the Sign In page
      And I login with the Mailinator email and temporary password
      Then I should see the "Change your password !" page
