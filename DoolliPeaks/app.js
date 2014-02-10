'use strict';

var peaks = angular.module('peaks', ['ngResource']);


peaks.factory('Databases', ['$resource', function ($resource) {
  return $resource('http://devapi.doolli.com:8080/devapi/databases/:dbId');
}]);

peaks.factory('FieldMap', [function () {
  return {
    id: null,
    rank: 'Rank',
    mountain: 'Mountain',
    elevation: 'Elevation (feet)',
    date: 'Ascent Date'
  };
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

    Databases.get({ dbId: 2776, application_key: '4D871AF7-8D27-11E3-94B8-22000A8B101E', count: 50, sort_field_name: sortField, sort_by: $scope.sortBy }, function (dbData) {
      $scope.dbData = dbData;
      var items = [];
      for (var i = 0; i < dbData.items.length; i++) {
        var item = dbData.items[i];
        items.push({
          itemId: item.content_item_id,
          rank: _.find(item.fields, function (field) { return field.field_name === FieldMap.rank; }).field_values[0],
          mountain: _.find(item.fields, function (field) { return field.field_name === FieldMap.mountain; }).field_values[0],
          elevation: _.find(item.fields, function (field) { return field.field_name === FieldMap.elevation; }).field_values[0],
          date: _.find(item.fields, function (field) { return field.field_name === FieldMap.date; }).field_values[0]
        });
      }

      $scope.peaks = items;
    });
  };

  $scope.fetchBy();

}]);