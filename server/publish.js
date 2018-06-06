/**
 * Publishing user information based on the role (ADMIN || NON-ADMIN)
 */
Meteor.publish('users', function (email) {
  var current_user = Users.findOne({"email":email})
  if(current_user.role == "ADMIN"){
    return Users.find({},{fields: {password:0}});
  }
  else if(current_user.role == "NON_ADMIN"){
    return Users.find({"email":email},{fields: {password:0}});
  }
});

/**
 * Publishing review and feedback information based on the role (ADMIN || NON-ADMIN)
 */
publishComposite('reviews', function (email) {
  return {
    find() {
      var current_user = Users.findOne({"email":email})
      if(current_user.role == "ADMIN"){
        return ReviewAssign.find({});
      }
      else if(current_user.role == "NON_ADMIN"){
        return ReviewAssign.find({"reviewby":email});
      }
    },
    children: [
      {
        find(review) {
          return Feedbacks.find({"_id":review.feedback_id});
        }
      }
    ]
  }
});