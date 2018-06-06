// Feedbacks Mongodb Collection to store details content of the feedback & status of the feedback (submitted or not)

Feedbacks = new Mongo.Collection('feedbacks');


if (Meteor.isServer) {
  
  Feedbacks._ensureIndex({"_id": 1, "email": 1, "username": 1});

  Feedbacks.allow({
    insert: function (userId, doc) {
      return true;
    },

    update: function (userId, doc, fieldNames, modifier) {
      return true;
    },

    remove: function (userId, doc) {
      return true;
    }
  });

  Feedbacks.deny({
    insert: function (userId, doc) {
      return false;
    },

    update: function (userId, doc, fieldNames, modifier) {
      return false;
    },

    remove: function (userId, doc) {
      return false;
    }
  });

  FeedbackSchema = new SimpleSchema ({
    feedback: {
      type: String,
      optional: true
    },
    submitted: {
      type: Boolean,
      optional: false
    }
  });

  Feedbacks.attachSchema(FeedbackSchema);
}
