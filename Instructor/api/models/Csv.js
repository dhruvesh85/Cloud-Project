/**
 * Csv.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: "instructorUser",
  attributes: {
    id: { type: "string", columnName: "id", required: true },
    firstname: { type: "string", columnName: "firstname", required: true },
    lastname: { type: "string", columnName: "lastname", required: true },
    email: { type: "string", columnName: "email", required: true },
    password: { type: "string", columnName: "password", required: true }
  },

};

