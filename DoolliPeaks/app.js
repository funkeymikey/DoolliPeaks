'use strict';

var peaks = angular.module('peaks', ['ngResource']);

peaks.controller('PeaksCtrl', ['$scope', '$resource', function ($scope, $resource) {

  $resource('http://devapi.doolli.com:8080/devapi/databases/2776').get({ application_key: '4D871AF7-8D27-11E3-94B8-22000A8B101E' }, function (dbData) {

    var items = [];
    for (var i = 0; i < dbData.items.length; i++) {
      var item = dbData.items[i];
      items.push({
        itemId: item.content_item_id,
        rank: _.find(item.fields, function (field) { return field.field_name == 'Rank'; }).field_values[0],
        mountain: _.find(item.fields, function (field) { return field.field_name == 'Mountain'; }).field_values[0]
      });
    }

    $scope.peaks = items;
  });

}]);