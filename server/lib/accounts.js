ServiceConfiguration.configurations.upsert(
  { service: "google" },
  {
    $set: {
      clientId: Meteor.settings.google.client_id,
      secret: Meteor.settings.google.client_secret
    }
  }
);