angular.module("app").directive("receipt", receiptDirective);

receiptDirective.$inject = ['mapService'];

function receiptDirective(mapService){
  return {
    templateUrl: "client/dashboard/receipt.tpl",
    restrict: "EA",
    link: function(scope, elem, attrs){
      scope.receipt = JSON.parse(attrs.receiptData);
      scope.receipt.map = mapService(scope.receipt.pickup, scope.receipt.dropoff).getURI();
    }
  };
}