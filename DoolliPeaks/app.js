'use strict';

var peaks = angular.module('peaks', ['ngResource', 'ui-rangeSlider']);

peaks.factory('Databases', ['$resource', function ($resource) {
  return $resource('http://devapi.doolli.com:8080/devapi/databases/:db_id');
  //return $resource('http://localhost:8080/devapi/databases/:db_id');
}]);

peaks.controller('PeaksCtrl', ['$scope', '$filter', 'Databases', function ($scope, $filter, Databases) {

  var handleSearchResults = function (dbData) {
    $scope.dbData = dbData;
  
    var fields = $scope.dbData.fields;

    var fieldMap = {
      rank: _.find(fields, function (field) { return field.field_name === 'Rank'; }).field_id,
      mountain: _.find(fields, function (field) { return field.field_name === 'Mountain'; }).field_id,
      elevation: _.find(fields, function (field) { return field.field_name === 'Elevation (feet)'; }).field_id,
      date: _.find(fields, function (field) { return field.field_name === 'Ascent Date'; }).field_id,
      companions: _.find(fields, function (field) { return field.field_name === 'Companions'; }).field_id
    };

    var items = [];
    for (var i = 0; i < $scope.dbData.items.length; i++) {
      var item = $scope.dbData.items[i];
      items.push({
        itemId: item.content_item_id,
        rank: parseInt(item.field_values[fieldMap.rank][0]),
        mountain: item.field_values[fieldMap.mountain][0],
        elevation: parseInt(item.field_values[fieldMap.elevation][0]),
        date: !item.field_values[fieldMap.date][0] ? null : new Date(Date.parse(item.field_values[fieldMap.date][0])),
        companions: item.field_values[fieldMap.companions]
      });
    }

    $scope.peaks = items;
    $scope.filterCount = $scope.dbData.filtered_item_count;
    $scope.totalCount = $scope.dbData.content_data.item_count;

    //if we're not filtering out any results, then set the filter options
    if($scope.filterCount === $scope.totalCount){
      $scope.ranks.floor = _.min(items, function(item){ return item.rank; }).rank;
      $scope.ranks.ceiling = _.max(items, function(item){ return item.rank; }).rank;
      $scope.elevations.floor = _.min(items, function(item){ return item.elevation; }).elevation;
      $scope.elevations.ceiling = _.max(items, function(item){ return item.elevation; }).elevation;
      $scope.dates.floor = _.min(_.filter(items, function(item){ return item.date; }), function(item) { return item.date; }).date;
      $scope.dates.ceiling = _.max(_.filter(items, function(item){ return item.date; }), function(item) { return item.date; }).date;

      resetFilters();
    }
  };

  var resetFilters = function () {
    $scope.companionFilter = null;
    $scope.query = null;
    $scope.rankFilter.min_value = $scope.ranks.floor;
    $scope.rankFilter.max_value = $scope.ranks.ceiling;
    $scope.elevationFilter.min_value = $scope.elevations.floor;
    $scope.elevationFilter.max_value = $scope.elevations.ceiling;
    $scope.dateFilter.min_value = $filter('date')($scope.dates.floor, 'yyyy-MM-dd');
    $scope.dateFilter.max_value = $filter('date')($scope.dates.ceiling, 'yyyy-MM-dd');
  };


  $scope.performSearch = function () {

    var searchParams = {
      db_id: 2801,
      application_key: '4D871AF7-8D27-11E3-94B8-22000A8B101E',
      count: 50,
      sort_by: $scope.sortBy,
      sort_field_name: $scope.sortField,
      query: $scope.query
    };

    //add in the field filter if necessary
    if($scope.companionFilter)
      searchParams.field_filters = JSON.stringify([$scope.companionFilter]);

    //figure out if any numeric filters should be passed along
    var numericFilters = [];
    if($scope.rankFilter.min_value !== $scope.ranks.floor ||
      $scope.rankFilter.max_value !== $scope.ranks.ceiling)
      numericFilters.push($scope.rankFilter);
    if($scope.elevationFilter.min_value !== $scope.elevations.floor ||
      $scope.elevationFilter.max_value !== $scope.elevations.ceiling)
      numericFilters.push($scope.elevationFilter);
    if(numericFilters.length !== 0)
      searchParams.numeric_filters = JSON.stringify(numericFilters);

    //do the date filter if necessary
    var inputtedMinDate = $filter('date')($scope.dateFilter.min_value, 'M/d/yyyy');
    var inputtedMaxDate = $filter('date')($scope.dateFilter.max_value, 'M/d/yyyy');
    var floorDate = $filter('date')($scope.dates.floor, 'M/d/yyyy');
    var ceilingDate = $filter('date')($scope.dates.ceiling, 'M/d/yyyy');
    if(inputtedMinDate !== floorDate || inputtedMaxDate !== ceilingDate){
      searchParams.date_time_filters = JSON.stringify([{
        field_name:'Ascent Date',
        min_value: inputtedMinDate,
        max_value: inputtedMaxDate,
      }]);
    }

    //do the search
    Databases.get(searchParams, handleSearchResults);
  };

  $scope.setCompanionFilter = function (companion) {
    $scope.companionFilter = { field_name: 'Companions', field_value: companion };

    $scope.performSearch();
  };

  $scope.resetFilters = function(){
    resetFilters();

    $scope.performSearch();
  }

  $scope.setSort = function(fieldName) {
    //toggle the sort direction if it's the same as the last sort field
    if (fieldName === $scope.sortField) {
      if ($scope.sortBy === 'asc')
        $scope.sortBy = 'desc';
      else
        $scope.sortBy = 'asc';
    }
    else {
      $scope.sortBy = 'asc';
    }

    $scope.sortField = fieldName;
    $scope.performSearch();
  };

  $scope.toggleFilters = function() {
    if($scope.filterAction === 'Show'){
      $scope.filterAction = 'Hide';
    } else {
      $scope.filterAction = 'Show';
    }
  }


  var initialize = (function() {
    $scope.filterAction = 'Show';

    $scope.ranks = {floor: 0, ceiling: 0};
    $scope.elevations = {floor: 0, ceiling: 0};
    $scope.dates = {floor: 0, ceiling: 0};

    $scope.rankFilter = {field_name: 'Rank', min_value: 0, max_value: 0};
    $scope.elevationFilter = {field_name: 'Elevation (feet)', min_value: 0, max_value: 0};
    $scope.dateFilter = {min_value: 0, max_value: 0};

    $scope.performSearch();
  }());




}]);