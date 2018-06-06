import * as RLocalStorage from 'meteor/simply:reactive-local-storage';
import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { mount } from 'react-mounter';

import App from '../imports/ui/App';
import Login from '../imports/components/Login';
import Admin from '../imports/components/Admin';
import Dashboard from '../imports/components/Dashboard';
import NotFound from '../imports/pages/NotFound'

function mountroute(){
  var current_user = RLocalStorage.getItem("current_user");
  if(current_user && typeof current_user === 'object'){
    Meteor.call("validateUserToken", current_user.web_token, current_user.email, function(err,res){
      if(err){
        RLocalStorage.setItem("current_user","");
      }
      else{
        if(res.role=="NON_ADMIN"){
          mount(App, {content: <Dashboard currentEmail={res.email}/>});
        }
        else if(res.role=="ADMIN"){
          mount(App, {content: <Admin currentEmail={res.email}/>});
        }
        else{
          RLocalStorage.setItem("current_user","");
        }
      }
    });
  }
}

FlowRouter.route('/', {
  name: 'Login',
  action() {
    mount(App, {content: <Login />});
  },
});

FlowRouter.route('/admin', {
  name: 'Admin',
  action() {
    mountroute();
  },
});

FlowRouter.route('/dashboard', {
  name: 'Dashboard',
  action() {
    mountroute();
  },
});

FlowRouter.notFound = {
  name: 'NotFound',
  action() {
    mount(App, {content: <NotFound />});
  },
}
