Feature: Staff Login

  @smoke
  Scenario: Staff user can login to Chekku dashboard
    Given I am on the Chekku login screen
    When I login with staff user
    Then I should be on the dashboard
