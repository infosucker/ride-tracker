// first, remove configuration entry in case service is already configured
ServiceConfiguration.configurations.remove({
  service: "google"
});
ServiceConfiguration.configurations.insert({
  service: "google",
  clientId: Meteor.settings.google.client_id,
  secret: Meteor.settings.google.client_secret,
  loginStyle: "redirect",
  requestOfflineToken: true,
});