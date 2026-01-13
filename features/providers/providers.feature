Feature: Providers navigation

  @smoke
  Scenario: Staff can navigate to Providers from sidebar
    Given I am on the Chekku login screen
    When I login with staff user
    And I click Providers from the sidebar
    Then I should see the Providers page
    When I open the Providers filter panel
    Then I should see the Providers filters

  @regression
  Scenario: Staff can search providers
    Given I am on the Chekku login screen
    When I login with staff user
    And I click Providers from the sidebar
    Then I should see the Providers page
    When I search providers for "Alana"
    Then the providers table should be filtered by "Alana"

  @regression
  Scenario: Staff can clear providers search
    Given I am on the Chekku login screen
    When I login with staff user
    And I click Providers from the sidebar
    Then I should see the Providers page
    When I search providers for "Alana"
    And I clear the providers search
    Then the providers table should show unfiltered results