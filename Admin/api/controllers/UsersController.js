/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming reqs.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
 
module.exports = {
 
    registerUser: function (req, res) {
      Users.findOrCreate(
        { id: req.body.email },
        { id: req.body.email, name: req.body.name, password: req.body.password, }
      ).exec(async (err, user, isRegistered) => {
        if (err) {
          return res.serverError(err);
        }
        if (isRegistered) {
          console.log("User Registred Successfully");
          res.view("pages/login")
        } else {
          var result =
            "User exists with the email: " + user.id;
          res.view("pages/error", { page: "register", result: result });
          sails.log(
            "User exists with the email: " + user.id
          );
        }
  
      })
    },
  
    loginUser: function (req, res) {
      email = req.body.email;
      password = req.body.password;
      Users.findOne({
        id: email,
        password: password
      }).exec(function (err, result) {
        if (err) {
          var result =
            "Incorrect email or password !";
          res.view("pages/error", { page: "login", result: result });
          sails.log(
            "Incorrect email or password !"
          );
        } else if (result.length == 0) {
          var result =
          "Incorrect email or password !";
          res.view("pages/error", { page: "login", result: result });
          sails.log(
            "Incorrect email or password !"
          );
        } else {
          req.session.userId = result.id;
          res.redirect("/getCourses");
          console.log("User Logged-in "+result.id);
        }
      });
    },
  
    logoutUser: function (req, res) {
      console.log("USER LOGOUT : ", req.session.userId);
      req.session.destroy(function (err) {
        return res.redirect("/");
      });
    },
  
  };