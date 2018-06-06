const NodeCrypto = require('./nodecrypto');
const bodyParser = require('body-parser');


Meteor.startup(() => {

  // Create Admin User for the first time
  var admin_user = Users.findOne({"email":"admin@admin.com"});
  if(!admin_user){
    var passwordcrypted = NodeCrypto.encrypt("admin");
    var user = Users.insert({
      username: "admin",
      email: "admin@admin.com",
      password: passwordcrypted,
      role: "ADMIN"
    });
  }

  // Server side API
  const express = require('express');
  const app = express();
  app.use(bodyParser.json()); // support json encoded bodies
  app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
  app.post('/api/admin/register', Meteor.bindEnvironment(function(req, res){
    var token;
    if(!req.body.username || !req.body.email || !req.body.password){
      res.status(400).send("Username, Email & Password are required");
    }
    else{
      try{
        token = Meteor.call("createUser",req.body.username,req.body.email,req.body.password,true);
        res.status(201).send(token);
      }
      catch(error){
        var error = error.error;
        if(error.serverErrorMsg == "EMAIL_EXISTS"){
          res.status(409).send("EmailID already been registered!");
        }
        else{
          res.status(500).send(error);
        }
      }
    }
  }));
  app.post('/api/employee/register', Meteor.bindEnvironment(function(req, res){
    var token;
    if(!req.body.username || !req.body.email || !req.body.password){
      res.status(400).send("Username, Email & Password are required");
    }
    else{
      try{
        token = Meteor.call("createUser",req.body.username,req.body.email,req.body.password);
        res.status(201).send(token);
      }
      catch(error){
        var error = error.error;
        if(error.serverErrorMsg == "EMAIL_EXISTS"){
          res.status(409).send("EmailID already been registered!");
        }
        else{
          res.status(500).send(error);
        }
      }
    }
  }));
  app.delete('/api/employee/delete', Meteor.bindEnvironment(function(req, res){
    var token;
    if(!req.body.email){
      res.status(400).send("Email is required");
    }
    else{
      try{
        token = Meteor.call("deleteUser",req.body.email);
        res.status(201).send(token);
      }
      catch(error){
        var error = error.error;
        if(error == "EMAIL_NOT_EXISTS"){
          res.status(409).send("EmailID not been registered yet!");
        }
        else{
          res.status(500).send(error);
        }
      }
    }
  }));
  app.post('/api/review/assign', Meteor.bindEnvironment(function(req, res){
    var token;
    if(!req.body.reviewby || !req.body.reviewabout){
      res.status(400).send("EmailId of employees are required");
    }
    else{
      try{
        token = Meteor.call("assignReview",req.body.reviewby,req.body.reviewabout);
        res.status(201).send(token);
      }
      catch(error){
        var error = error.error;
        if(error == "INVALID_EMAIL"){
          res.status(409).send("Invalid EmailIDs");
        }
        else if(error == "REVIEW_ALREADY_ASSIGNED"){
          res.status(409).send("There is already a review assigned for given email ids!");
        }
        else if(error == "CANNOT_REVIEW_ADMIN"){
          res.status(409).send("Admin cannot be reviewed!");
        }
        else{
          res.status(500).send(error);
        }
      }
    }
  }));
  app.post('/api/review/unassign', Meteor.bindEnvironment(function(req, res){
    var token;
    if(!req.body.reviewby || !req.body.reviewabout){
      res.status(400).send("EmailId of employees are required");
    }
    else{
      try{
        token = Meteor.call("unassignReview",req.body.reviewby,req.body.reviewabout);
        res.status(201).send(token);
      }
      catch(error){
        var error = error.error;
        if(error == "EMAIL_NOT_EXISTS"){
          res.status(409).send("EmailID not been registered yet!");
        }
        else if(error == "REVIEW_HAS_NOT_ALREADY_ASSIGNED"){
          res.status(409).send("Review has not been already assigned for given email ids!");
        }
        else{
          res.status(500).send(error);
        }
      }
    }
  }));
  WebApp.connectHandlers.use(app);

});
