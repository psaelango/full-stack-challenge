// Users Mongodb Collection to store user details such as username, email, encrypted password & role

Users = new Mongo.Collection('users');


if (Meteor.isServer) {
  
  Users._ensureIndex({"_id": 1, "email": 1, "username": 1});

  Users.allow({
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

  Users.deny({
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

  UserSchema = new SimpleSchema ({
    email: {
      type: String,
      optional: false
    },
    password: {
      type: String,
      optional: false
    },
    username: {
      type: String,
      optional: false
    },
    role: {
      type: String,
      optional: false,
      custom: function () {
        var allowed_strings = ["ADMIN","NON_ADMIN"];
        if (allowed_strings.indexOf(this.value) == -1) {
          return "Invalid_Role"
        }
      }
    },
  });

  Users.attachSchema(UserSchema);
}
