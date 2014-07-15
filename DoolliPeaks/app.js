'use strict';

var peaks = angular.module('peaks', ['ngResource']);

/*
This directive allows us to pass a function in on an enter key to do what we want.
 */
peaks.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});

peaks.factory('Databases', ['$resource', function ($resource) {
  return $resource('http://devapi.doolli.com:8080/devapi/databases/:db_id');
  //return $resource('http://localhost:8080/devapi/databases/:db_id');
}]);

peaks.controller('PeaksCtrl', ['$scope', 'Databases', function ($scope, Databases) {


  //gets the data, ordered by the specified field
  $scope.performSearch = function () {

    Databases.get({
      db_id: 2801,
      application_key: '4D871AF7-8D27-11E3-94B8-22000A8B101E',
      count: 50,
      field_filters: !$scope.currentFilter ? null : JSON.stringify([$scope.currentFilter]),
      sort_by: $scope.sortBy,
      sort_field_name: $scope.sortField,
      query: $scope.query
    }, function (dbData) {
      $scope.dbData = dbData;
      
      var fields = $scope.dbData.fields;

      var fieldMap = {
        rank: _.find($scope.dbData.fields, function (field) { return field.field_name === 'Rank'; }).field_id,
        mountain: _.find($scope.dbData.fields, function (field) { return field.field_name === 'Mountain'; }).field_id,
        elevation: _.find($scope.dbData.fields, function (field) { return field.field_name === 'Elevation (feet)'; }).field_id,
        date: _.find($scope.dbData.fields, function (field) { return field.field_name === 'Ascent Date'; }).field_id,
        companions: _.find($scope.dbData.fields, function (field) { return field.field_name === 'Companions'; }).field_id
      };


      var items = [];
      for (var i = 0; i < $scope.dbData.items.length; i++) {
        var item = $scope.dbData.items[i].field_values;
        items.push({
          itemId: $scope.dbData.items[i].content_item_id,
          rank: item[fieldMap.rank][0],
          mountain: item[fieldMap.mountain][0],
          elevation: item[fieldMap.elevation][0],
          date: item[fieldMap.date][0],
          companions: item[fieldMap.companions],
        });
      }

      $scope.peaks = items;
      $scope.filterCount = $scope.dbData.filtered_item_count;
      $scope.totalCount = $scope.dbData.content_data.item_count;
    });
  };

  $scope.setCompanionFilter = function (companion) {
    $scope.currentFilter = { field_name: 'Companions', field_value: companion };

    $scope.performSearch();
  };

  $scope.clearFilters = function () {
    $scope.currentFilter = null;
    $scope.query = null;

    $scope.performSearch();
  };


  $scope.setSort = function(fieldName) {
    //toggle the sort by if it's the same as the last sort field
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

  $scope.performSearch();

}]);