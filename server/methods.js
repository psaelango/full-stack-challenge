const NodeCrypto = require('./nodecrypto');
const jwt = require('jsonwebtoken');

Meteor.methods({
  /**
   * @param
   *  username @required
   *  email @required
   *  password @required
   *  admin @boolean
   * @returns
   *  token
   */
  'createUser': function(username,email,password,admin){
      try{
        if(!username || !password || !email){
          throw {serverErrorMsg: "Username and/or Password cannot be empty"};
        }
        var checkQuery = Users.findOne({"email":email});
        if(checkQuery && Object.keys(checkQuery).length > 0){
          throw {serverErrorMsg: "EMAIL_EXISTS"};
        }
        else{
          var passwordcrypted = NodeCrypto.encrypt(password);
          var user = Users.insert({
            username: username,
            email: email,
            password: passwordcrypted,
            role: admin ? "ADMIN" : "NON_ADMIN"
          });
          return jwt.sign({email,passwordcrypted}, NodeCrypto.secretkey, { expiresIn: '1h' });
        }
      }
      catch(error){
        console.log(">> ERROR: createUser: ",error)
        if(error.serverErrorMsg){
          throw new Meteor.Error(error);
        }
        else if(error.error){
          throw new Meteor.Error(error.error);
        }
        else{
          throw new Meteor.Error({mongoErrorMsg: error});
        }
      }
  },
  /**
   * @param
   *  email @required
   *  password @required
   * @returns
   *  token
   */
  'passwordAuthenticate': function(email,password){
      try{
        if(!email || !password){
          throw {serverErrorMsg: "Email and/or Password cannot be empty"};
        }
        var checkUser = Users.findOne({email:email});
        if(!checkUser){
          throw {serverErrorMsg: "INVALID_EMAIL"};
        }
        else{
          var passwordcrypted = checkUser.password;
          try{
            var passworddecrypted = NodeCrypto.decrypt(password,passwordcrypted);
            return jwt.sign({email,passwordcrypted}, NodeCrypto.secretkey, { expiresIn: '1h' });
          }
          catch(error){
            throw {serverErrorMsg: "INVALID_PASSWORD"};
          }
        }
      }
      catch(error){
        console.log(">> ERROR: createUser: ",error)
        if(error.serverErrorMsg){
          throw new Meteor.Error(error);
        }
        else if(error.error){
          throw new Meteor.Error(error.error);
        }
        else{
          throw new Meteor.Error({mongoErrorMsg: error});
        }
      }
  },
  /**
   * @param
   *  token @required
   * @returns
   *  user information
   */
  'validateUserToken': function(token,email){
    return new Promise((resolve,reject)=>{
      jwt.verify(token, NodeCrypto.secretkey, (error, authData) => {
        if(error) {
          console.log(error);
          reject(new Meteor.Error("INVALID_TOKEN"));
        } 
        else {
          var result;
          var user = Users.findOne({"email":email});
          // if(user.role == "ADMIN"){
          //   result = "/admin"
          // }
          // else{
          //   result = "/dashboard"
          // }
          resolve({
            email: user.email,
            role: user.role
          });
        }
      });
    });
  },
  /**
   * @param
   *  email @required
   * @returns
   *  1 if success 
   */
  'deleteUser': function(email){
    try{
      var result = Users.remove({"email":email});
      if(result == 0){
        throw "EMAIL_NOT_EXISTS"
      }
      var feedback_ids = [];
      var review_ids = [];
      ReviewAssign.find({$or:[
        {"reviewby": email},
        {"reviewabout": email},
      ]}).fetch().map(x => {
        if(!Feedbacks.findOne({"_id":x.feedback_id}).submitted){
          feedback_ids.push(x.feedback_id);
          review_ids.push(x._id)
        }
      });
      ReviewAssign.remove({"_id":{$in:review_ids}});
      Feedbacks.remove({"_id":{$in:feedback_ids}});
    }
    catch(error){
      throw new Meteor.Error(error);
    }
    return result;
  },
  /**
   * @param
   *  email @required
   *  oldPassword @required
   *  newPassword @required
   * @returns
   *  1 if success
   */
  'changePassword': function(email,oldPassword,newPassword){
    try{
      if(!email || !oldPassword || !newPassword){
        throw {serverErrorMsg: "Email, old password and new password are required"};
      }
      var checkUser = Users.findOne({"email":email});
      if(!checkUser){
        throw {serverErrorMsg: "INVALID_EMAIL"};
      }
      else{
        var passwordcrypted = checkUser.password;
        try{
          NodeCrypto.decrypt(oldPassword,passwordcrypted);
        }
        catch(error){
          throw {serverErrorMsg: "INVALID_PASSWORD"};
        }
        var passwordcrypted = NodeCrypto.encrypt(newPassword);
        var user = Users.update({"email":email},{$set:{
          password: passwordcrypted,
        }});
        return jwt.sign({email,passwordcrypted}, NodeCrypto.secretkey, { expiresIn: '1h' });
      }
    }
    catch(error){
      console.log(">> ERROR: createUser: ",error)
      if(error.serverErrorMsg){
        throw new Meteor.Error(error);
      }
      else if(error.error){
        throw new Meteor.Error(error.error);
      }
      else{
        throw new Meteor.Error({mongoErrorMsg: error});
      }
    }
  },
  /**
   * @param
   *  reviewby @required (email)
   *  reviewabout @required (email)
   * @returns
   *  feedback document id
   */
  'assignReview': function(reviewby,reviewabout){
    try{
      var checkUsers = Users.find({"email":{$in:[reviewby,reviewabout]}}).fetch();
      if(checkUsers.length != 2){
        throw "INVALID_EMAIL";
      }
      if(checkUsers[0].role == "ADMIN" || checkUsers[1].role == "ADMIN"){
        throw "CANNOT_REVIEW_ADMIN"
      }
      var feedback_ids = ReviewAssign.find({$and:[
        {"reviewby": reviewby},
        {"reviewabout": reviewabout},
      ]}).fetch().map(x=>x.feedback_id);

      var current_feedback = Feedbacks.findOne({$and:[
        {"_id": {$in:feedback_ids}},
        {"submitted": false},
      ]});

      if(current_feedback){
        throw "REVIEW_ALREADY_ASSIGNED";
      }
      var feedback_id = Feedbacks.insert({"submitted":false});
      var result = ReviewAssign.insert({
        "reviewby": reviewby,
        "reviewabout": reviewabout,
        "feedback_id": feedback_id
      });
    }
    catch(error){
      throw new Meteor.Error(error);
    }
    return result;
  },
  /**
   * @param
   *  reviewby @required (email)
   *  reviewabout @required (email)
   * @returns
   *  1 if success
   */
  'unassignReview': function(reviewby,reviewabout){
    try{
      var checkUsers = Users.find({"email":{$in:[reviewby,reviewabout]}}).fetch();
      if(checkUsers.length != 2){
        throw "EMAIL_NOT_EXISTS";
      }

      var feedback_ids = ReviewAssign.find({$and:[
        {"reviewby": reviewby},
        {"reviewabout": reviewabout},
      ]}).fetch().map(x=>x.feedback_id);

      if(feedback_ids.length == 0){
        throw "REVIEW_HAS_NOT_ALREADY_ASSIGNED";
      }

      var current_feedback = Feedbacks.find({$and:[
        {"_id": {$in:feedback_ids}},
        {"submitted": false},
      ]}).fetch();

      if(current_feedback.length != 1){
        throw "IMPOSSIBLE"
      }

      var result = ReviewAssign.remove({
        "reviewby": reviewby,
        "reviewabout": reviewabout,
        "feedback_id": current_feedback[0]._id
      });

      var result = Feedbacks.remove({"_id":current_feedback[0]._id});
    }
    catch(error){
      console.log(error);
      throw new Meteor.Error(error);
    }
    return result;
  },
  /**
   * @param
   *  id @required (feedback document id)
   *  content @required (string)
   * @returns
   *  updated feedback document id
   */
  'saveFeedback': function(id,content){
    try{
      var result = Feedbacks.update({"_id":id},{$set:{feedback:content}});
    }
    catch(error){
      throw new Meteor.Error(error);
    }
    return result;
  },
  /**
   * @param
   *  id @required (feedback document id)
   *  content @required (string)
   * @returns
   *  updated feedback document id
   */
  'submitFeedback': function(id,content){
    try{
      var result = Feedbacks.update({"_id":id},{$set:{submitted:true,feedback:content}});
    }
    catch(error){
      throw new Meteor.Error(error);
    }
    return result;
  }
})