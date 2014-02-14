'use strict';

var peaks = angular.module('peaks', ['ngResource']);


peaks.factory('Databases', ['$resource', function ($resource) {
  return $resource('http://devapi.doolli.com:8080/devapi/databases/:db_id');
  //return $resource('http://localhost:8080/devapi/databases/:db_id');
}]);

peaks.controller('PeaksCtrl', ['$scope', 'Databases', 'FieldMap', function ($scope, Databases, FieldMap) {

  $scope.lastSorter = 'id';

  //gets the data, ordered by the specified field
  $scope.fetchBy = function (sorter) {

    //toggle the sort by if it's the same as the last sort field
    if (sorter === $scope.lastSorter) {
      if ($scope.sortBy === 'asc')
        $scope.sortBy = 'desc';
      else
        $scope.sortBy = 'asc';
    }
    else {
      $scope.sortBy = 'asc';
    }

    $scope.lastSorter = sorter;
    var sortField = FieldMap[sorter];

    Databases.get({
      db_id: 2801,
      application_key: '4D871AF7-8D27-11E3-94B8-22000A8B101E',
      count: 50,
      sort_field_name: sortField,
      sort_by: $scope.sortBy,
      field_filters: !$scope.currentFilter ? null : JSON.stringify([$scope.currentFilter])
    }, function (dbData) {
      $scope.dbData = dbData;

      var fieldMap = {
        rank: _.find(dbData.fields, function (field) { return field.field_name === FieldMap.rank; }).field_id,
        mountain: _.find(dbData.fields, function (field) { return field.field_name === FieldMap.mountain; }).field_id,
        elevation: _.find(dbData.fields, function (field) { return field.field_name === FieldMap.elevation; }).field_id,
        date: _.find(dbData.fields, function (field) { return field.field_name === FieldMap.date; }).field_id,
        companions: _.find(dbData.fields, function (field) { return field.field_name === FieldMap.companions; }).field_id
      };


      var items = [];
      for (var i = 0; i < dbData.items.length; i++) {
        var item = dbData.items[i].field_values;
        items.push({
          itemId: item.content_item_id,
          rank: item[fieldMap.rank][0],
          mountain: item[fieldMap.mountain][0],
          elevation: item[fieldMap.elevation][0],
          date: item[fieldMap.date][0],
          companions: item[fieldMap.companions],
        });
      }

      $scope.peaks = items;
    });
  };

  $scope.setCompanionFilter = function (companion) {
    $scope.currentFilter = { field_name: FieldMap.companions, field_value: companion };

    $scope.fetchBy();
  };

  $scope.fetchBy();

}]);