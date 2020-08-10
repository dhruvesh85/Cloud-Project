/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming reqs.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const mysql = require("mysql");

module.exports = {
  getCourses: function (req, res) {
    Admin.find().exec(function (error, response) {
      if (error) {
        console.log(error);
      }
      res.view("pages/getCourses", { courses: response });
    });
  },

  getCourse: function (req, res) {
    courseId = req.body.courseId;
    Admin.find({
      id: courseId,
    })
      .limit(1)
      .exec(function (err, course) {
        if (err) {
          var response = "Course not found with courseId: " + courseId;
          res.view("pages/error", { page: "searchCourse", result: response });
          sails.log("Course not found with courseId: " + courseId);
        } else if (course.length == 0) {
          var response = "Course not found with courseId: " + courseId;
          res.view("pages/error", { page: "searchCourse", result: response });
          sails.log("Course not found with courseId: " + courseId);
        } else {
          sails.log("Course name is : " + course[0].courseName);
          res.view("pages/getCourses", { courses: course });
        }
      });
  },

  getAvailableSeats: function (req, res) {
    courseId = req.body.courseId;
    Admin.find({
      id: courseId,
    })
      .limit(1)
      .exec(function (err, course) {
        if (err) {
          sails.log("Course not found with courseId: " + courseId);
          res.send(err);
        } else if (course.length == 0) {
          sails.log("Course not found with courseId: " + courseId);
          res.send(response);
        } else {
          sails.log(
            "Available seats in course is : " + course[0].availableSeats
          );
          res.send({ courseDetails: course[0] });
        }
      });
  },

  

  insertCourse: function (req, res) {
    if (typeof req.session.userId == "undefined") {
      return res.view("pages/userNotLoggedIn");
    }
    courseId = req.body.courseId;
    courseName = req.body.courseName;
    totalSeats = req.body.totalSeats;
    Admin.findOrCreate(
      { id: courseId },
      {
        id: courseId,
        courseName: courseName,
        totalSeats: totalSeats,
        availableSeats: totalSeats,
      }
    ).exec(async (err, course, isCreated) => {
      if (err) {
        return res.serverError(err);
      }
      if (isCreated) {
        sails.log("Inserted a new Course: " + course.id);
        res.redirect("/getCourses");
      } else {
        var result = "Found existing Course with CourseId: " + course.id;
        res.view("pages/error", { page: "insertCourse", result: result });
        sails.log("Found existing Course with CourseId: " + course.id);
      }
    });
  },

  updateCourseForm: function (req, res) {
    if (typeof req.session.userId == "undefined") {
      return res.view("pages/userNotLoggedIn");
    }
    var courseId = req.param("courseId");
    var courseName = req.param("courseName");
    var totalSeats = req.param("totalSeats");
    console.log(
      "In updateform courseId: " +
        courseId +
        " coursename: " +
        courseName +
        " totalSeats: " +
        totalSeats
    );
    res.view("pages/updateCourse", {
      courseId: courseId,
      courseName: courseName,
      totalSeats: totalSeats,
    });
  },

  updateCourse: async function (req, res) {
    courseId = req.body.courseId;
    courseName = req.body.courseName;
    var totalSeats = req.body.totalSeats;
    var oldTotalSeats, oldAvailableSeats;
    Admin.find({
      id: courseId,
    })
      .limit(1)
      .exec(async function (err, course) {
        oldTotalSeats = course[0].totalSeats;
        oldAvailableSeats = course[0].availableSeats;
        var diff = totalSeats - oldTotalSeats;
        var availableSeats = oldAvailableSeats + diff;
        var updateCourse = await Admin.updateOne({
          id: courseId,
        }).set({
          courseName: courseName,
          totalSeats: totalSeats,
          availableSeats: availableSeats,
        });

        if (updateCourse) {
          sails.log("Updated the course deatils for courseId: " + courseId);
          res.redirect("/getCourses");
        } else {
          res.send({
            code: "400",
            message: "Course Not found with given courseId",
          });
          sails.log("Course Not found with given CourseId: " + courseId);
        }
      });
  },

  deleteCourse: async function (req, res) {
    if (typeof req.session.userId == "undefined") {
      return res.view("pages/userNotLoggedIn");
    }
    courseId = req.body.courseId;
    var courseId = req.param("courseId");
    var deleteCourse = await Admin.destroyOne({ id: courseId });
    if (deleteCourse) {
      var rp = require("request-promise");
      var option = {
        method: "post",
        uri: "http://instructor-dev.us-east-1.elasticbeanstalk.com/deleteCourse",
        body: {
          courseId: courseId,
         },
        json: true,
      };
      await rp(option).then(async function (response) {
        sails.log(response);
      });
      sails.log("Deleted Course with courseId " + courseId);
      res.redirect("/getCourses");
    } else {
      res.send({
        code: "400",
        message: "Course Not found with given CourseId",
      });
      sails.log("Course Not found with given CourseId: " + courseId);
    }
  },
};
