/**
 * CsvController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { resolve } = require('path');
const { rejects } = require('assert');

const mysql = require('mysql');
const { exec } = require('child_process');
const { Session } = require('inspector');
const { time } = require('console');
const { setMaxListeners } = require('process');

module.exports = {


    login: function (request, response) {
        let password = request.body.password;
        Csv.findOne({ email: request.body.email }).exec(function (err, result) {
            if (err || password != result.password) {
                sails.log(err);
            }
            else {
                console.log(result.id)
                request.session.userId = result.id;
                response.redirect("/getCoursesById");
            }
        })

    },

    logout: function (req, res) {
        console.log("USER LOGOUT : ", req.session.userId);
        req.session.destroy(function (err) {
            res.redirect("/");
        });
    },

    registerInstructor: function (request, response) {
        Csv.create({
            id: request.body.id, firstname: request.body.firstname, lastname: request.body.lastname,
            email: request.body.email, password: request.body.password
        }).exec(function (err, Csv) {
            if (err) {
                sails.log(err);
                response.send("Instructor not inserted successfully");
            }
            else {
                response.redirect("/")
            }
        })

    },

    getCoursesByStudentId: function (request, response) {
        StudentCourses.find({ id: request.body.studentId }).exec(function (Error, courses) {
            if (Error) {
                sails.log(Error);
            }
            response.send({ courses: courses });
        })
    },

    insertCourse: function (req, res) {
        courseId = req.body.courseId
        courseName = req.body.courseName
        instructId = req.body.instructId
        Course.create(
            { id: instructId, courseId: courseId, courseName: courseName }
        ).exec(async (err, success) => {
            if (err) {
                returnres.serverError(err);
            }
            varmessage = "Instrutor Added for course:" + courseId;
            res.send({ message: message });
        });
    },

    deleteCourse: function (request, response) {
        courseId = request.body.courseId;
        Course.destroy({ courseId: courseId }).exec(function (error, res) {
            if (error) {
                returnresponse.serverError(error);
            }
        })
        Announcement.destroy({ courseId: courseId }).exec(function (error, res) {
            if (error) {
                returnresponse.serverError(error);
            }
        })
        StudentCourses.destroy({ courseId: courseId }).exec(function (error, res) {
            if (error) {
                returnresponse.serverError(error);
            }
            response.send("All content related to the course deleted");
        })
    },

    deleteStudent: function (request, response) {
        courseId = request.body.courseId;
        studentId = request.body.studentId;
        StudentCourses.destroy({ courseId: courseId, id: studentId }).exec(function (error, res) {
            if (error) {
                returnresponse.serverError(error);
            }
            response.send("Courses Dropped");
        })
    },

    addStudentForm: function (request, response) {
        console.log("LOGGEDIN: ", request.session.userId)
        if (typeof request.session.userId === 'undefined') {
            return response.redirect("/")
        }
        courseId = request.param("courseId")
        console.log("students", courseId)
        response.view("pages/addStudent", { courseId: courseId });
    },

    getcsv: async function (req, res) {
        console.log("LOGGEDIN: ", req.session.userId)
        if (typeof req.session.userId === 'undefined') {
            return response.redirect("/")
        }
        var students;
        var courseId = req.body.courseId;
        try {
            students = await new Promise((resolve, rejects) => {
                const csv = require('csv-parser');
                const fs = require('fs');
                res.setTimeout(0);
                req.file('csvfile')
                    .upload({
                        saveAs: "temp.csv",
                        maxBytes: 1000000
                    }, function whenDone(err, uploadedFiles) {
                        if (err) {
                            return res.serverError(err);
                        }
                    });

                const allStudents = [];
                x = fs.createReadStream('.tmp/uploads/temp.csv')
                    .on('error', (err) => {
                        sails.log(err);
                        throw new Error(err);
                    })
                    .pipe(csv())
                    .on('data', (row) => {
                        var student = {}
                        student["studentId"] = row.studentId;
                        student["phone"] = row.phone;
                        student["courseId"] = courseId;
                        student["courseName"] = row.courseName;
                        allStudents.push(student);
                    })
                var y = x.on('end', () => {
                    resolve(allStudents);
                });
            });
        } catch (error) {
            console.log("CSV Processing is not successful");
            console.log(error);
            res.serverError("Something went wrong while processing CSV");
        }
        try {
            sails.log("All Students:", students)
            sails.log("Count of Students: ", students.length);

            ////////////////
            //DO the API call and chechk for avaliable seats are enough and  processed or send error
            ////////////////
            var flag = false;
            var updatedSeatsValues = -1;
            var timestemp = Date.now();
            //API call to check the available seats
            var requestPromiseGetAvailableSeats = require('request-promise');
            var optionsGetAvailableSeats = {
                method: "post",
                uri: "https://csci5409-project-admin.herokuapp.com/getAvailableSeats",
                body: {
                    "courseId": courseId,
                },
                json: true,
            };

            sails.log("Getting available setas for courseId: ", courseId);
            await requestPromiseGetAvailableSeats(optionsGetAvailableSeats).then(async function (response) {
                sails.log("Response from GetAvailableSeats API call: ", response);
                if (response.courseDetails.availableSeats < students.length) {
                    flag = false;
                    console.log("availabl seats are less");
                    return res.serverError(
                        "Available Seat count: " + response.courseDetails.availableSeats + ", is less than CSV Student Count: " + students.length + ". Please contact Admin.");
                } else {
                    flag = true;
                    updatedSeatsValues = response.courseDetails.availableSeats - students.length;
                }
            }).catch(async function (error) {
                flag = false;
                sails.log("API CALL GetAvailableSeats ERROR: ", error.message);
                return res.serverError("Error while fetching data from Course Table");
            });

            sails.log("Operation is possible: ", flag);
            sails.log("availableSeats count will be updated to: ", updatedSeatsValues, " for courseId: ", courseId);

            //check flag and updateseat count in case of API call fails
            if (flag == false && updatedSeatsValues == -1) {
                sails.log("Updated Available Seats Count is -1. Can not processed.");
            }

            var labelToSend = courseId + "" + updatedSeatsValues + "" + timestemp;
            var label = courseId + "" + (students.length) + "" + timestemp;

            sails.log("Label: ", label);
            sails.log("LabelToSend: ", labelToSend);

            //connection variables
            connectionDetails = {
                host: 'assignemnt3-database.cmivyxxs0dhs.us-east-1.rds.amazonaws.com',
                user: 'admin',
                password: 'redstar369.',
                database: 'project_Instructor',
                port: '3306',
                ssl: true
            };
            var connection;
            var secondFlag = false;

            //operation is possible
            if (flag == true & updatedSeatsValues != -1) {
                //get the new connection
                connection = mysql.createConnection(connectionDetails);
                await connection.connect(async function (err) {
                    if (err) {
                        sails.log('Error while connection DB: ', err);
                        return res.serverError("Can not connect to Database");
                    } else {
                        sails.log("connected to database");
                    }
                });

                var begin = `XA START '${label}'`;
                var end = `XA END '${label}'`;
                var prepare = `XA PREPARE '${label}'`;
                var commit = `XA COMMIT '${label}'`;
                var rollback = `XA ROLLBACK '${label}'`;

                sails.log("Transaction begin");
                connection.query(begin, function (err, response) {
                    if (err) {
                        //destory the connection
                        connection.destroy();
                        sails.log("BEGIN ERROR: ", err);
                        return res.serverError("Something went wrong while starting transaction");
                    }
                });

                sails.log("Statements added to Transactions");
                const sqlint = 'INSERT INTO student2 SET ?';
                students.forEach(element => {
                    sails.log("ELEMENT: ", element);
                    connection.query(sqlint, element, function (err, response) {
                        if (err) {
                            //destory the connection
                            connection.destroy();
                            sails.log("INSERT ERROR: ", err);
                            return res.serverError("Something went wrong while adding to the transaction");
                        }
                    });
                });

                sails.log("Transaction End");
                connection.query(end, function (err, response) {
                    if (err) {
                        //destory the connection
                        connection.destroy();
                        sails.log("END ERROR: ", err);
                        return res.serverError("Something went wrong while ending transaction");
                    }
                });

                sails.log("Transaction Prepared");
                connection.query(prepare, function (err, response) {
                    if (err) {
                        //destory the connection cause it is not prepared
                        connection.destroy();
                        sails.log("PREPARE ERROR: ", err);
                        return res.serverError("Something went wrong while preapring transaction");
                    }
                });

                //API call to prepare & commit tranaction on other side
                var requestPromiseUpdateAvailableSeats = require('request-promise');
                var optionsUpdateAvailableSeats = {
                    method: "post",
                    uri: "https://csci5409-project-admin.herokuapp.com/updateAvailableSeats",
                    body: {
                        "courseId": courseId,
                        "availableSeats": updatedSeatsValues,
                        "label": labelToSend
                    },
                    json: true,
                };

                sails.log("Preparing & Commiting transcation on other side");
                await requestPromiseUpdateAvailableSeats(optionsUpdateAvailableSeats).then(async function (response) {
                    sails.log("Response from UpdateAvailableSeats API call: ", response);
                    if (response == "commit") {
                        secondFlag = true;
                        sails.log("Transcation is prepared and commited on the other side");
                    }
                }).catch(function (error) {
                    console.log(error.message);
                });
                /////////////////////////

                if (secondFlag) {
                    //commit this side too
                    sails.log("Commiting Transaction this side");
                    connection.query(commit, function (err, success) {
                        if (err) {
                            console.log("canot not commit transcation: ", err.message)
                        } else {
                            sails.log("Transaction is Commited on both side.");
                            //destroy connection
                            connection.destroy();
                            ////////////////////
                            //sending data to SMS API
                            var requestPromiseSMS = require('request-promise');
                            var optionsSMS = {
                                method: "post",
                                uri: "http://testsms-dev.us-east-1.elasticbeanstalk.com/sms",
                                body: {
                                    "students": students,
                                },
                                json: true,
                            };
                            requestPromiseSMS(optionsSMS);
                            /////////////////////
                            return res.redirect("/getCoursesById");
                        }
                    });
                } else {
                    //rollback this side transaction
                    connection.query(rollback, function (err, success) {
                        if (err) {
                            sails.log("CANOT ROLL BACK: ", err.message);
                        } else {
                            console.log("Rolllbacked this transaction")
                        }
                        connection.destroy();
                        return res.serverError("Students are not added, please contact admin.");
                    });
                }
            }
        } catch (err) {
            sails.log(err);
        }
    },



    addAnnouncementForm: function (request, response) {
        console.log("LOGGEDIN: ", request.session.userId)
        if (typeof request.session.userId === 'undefined') {
            return response.redirect("/")
        }
        courseId = request.param("courseId")
        // console.log("students", courseId)
        response.view("pages/addAnnouncement", { courseId: courseId });
    },

    insertAnnouncement: function (request, response) {
        console.log("LOGGEDIN: ", request.session.userId)
        if (typeof request.session.userId === 'undefined') {
            return response.redirect("/")
        }
        Announcement.create({
            id: request.session.userId, instruct_remark: request.body.announcement,
            courseId: request.body.courseId
        }).exec(function (error, announcement) {
            if (error) {
                sails.log(error);
                response.serverError("Announcement not inserted");
            }
            var message = "Announcement Added for course:" + request.body.courseId;
            // response.send({ message: message });
            response.redirect("/getCoursesById");
        })
    },

    getAnnouncements: function (request, response) {
        Announcement.find({ courseId: request.body.courseId }).exec(function (Error, announcement) {
            if (Error) {
                sails.log(Error);
            }
            response.send({ announcemnets: announcement });
        })
    },

    deleteAnnouncement: function (request, response) {
        Announcement.destroy({ id: request.body.instructionId }).exec(function (error, announcement) {
            if (error) {
                sails.log(error);
            }
            var message = "Announcement Deleted";
            response.send({ message: message });
        })
    },



    deleteAllAnnouncement: function (request, response) {
        Announcement.destroy({ courseId: request.body.courseId }).exec(function (error, announcement) {
            if (error) {
                sails.log(error);
            }
            var message = "All Announcement Deleted for course:" + request.body.courseId;
            response.send({ message: message });
        })
    },

    getCoursesById: function (request, response) {
        console.log("LOGGEDIN: ", request.session.userId)
        if (typeof request.session.userId === 'undefined') {
            return response.redirect("/")
        }
        Course.find({ id: request.session.userId }).exec(function (error, courses) {
            if (error) {
                sails.log(error);
            } else {
                // response.send({ courses: courses })
                response.view("pages/getCourses", { courses: courses });
            }
        })
    },

    sendInstructorDetails: function (request, response) {
        Csv.find({ omit: ['password'] }).exec(function (error, instructor) {
            if (error) {
                sails.log(error)
            }
            sails.log(instructor);
            response.send({ instructor: instructor });
        })
    },


};