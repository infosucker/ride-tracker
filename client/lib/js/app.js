(function(){
  angular.module("app", ["angular-meteor", "ui.router", "ui.bootstrap", "angulike", "matchmedia-ng"]);

  angular.module("app").constant("googleConstants", {
    "publicAPIKey": "AIzaSyDD_vuxugMgbOHqfKz_gtuIrkYIzd51vnU",
    "staticMapURI": "https://maps.googleapis.com/maps/api/staticmap?"
  });

  angular.module("app").run([
    '$rootScope', function ($rootScope) {
      $rootScope.facebookAppId = '609167502526727'; // set your facebook app id here
    }
  ]);
})();