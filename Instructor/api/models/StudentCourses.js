module.exports = {

    tableName: "student2",
    attributes: {
        id: { type: "string", columnName: "studentId", required: true },
        courseId: { type: "string", columnName: "courseId", required: true },
        courseName: { type: "string", columnName: "courseName", required: true },
        phone: { type: "string", columnName: "phone", required: true }
    }

};