Feature: Staff Login

  @smoke
  Scenario: Staff usser can login to Chekku dashboard
    Given I am on the chekku login page
    When I enter valid staff credentials
    And I click on the login button
    Then I should be redirected to the chekku dashboard
