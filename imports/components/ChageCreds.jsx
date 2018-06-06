import React, {Component} from 'react';
import * as RLocalStorage from 'meteor/simply:reactive-local-storage';

export default class ChageCreds extends Component{
  constructor(props){
    super(props);
    // STATE:
    this.state={
      oldPassword: "",
      newPassword: ""
    };
    // FUNCTION BINDINGS
    this.handleChange = this.handleChange.bind(this);
    this.clickCreate = this.clickCreate.bind(this);
  }
  handleChange(event) {
    this.setState({[event.target.id]: event.target.value});
  }
  clickCreate(event){
    event.preventDefault();
    var oldPassword = event.target.oldPassword.value;
    var newPassword = event.target.newPassword.value;
    if(oldPassword == newPassword){
      alert("Old password & New password cannot be same!");
    }
    Meteor.call('changePassword', this.props.currentEmail, oldPassword, newPassword, (error,response)=>{
      if(error){
        if(error.error){
          error = error.error;
        }
        if(error.serverErrorMsg == "INVALID_EMAIL"){
          alert("Wrong Email");
        }
        else if(error.serverErrorMsg == "INVALID_PASSWORD"){
          alert("Wrong Password!!!")
        }
      }
      else{
        console.log(">> passwordAuthenticate Response - ", response);
        var current_user = {};
        current_user.web_token = response;
        current_user.email = this.props.currentEmail;
        RLocalStorage.setItem("current_user",current_user);
        alert("Password Changed Successfully!")
      }
    });
  }
  render(){
    return(
      <div className="col-sm-12" style={{ width:"100%", textAlign:"center" }}>
        <div id="container" className="row">
          <br/>
          <h4>Change Password</h4>
          <div className="row">
            <div className="col-sm-2">
            </div>
            <div className="col-sm-8">
              <form className="form" onSubmit={this.clickCreate} >
                <input type="text" value={this.props.currentEmail} disabled/>
                <input type="password" id="oldPassword" placeholder="Old Password" value={this.state.oldPassword} onChange={this.handleChange} required/>
                <input type="password" id="newPassword" placeholder="New Password" value={this.state.newPassword} onChange={this.handleChange} required/>
                <button type="submit" value="submit">Update</button>
              </form>
            </div>
            <div className="col-sm-2">
            </div>
          </div>
          <br/>
        </div>
      </div>
    );
  }
}
