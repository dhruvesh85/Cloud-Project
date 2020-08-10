/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': { view: 'pages/login' },
  'POST /loginUser': "AdminController.loginuser",
  'GET /registerUser': { view: 'pages/register' },
  'POST /registerUser': "AdminController.registerUser",
  'GET /getCourses' : "AdminController.getCourses",
  'GET /insertCourse' : { view: 'pages/insertCourse' },
  'POST /insertCourse': "AdminController.insertCourse",
  'GET /getCourse' : { view: 'pages/getCourse' },
  'POST /getCourse' : 'AdminController.getCourse',
  'POST /updateCourseForm/:courseId/:courseName/:totalSeats' : 'AdminController.updateCourseForm',
  'POST /updateCourse' : 'AdminController.updateCourse',
  'POST /deleteCourse/:courseId' : 'AdminController.deleteCourse',
  'POST /assignInstructorForm/:courseId/:courseName' : 'AdminController.assignInstructorForm',
  'POST /assignInstructor' : 'AdminController.assignInstructor',
  'POST /registerUser': "UsersController.registerUser",
  'POST /loginUser': "UsersController.loginUser",
  'GET /logoutUser': "UsersController.logoutUser",
  'POST /getAvailableSeats': "AdminController.getAvailableSeats",
  'POST /updateAvailableSeats': "AdminController.updateAvailableSeats",  
  


  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
