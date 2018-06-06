## Project running instructions
---

* Clone the project folder
* Open folder in command prompt
* Run - "npm install"
* Run - "meteor"
* Open browser and visit "localhost:3000"
* Login as email - "admin@admin.com" & password - "admin"

## Technologies Used
---
> Meteor
* React
* ExpressJs
* NodeJs
* MongoDB

## API Endpoints
---
* 'localhost:3000/api/admin/register'
  * Api to register admin
  * Require username, email & password as request body
  * Throws error if email already exists
* 'localhost:3000/api/employee/register'
  * Api to register employee
  * Require username, email & password as request body
  * Throws error if email already exists
* 'localhost:3000/api/employee/delete'
  * Api to delete employee
  * Require email as request body
  * Throws error if email does not exists
* 'localhost:3000/api/review/assign'
  * Api to assign performance review to employees
  * Require reviewby (email) & reviewabout (email) as request body
  * Throws error if email does not exists
  * Throws error if email belongs to admin
  * Throws error if the review has already been assigned among the provided emails and not yet "completed". (i.e - If the employee submitted the review, the admin can reassign the review)
* 'localhost:3000/api/review/unassign'
  * Api to unassign performance review
  * Require reviewby (email) & reviewabout (email) as request body
  * Throws error if email does not exists
  * Throws error if there is no review assigned before

## Web application walkthrough
---
#### Login Page - (localhost:3000)
* Anyone registered to the application can login here.
* If not registered (or) if email is wrong (or) if password is wrong the application will provide alert message accordingly
* Token is sent back from the server if the credentials are correct, which acts as session variable to keep him/her to stay logged in to the application
* If the login is successfull it takes to the following route depending upon whether the person logged in is Admin (or) Employee
  * 'localhost:3000/admin' (admin)
  * 'localhost:3000/dashboard' (employee)

#### Admin Page - (localhost:3000/admin)
* Admin Page has the following module
  * Register Module
  * Assign/Unassign review Module
  * Delete Module
  * Review Information Module
> Register Module
  * Admin can create employee by providing username, email & password
  * The password will be encrypted and stored in the database and alerts the user
  * If email is already registered the application will provide alert message accordingly
> Assign/Unassign review Module
  * Admin can assign an employee to perform review on another employee by providing selecting the user from the dropdown
  * Admin can unassign an employee perform review by closing it on the list available
  * Note: If the review is submitted already it will be shown on the list and becomes available to assign again
> Delete Module
  * Admin can delete user by clicking delete icon on the specific user
  * By deleting user, the application deletes any uncompleted feedback "by" or "about" that corresponding employee as well.
> Review Information Module (Viewable)
  * Admin can view all the submitted performance review
  * Note: The unsubmitted performance review will shown different from submitted performance

#### Employee Page - (localhost:3000/dashboard)
* Employee Page has the following module
  * Change Password Module
  * Save/Submit Feedback Module
> Change Password Module
  * Employee can change the password which was previously set by the admin
> Save/Submit Feedback Module
  * Employee can write a feedback about other employees which has been assigned by the admin. 
  * Employee can save the feedback and continue later
  * Employee can submit the feedback. Note - Once they submitted they cannot the contents of the feedback.

## Assumptions made & things which were added additinal from requirements
---
* Password encryption
* Session Management (i.e - Once admin/employee logged in their session is valid for 1 hour)
* Incomplete feedbacks are deleted when the user is deleted but the not the submitted feedbacks. Since submitted feedbacks are useful in long term records.
* Employee password Management - Changing password is required as they are set by admin in the begining
* Allow only one open review at a time "about personA" "by personB". It doesn't make sense to assign multiple issues "about personA" "by personB" and vice versa 