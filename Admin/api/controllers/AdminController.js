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

  updateAvailableSeats: async function (req, res) {
    var courseId = req.body.courseId;
    var availableSeats = req.body.availableSeats;
    var label = req.body.label;
    var connectionDetails = {
      host: "cloudproject.ctbnbdx7vmpq.us-east-1.rds.amazonaws.com",
      user: "deep",
      password: "deep6844",
      database: "project_admin",
      port: "3306",
      ssl: true,
    };

    var connection = mysql.createConnection(connectionDetails);
    await connection.connect(async function (err) {
      if (err) {
        console.error("Error while connection DB: ", err);
      }
      else{
        console.log("connected to database");
      }
    });

    try {
      var begin = `XA START '${label}'`;
      var end = `XA END '${label}'`;
      var prepare = `XA PREPARE '${label}'`;
      var roll = `XA ROLLBACK '${label}'`;
      var commit = `XA COMMIT '${label}'`;

      console.info("Transaction begin");
      connection.query(begin, function (err, response) {
        if (err) {
          console.error("BEGIN ERROR: ", err);
          connection.destroy();
          return res.send("beginerror");
        } else {
          console.info("BEGIN SUCESS");
        }
      });

      console.info("Statements adding to Transactions");
      const updateQuery = `update course SET availableSeats =${availableSeats} where courseId = '${courseId}' `;
      console.log(updateQuery);
      connection.query(updateQuery, function (err, response) {
        if (err) {
          console.error("UPDATE ERROR: ", err);
          connection.destroy();
          return res.send("updateerror");
        } else {
          console.info("SUCESSFUL UPDATE RESPONSE", response);
        }
      });

      console.info("Transaction End");
      connection.query(end, function (err, response) {
        if (err) {
          console.error("END ERROR: ", err);
          connection.destroy();
          return res.send("enderror");
        } else {
          console.log("END SUCCESS");
        }
      });
      
      console.info("Transaction Prepared");
      connection.query(prepare, function (err, response) {
        if (err) {
          console.error("PREPARE ERROR: ", err);
          connection.destroy();
          return res.send("preparederror");
        }else{
          console.log("PREPARED SUCCESS");
        }
      });
    
      console.info("Trying to Commit Transaction");
      await connection.query(commit, async function (err, success) {
        if (err) {
          console.error("COMMIT ERROR: ", err);
          //try to rollback
          console.info("Trying to Rollback Transaction Since it was prepared already");
          await connection.query(roll, async function (err, success) {
            if (err) {
              console.error("ROLL ERROR: ", err);
              connection.destroy();
              return res.send("unsuccessfulrollback");
            } else {
              console.log("ROLL RESPONSE: ", success);
              connection.destroy();
              return res.send("rollback");
            }
          });
        }else{
          connection.destroy();
          return res.send("commit");
        }
      });
    
    }catch (err) {
      sails.log("LAST CATCH ERROR", err);
      return res.send("unprepared");
    }
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

  assignInstructorForm: function (req, res) {
    if (typeof req.session.userId == "undefined") {
      return res.view("pages/userNotLoggedIn");
    }
    var courseId = req.param("courseId");
    var courseName = req.param("courseName");
    console.log(
      "In assignInstructor courseId: " + courseId + " coursename: " + courseName
    );
    res.view("pages/assignInstructor", {
      courseId: courseId,
      courseName: courseName,
    });
  },
 
  assignInstructor: async function (req, res) {
    courseId = req.body.courseId;
    courseName = req.body.courseName;
    instructorId = req.body.instructorId;
    var rp = require("request-promise");
    var option = {
      method: "post",
      uri: "http://instructor-dev.us-east-1.elasticbeanstalk.com/insertCourse",
      body: {
        courseName: courseName,
        courseId: courseId,
        instructId: instructorId,
      },
      json: true,
    };
    await rp(option).then(async function (response) {
      sails.log("Instructor assign to course ", response);
      res.redirect("/getCourses");
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
