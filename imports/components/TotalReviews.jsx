import * as RLocalStorage from 'meteor/simply:reactive-local-storage';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

class TotalReviews extends Component{
  constructor(props){
    super(props);
    // STATE:
    this.state={
    };
  }


	render () {
		return (
      <div>
        {Object.keys(this.props.total_reviews).map((key,index)=> {
            return (
              <button type="button" className="btn btn-primary" key={index}>
                About: {key} <span className="badge badge-light">Total: {this.props.total_reviews[key]}</span>
              </button>
            );
        })}

      </div>
		);
	}
}

export default TotalReviews = withTracker((props) => {
  var total_reviews = {};
  ReviewAssign.find({"reviewby":props.currentEmail}).fetch().map(x=>{
    var feedback_submission = Feedbacks.findOne({"_id":x.feedback_id}).submitted;
    if(feedback_submission){
      if(total_reviews.hasOwnProperty(x.reviewabout)){
        var count = total_reviews[x.reviewabout];
        count++;
        total_reviews[x.reviewabout] = count;
      }
      else{
        total_reviews[x.reviewabout] = 1;
      }
    }
  })
  return {
    total_reviews: total_reviews
  }
})(TotalReviews);