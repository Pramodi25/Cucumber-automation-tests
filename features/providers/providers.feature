Feature: Providers navigation

  @smoke
  Scenario: Staff can navigate to Providers from sidebar
    Given I am on the Chekku login screen
    When I login with staff user
    And I click Providers from the sidebar
    Then I should see the Providers page
    When I open the Providers filter panel
    Then I should see the Providers filters
