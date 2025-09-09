// routes/user.js
const express = require("express");

const userController = require("../controllers/user");

const isAuthenticated = require("../middleware/is-authenticated");
const isApply = require("../middleware/is-apply");
const { isAuthorized, isUser } = require("../middleware/is-authorized");

const router = express.Router();

//  Middleware Utils 
const userMiddleware = [isAuthenticated, isAuthorized, isUser];

//Job Routes
router.get("/jobsAvailable", userMiddleware, userController.getAvailableJobs);
router.get("/jobsApplied", userMiddleware, userController.getAppliedJobs);
router.post("/apply/:jobId", [...userMiddleware, isApply], userController.applyJob);

module.exports = router;
