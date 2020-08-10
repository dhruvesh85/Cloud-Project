
module.exports = {

    tableName: "instruct_remark",
    attributes: {
        id: { type: "string", columnName: "instructionId", required: true },
        courseId: { type: "string", columnName: "courseId", required: true },
        instruct_remark: { type: "string", columnName: "instruct_remark", required: true }
    }

};
