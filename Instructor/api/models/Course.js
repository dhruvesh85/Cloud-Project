
module.exports = {

    tableName: "instructorCourse",
    attributes: {
        id: { type: "string", columnName: "instructId", required: true },
        courseId: { type: "string", columnName: "courseId", required: true },
        courseName: { type: "string", columnName: "courseName", required: true }
    }

};
