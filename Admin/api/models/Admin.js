/**
 * Admin.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName:"course",
  attributes: {
      id: {type:"string", columnName:"courseId", required:true},
      courseName: {type:"string", columnName:"courseName", required:true},
      totalSeats: {type:"number", columnName:"totalSeats", required:true},
      availableSeats: {type:"number", columnName:"availableSeats", required:true},
  },
};


