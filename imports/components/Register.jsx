import React, {Component} from 'react';
import * as RLocalStorage from 'meteor/simply:reactive-local-storage';

export default class Register extends Component{
  constructor(props){
    super(props);
    // STATE:
    this.state={
      registerEmail: "",
      registerName: "",
      registerPassword: ""
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
    console.log(event);
    var username = event.target.registerName.value;
    var email = event.target.registerEmail.value;
    var password = event.target.registerPassword.value;
    Meteor.call('createUser', username, email, password, (error,response)=>{
      if(error){
        if(error.error){
          error = error.error;
        }
        console.log(">> createUser Error - ",error);
        if(error.serverErrorMsg == "EMAIL_EXISTS"){
          alert("Email ID already been registered!");
        }
      }
      else{
        console.log(">> createUser Response - ", response);
        alert("User Created Successfully!")
      }
    });
  }
  render(){
    return(
      <div className="col-sm-12" style={{ width:"100%", textAlign:"center" }}>
        <div id="container" className="row">
          <br/>
          <br/>
          <h4>Create User</h4>
          <div className="row">
            <div className="col-sm-2">
            </div>
            <div className="col-sm-8">
              <form className="form" onSubmit={this.clickCreate} >
                <input type="email" id="registerEmail" placeholder="Email" value={this.state.registerEmail} onChange={this.handleChange} required/>
                <input type="text" id="registerName" placeholder="Username" value={this.state.registerName} onChange={this.handleChange} required/>
                <input type="password" id="registerPassword" placeholder="Password" value={this.state.registerPassword} onChange={this.handleChange} required/>
                <button type="submit" value="submit">Create</button>
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
