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
  'POST /insertcsv': "CsvController.getcsv",
  'POST /login': "CsvController.login",
  'GET /logout': "CsvController.logout",
  'GET /register': { view: 'pages/register' },
  'POST /register': "CsvController.registerInstructor",
  'POST /register': "CsvController.registerInstructor",
  'GET /getCoursesById': "CsvController.getCoursesById",
  'POST /addStudentForm/:courseId': "csvController.addStudentForm",
  'POST /addAnnouncementForm/:courseId': "csvController.addAnnouncementForm",
  'GET /addStudent': { view: 'pages/addStudent' },
  '/announcement': { view: 'pages/announcement' },
  'POST /insertAnnouncement': "CsvController.insertAnnouncement",
  'POST /deleteCourse': "CsvController.deleteCourse",
  'POST /deleteStudent': "CsvController.deleteStudent",
  'POST /sendConfirmation': "CsvController.sendConfirmation",
  'GET /getInstructor': "CsvController.sendInstructorDetails",
  'POST /insertCourse': "CsvController.insertCourse",
  'POST /getAnnouncements': "CsvController.getAnnouncements",
  'POST /deleteAnnouncement': "CsvController.deleteAnnouncement",
  'POST /deleteAllAnnouncement': "CsvController.deleteAllAnnouncement",
  'POST /getCoursesByStudentId': "CsvController.getCoursesByStudentId",
  'POST /getAnnouncements': "CsvController.getAnnouncements",
}

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
