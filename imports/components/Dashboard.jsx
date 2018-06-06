import React, {Component} from 'react';
import * as RLocalStorage from 'meteor/simply:reactive-local-storage';
import { withTracker } from 'meteor/react-meteor-data';
import ChageCreds from './ChageCreds'

class Dashboard extends Component{
  constructor(props){
    super(props);
    // STATE:
    this.state={};
    this.tableDef = {
      cols: [ // array of column definitions   
        { title: "By", dataKey: "reviewby",
          renderAdminView: email => {
            return ( <p className="text-info">{email}</p>  )
          },
        },   
        { title: "About", dataKey: "reviewabout",
          renderComplete: email => {
            return ( <p className="text-success">{email}</p>  )
          },
          renderProgress: row => {
            return ( <p className="text-info">{row.reviewabout}</p>  )
          },
          renderAdminView: email => {
            return ( <p className="text-info">{email}</p>  )
          },
        },
        { title: "Feedback", dataKey: "feedback",
          renderComplete: feedback => {
            return ( <p className="text-success">{feedback}</p>  )
          },
          renderProgress: row => {
            return ( 
              <textarea rows="4" cols="50" 
                value={this.state.contents && Object.keys(this.state.contents).length > 0 ? this.state.contents[row._id] :""}  
                onChange={ (e)=>{ this.handleTextChange(e.target.value,row._id) } }
              >
              </textarea>
            )
          },
          renderAdminView: feedback => {
            return ( <p className="text-info">"Feedback is in progress"</p>  )
          },
        },
        { title: "Status", dataKey: "submitted",
          renderComplete: text => {
            return ( <p className="text-success">"SUBMITTED"</p>  )
          },
          renderProgress: row => {
            return ( <p className="text-primary">"PENDING"</p>  )
          },
          renderAdminView: text => {
            return ( <p className="text-info">"NOT SUBMITTED"</p>  )
          },
        },
        { title: "", dataKey: "_id",
          renderComplete: id => {
            return ( <p className="text-success">✔</p>  )
          },
          renderProgress: row => {
            return ( 
              <div> 
                <button className="btn btn-default" onClick={()=>this.callSaveFeedback(row._id)}>SAVE</button>
                <button className="btn btn-primary" onClick={()=>this.callSubmitFeedback(row._id)}>SUBMIT</button>
              </div>
            )
          },
          renderAdminView: id => {
            return ( <p className="text-info">Feedback id - {id}</p>  )
          },
        }
      ]
    };
    // FUNCTION BINDINGS
    this.renderTableRow = this.renderTableRow.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.callSaveFeedback = this.callSaveFeedback.bind(this);
    this.callSubmitFeedback = this.callSubmitFeedback.bind(this);
  }
  static getDerivedStateFromProps(props, state){
    return {
      contents: props.contents
    }
  }
  handleTextChange(text,id){
    var contents = this.state.contents;
    contents[id] = text;
    this.setState({contents})
  }
  callSaveFeedback(id){
    Meteor.call("saveFeedback",id,this.state.contents[id],function(err,res){
      if(res){
        alert("Feedback Saved! ",id)
      }
    });
  }
  callSubmitFeedback(id){
    if(confirm('You cannot modify the content after you submit! Are you sure want to submit the feedback now?')){
      Meteor.call("submitFeedback",id,this.state.contents[id],function(err,res){
				if(res){
					alert("Feedback Submitted! ",id)
				}
			});
    }
  }
  renderTableRow(row, rowIdx){
    return (
      this.tableDef.cols.map((def,i)=>
        def.dataKey == "reviewby" && this.props.admin ? <td key={i}>{def.renderAdminView(row[def.dataKey])}</td> : 
        def.dataKey == "reviewby" ? null :
        <td key={i}>
          { row.submitted ? def.renderComplete(row[def.dataKey]) : this.props.admin ? def.renderAdminView(row[def.dataKey]) : def.renderProgress(row) }
        </td>
      )
    )
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
          <ChageCreds currentEmail={this.props.currentEmail}/>
        </div>
        <div className="row">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                { this.props.admin ? <td>By</td> : null }
                <td>About</td>
                <td>Feedback</td>
                <td>Status</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {
                this.props.feedbacks.map( (row, rowIdx) =>
                  <tr key={rowIdx}>{this.renderTableRow( row, rowIdx )}</tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default Dashboard = withTracker((props) => {
  var usersubscription = Meteor.subscribe( "users" , props.currentEmail );
  var reviewsubscription = Meteor.subscribe( "reviews" , props.currentEmail );
  var dataReady = false;
  var feedbacks = [];
  var contents = {};
  var admin;
  if(usersubscription.ready() && reviewsubscription.ready()){
    var check = Users.findOne({"email":props.currentEmail}).role;
    admin = check == "ADMIN" ? true : false;
    feedbacks = Feedbacks.find({}).fetch().map(x => {
      contents[x._id] = x.feedback;
      var review_info = ReviewAssign.findOne({"feedback_id":x._id});
      x.reviewby = review_info.reviewby;
      x.reviewabout = review_info.reviewabout;
      return x;
    })
    dataReady = true;
  }
  return {
    dataReady: dataReady,
    feedbacks: feedbacks,
    contents: contents,
    admin: admin
  }
})(Dashboard);
