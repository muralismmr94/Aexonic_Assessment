const User = require("../Models/userModel");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtString = require("../Config.json")["JWT-String"];
const { body, validationResult } = require("express-validator");

async function register(req, res) {
  try {
    // body.checkBody()
    body("firstname", "Firstname is not valid").isLength({ min: 3 }).isAlpha();
    body("lastname", "Lastname is not valid").isLength({ min: 1 }).isAlpha();
    body("email", "Email is not valid").isEmail();
    body("password", "password is not valid")
      .isLength({ min: 4 })
      .equals(req.body.password);
    var errors = validationResult(req);
    errors = JSON.stringify(errors);
    var response = {};
    if (errors.errors) {
      response.success = false;
      response.error = errors;
      res.status(422).send(response);
    } else {
      const emailExist = await User.findOne({ email: req.body.email });
      if (emailExist) {
        res.status(400).json({ error: "Email already Exist" });
      } else {
        //     const salt = await bycrypt.genSalt(10);
        //   hashpassword = await bycrypt.hash(req.body.password, salt)

        let user = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          mobileNo: req.body.mobileNo,
          address: req.body.address,
        });
        user.setPassword(req.body.password);
        user.save((err, result) => {
          if (err) {
            res.send(err);
          }
          const payload = {
            user: {
              id: result.email,
            },
          };
          jwt.sign(
            payload,
            jwtString,
            { expiresIn: 10000 },
            function (err, token) {
              if (err) {
                res.send(err);
              }
              res.status(200).json({
                token,
                message: "User saved Successfully",
              });
            }
          );
        });
      }
    }
  } catch (err) {
    res.sendStatus(400).send(err);
  }
}

// User login api
async function login(req, res) {
  // Find user with requested email
  User.findOne({ email: req.body.email }, function (err, user) {
    if (user === null) {
      res.status(400).send({
        message: "User not found.",
      });
    } else {
      if (user.validPassword(req.body.password)) {
        var token = jwt.sign({ id: User.email }, jwtString, {
          expiresIn: 86400, // expires in 24 hours
        });
        res.status(200).send({
          message: "User Logged In " + token,
        });
      } else {
        res.status(400).send({
          message: "Wrong Password",
        });
      }
    }
  });
}

function getAllUsers(req, res) {
  var pageNo = parseInt(req.query.pageNo);
  var size = parseInt(req.query.size);
  var query = {};
  if (pageNo < 0 || pageNo === 0) {
    res.status(400).send({
      message: "invalid page number, should start with 1",
    });
  }
  query.skip = size * (pageNo - 1);
  query.limit = size;
  // Find some documents
  User.find({}, {}, query, function (err, data) {
    // Mongo command to fetch all data from collection.
    if (err) {
      res.status(400).send({
        message: "Error fetching data",
      });
    } else {
      res.status(200).send({
        message: data,
      });
    }
  });
}

async function updateUser(req, res) {
  const user = await User.findById(req.body.id);

  if (!user)
    res.status(400).send({
      message: "User not found!",
    });
  if (
    user.email !== req.body.email &&
    (await User.findOne({ email: req.body.email }))
  ) {
    res.status(400).send({
      message: 'Email "' + req.body.email + '" is already taken',
    });
  }

  if (req.body.password) {
    user.setPassword(req.body.password);
  }
  Object.assign(user, req.body);

  let userNew = await user.save();
  const payload = {
    user: {
      id: userNew.email,
    },
  };
  jwt.sign(payload, jwtString, { expiresIn: 10000 }, function (err, token) {
    if (err) {
      res.send(err);
    }
    res.status(200).json({
      token,
      message: "Updated successfully!",
    });
  });
}

function getFilteredUsers(req, res) {
  let query = req.query;

  var pageNo = parseInt(req.query.pageNo) || 2;
  var size = parseInt(req.query.size) || 10;
  if (pageNo < 0 || pageNo === 0) {
    res.status(400).send({
      message: "invalid page number, should start with 1",
    });
  }
  // query.skip = size * (pageNo - 1)
  query.limit = size;
  // Find some documents
  User.find(query, (err, data) => {
    // Mongo command to fetch all data from collection.
    if (err) {
      res.status(400).send({
        message: "Error fetching data",
      });
    } else {
      res.status(200).send({
        message: data,
      });
    }
  });
}

module.exports = {
  register,
  login,
  getAllUsers,
  updateUser,
  getFilteredUsers,
};
