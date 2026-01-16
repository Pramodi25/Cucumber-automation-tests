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

  Scenario: Provider filters work correctly
    Given I am on the Chekku login screen
    When I login with staff user
    And I click Providers from the sidebar
    Then I should see the Providers page
    When I open the Providers filter panel
    Then I should see the Providers filters
    Then the Sub Trade Type filter should be disabled
    When I select Core Trade Type as "Plumber"
    Then the Sub Trade Type filter should be enabled
    When I apply provider filters
    When I clear provider filters
    Then provider filters should be reset

  @profile
  Scenario: Search provider and open profile
    Given I am on the Chekku login screen
    When I login with staff user
    And I click Providers from the sidebar
    Then I should see the Providers page
    When I search provider name "john.smith"
    And I open provider profile for "john.smith"
    Then I should see the Provider profile page

    @profile
    Scenario: Provider profile top buttons navigate correctly
      Given I am on the Chekku login screen
      When I login with staff user
      And I click Providers from the sidebar
      Then I should see the Providers page
      When I search provider name "john.smith"
      And I open provider profile for "john.smith"
      Then I should see the Provider profile page
      Then provider profile top buttons should navigate correctly

    @profile
     Scenario: Staff can update provider first and last name
       Given I am on the Chekku login screen
       When I login with staff user
       And I click Providers from the sidebar
       Then I should see the Providers page
       When I search provider name "john.smith"
       And I open provider profile for "john.smith"
       Then I should see the Provider profile page
       When I click update button on provider profile
       And I update provider first name to "Malik" and last name to "Silva"
       Then I should see updated provider name "Malik Silva" on profile page