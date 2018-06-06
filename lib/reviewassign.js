// ReviewAssign Mongodb Collection to store details such as review about person (email), review by person (email) & reference to the feedback information

ReviewAssign = new Mongo.Collection('reviewassign');


if (Meteor.isServer) {
  
  ReviewAssign._ensureIndex({"_id": 1, "feedback_id": 1});

  ReviewAssign.allow({
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

  ReviewAssign.deny({
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

  ReviewAssignSchema = new SimpleSchema ({
    reviewby: {
      type: String,
      optional: false,
      custom: function () {
        var email = this.value;
        var exists = Users.findOne({"email":email});
        if (!exists) {
          return "Invalid_Email"
        }
      }
    },
    reviewabout: {
      type: String,
      optional: false,
      custom: function () {
        var email = this.value;
        var exists = Users.findOne({"email":email});
        if (!exists) {
          return "Invalid_Email"
        }
        if (email == this.siblingField('reviewby').value) {
          return "Invalid_Assign"
        }
      }
    },
    feedback_id: {
      type: String,
      optional: false,
      custom: function () {
        var feedback_id = this.value;
        var exists = Feedbacks.findOne({"_id":feedback_id});
        if (!exists) {
          return "Invalid_FeedbackID"
        }
      }
    }
  });

  ReviewAssign.attachSchema(ReviewAssignSchema);
}
