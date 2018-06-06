import * as RLocalStorage from 'meteor/simply:reactive-local-storage';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { withTracker } from 'meteor/react-meteor-data';

class MultiSelectField extends Component{
  constructor(props){
    super(props);
    // STATE:
    this.state={
    };
    // FUNCTION BINDINGS
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }
	handleSelectChange (email) {
		const current_list = email.split(",");
		let removed = this.props.assigned.filter(x => !current_list.includes(x));
		let added = current_list.filter(x => !this.props.assigned.includes(x));
		if(removed.length > 0){
			console.log("REMOVED");
			Meteor.call("unassignReview",this.props.currentEmail,removed[0],function(err,res){
				if(res){
					alert("REMOVED!")
				}
			});
		}
		else if(added.length > 0){
			console.log("ADDED");
			Meteor.call("assignReview",this.props.currentEmail,added[0],function(err,res){
				if(res){
					alert("ADDED!")
				}
			});
		}
	}

	render () {
		return (
				<Select
					multi
					simpleValue
					onChange={this.handleSelectChange}
					options={this.props.options}
					placeholder={"Assign feedback to "+this.props.currentEmail}
					value={this.props.assigned}
				/>
		);
	}
}

export default MultiSelectField = withTracker((props) => {
	const review_assigned = [];
	ReviewAssign.find({"reviewby":props.currentEmail}).fetch().map(y=>{
		var submitted = Feedbacks.findOne({"_id":y.feedback_id}).submitted;
		if(!submitted){
			review_assigned.push(y.reviewabout); 
		}
	});
  const options = props.allusers.map(x=>{
    return {
      label: x.email,
			value: x.email,
			disabled: props.currentEmail == x.email ? true : false
    }
	});
	console.log(review_assigned);
  return {
		options: options,
		assigned: review_assigned
  }
})(MultiSelectField);