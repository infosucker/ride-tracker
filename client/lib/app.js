angular.module("app", ["angular-meteor", "ui.router", "ui.bootstrap"]);

angular.module("app").constant("googleConstants", {
  "publicAPIKey": "AIzaSyDD_vuxugMgbOHqfKz_gtuIrkYIzd51vnU",
  "staticMapURI": "https://maps.googleapis.com/maps/api/staticmap?"
});

Accounts.ui.config({
  requestPermissions: {
    google: ['https://www.googleapis.com/auth/gmail.readonly']
  },
  requestOfflineToken: {google: true}
});