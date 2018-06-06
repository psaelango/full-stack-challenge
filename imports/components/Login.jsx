import React, {Component} from 'react';
import * as RLocalStorage from 'meteor/simply:reactive-local-storage';

export default class Login extends Component{
  constructor(props){
    super(props);
    // STATE:
    this.state={
      loginEmail: "",
      loginPassword: ""
    };
    // FUNCTION BINDINGS
    this.handleChange = this.handleChange.bind(this);
    this.clickSignIn = this.clickSignIn.bind(this);
  }
  handleChange(event) {
    this.setState({[event.target.id]: event.target.value});
  }
  clickSignIn(event){
    event.preventDefault();
    console.log(event);
    var email = event.target.loginEmail.value;
    var password = event.target.loginPassword.value;
    Meteor.call('passwordAuthenticate', email, password, (error,response)=>{
      if(error){
        if(error.error){
          error = error.error;
        }
        console.log(">> passwordAuthenticate Error - ",error);
        if(error.serverErrorMsg == "INVALID_EMAIL"){
          alert("Email ID does not exists!");
        }
        else if(error.serverErrorMsg == "INVALID_PASSWORD"){
          alert("Wrong Password!!!")
        }
      }
      else{
        console.log(">> passwordAuthenticate Response - ", response);
        var current_user = {};
        current_user.web_token = response;
        current_user.email = email;
        RLocalStorage.setItem("current_user",current_user);// This triggers the tracker.autorun
      }
    });
  }
  render(){
    return(
      <div className="col-sm-12" style={{ width:"100%", textAlign:"center" }}>
        <div id="container" className="row">
          <br/>
          <br/>
          <h1>Sign in</h1>
          <div className="row">
            <div className="col-sm-2">
            </div>
            <div className="col-sm-8">
              <form className="form" onSubmit={this.clickSignIn}>
                <input type="email" id="loginEmail" placeholder="Email" value={this.state.loginEmail} onChange={this.handleChange} required/>
                <input type="password" id="loginPassword" placeholder="Password" value={this.state.loginPassword} onChange={this.handleChange} required/>
                <button type="submit" value="submit">Sign In</button>
              </form>
            </div>
            <div className="col-sm-2">
            </div>
          </div>
        </div>
      </div>
    );
  }
}
