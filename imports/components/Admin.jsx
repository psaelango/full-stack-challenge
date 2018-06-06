import * as RLocalStorage from 'meteor/simply:reactive-local-storage';
import React, {Component} from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import moment from 'moment';
import Select from 'react-select';
import MultiSelectField from './MultiSelectField'
import TotalReviews from './TotalReviews'
import Dashboard from './Dashboard'
import Register from './Register'

class Admin extends Component{
  constructor(props){
    super(props);
    // STATE:
    this.state={
      users: [],
      showReview: false
    };
    // FUNCTION BINDINGS
    this.callDeleteUser = this.callDeleteUser.bind(this);
  }
  callDeleteUser(email){
    var text = "This will delete the user and all the 'incomplete' feebacks 'by' or 'about' "+email+". Are you sure want to continue?";
    if(confirm(text)){
      Meteor.call("deleteUser",email,function(err,res){
        if(res){
          alert("User and all incomplete 'feedbacks' about them are deleted!")
        }
      });
    }
  }
  render(){
    if(!this.props.dataReady){
      return (
        <div className="loading center-screen"></div>
      );
    }
    return(
      <div className="col-sm-12" style={{textAlign:"center"}}>
        <div className="row">
          <Register />
        </div>
        <div className="row">
          <div className="col-sm-8">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <td>Username</td>
                  <td>Email</td>
                  <td>Assigned Review(s)</td>
                  <td>Total Completed Review(s)</td>
                  <td>Delete User</td>
                </tr>
              </thead>
              <tbody>
                {
                this.props.users.map((user)=>(
                    user.email != this.props.currentEmail ?
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td><MultiSelectField allusers={this.props.users} currentEmail={user.email} /></td>
                      <td><TotalReviews currentEmail={user.email}/></td>
                      <td><i className="material-icons icon-action icon-red"  onClick={()=>this.callDeleteUser(user.email)}>delete_forever</i></td>
                    </tr>
                    : null
                  ))
                }
              </tbody>
            </table>
          </div>
          <div className="col-sm-4">
            <div className="panel panel-default">
              <div className="panel-heading">
                <button onClick={()=>{ var showReview = this.state.showReview ;this.setState({showReview:!showReview});} }>
                  {this.state.showReview ? "Hide review(s)" : "Show completed review(s)" }
                </button>
              </div>
              <div className="panel-body">
                {this.state.showReview ? <Dashboard currentEmail={this.props.currentEmail}/> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Admin = withTracker((props) => {
  var usersubscription = Meteor.subscribe( "users" , props.currentEmail );
  var reviewsubscription = Meteor.subscribe( "reviews" , props.currentEmail );
  var dataReady = false;
  if(usersubscription.ready() && reviewsubscription.ready()){
    dataReady = true;
  }
  return {
    dataReady: dataReady,
    users: Users.find({ role: { $ne: "ADMIN" } }).fetch(),
    reviews: ReviewAssign.find({}).fetch(), 
    feedbacks: Feedbacks.find({}).fetch()
  }
})(Admin);
