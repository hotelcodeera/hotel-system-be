const express = require("express");
const router = express.Router();
const { addUser } = require("../controllers/adminController");
const { adminProtect } = require("../middleware/auth");

router.route("/addUser").post(adminProtect, addUser);

module.exports = router;
