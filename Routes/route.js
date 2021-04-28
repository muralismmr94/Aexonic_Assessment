const ctr1User = require("../Controller/controller");
const express = require("express");
const router = express.Router();

router.post("/register", ctr1User.register);
router.post("/login", ctr1User.login);
router.get("/getAllUsers", ctr1User.getAllUsers);
router.put("/updateUser", ctr1User.updateUser);
router.get("/getFilteredUsers", ctr1User.getFilteredUsers);

module.exports = router;
