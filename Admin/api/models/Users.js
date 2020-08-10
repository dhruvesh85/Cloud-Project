/**
 * Admin.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName:"users",
  attributes: {
      id: {type:"string", columnName:"email", required:true},
      name: {type:"string", columnName:"name", required:true},
      password: {type:"string", columnName:"password", required:true}
  },
};


