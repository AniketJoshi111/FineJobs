// routes/admin.js
const express = require("express");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");
const User = require("../models/user");

const isAuthenticated = require("../middleware/is-authenticated");
const { isAuthorized, isAdmin } = require("../middleware/is-authorized");

const router = express.Router();

//  Middleware Utils 
const adminMiddleware = [isAuthenticated, isAuthorized, isAdmin];

const userValidationRules = {
  create: [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .custom((value) =>
        User.findOne({ email: value }).then((user) => {
          if (user) return Promise.reject("User already exists");
        })
      )
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 6, max: 12 })
      .withMessage("Password must be 6–12 characters long"),
    body("age")
      .isInt({ min: 18, max: 60 })
      .withMessage("Age must be between 18 and 60"),
    body("mobile")
      .trim()
      .custom((value) => {
        const mobilePattern = /^[1-9]{1}[0-9]{9}$/;
        if (!mobilePattern.test(value)) {
          return Promise.reject("Invalid mobile number");
        }
        return true;
      }),
    body("gender").trim().notEmpty().withMessage("Gender is required"),
    body("qualification").trim().notEmpty().withMessage("Qualification is required"),
    body("experience").trim().notEmpty().withMessage("Experience is required"),
    body("role").trim().notEmpty().withMessage("Role is required"),
  ],

  update: [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("age")
      .isInt({ min: 18, max: 60 })
      .withMessage("Age must be between 18 and 60"),
    body("mobile")
      .trim()
      .custom((value) => {
        const mobilePattern = /^[1-9]{1}[0-9]{9}$/;
        if (!mobilePattern.test(value)) {
          return Promise.reject("Invalid mobile number");
        }
        return true;
      }),
    body("gender").trim().notEmpty().withMessage("Gender is required"),
    body("qualification").trim().notEmpty().withMessage("Qualification is required"),
    body("experience").trim().notEmpty().withMessage("Experience is required"),
    body("role").trim().notEmpty().withMessage("Role is required"),
  ],
};

const jobValidationRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("startDate").trim().notEmpty().withMessage("Start date is required"),
  body("endDate").trim().notEmpty().withMessage("End date is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
];

// ---------------- Admin Dashboard Routes ----------------
router.get("/dashboard-stats", adminMiddleware, adminController.getStats);
router.get("/dashboard-recents", adminMiddleware, adminController.getRecent);

// ---------------- User Management Routes ----------------
router.get("/users", adminMiddleware, adminController.getUsers);
router.post("/add-user", adminMiddleware, userValidationRules.create, adminController.postUser);
router.get("/users/:userId", adminMiddleware, adminController.getUser);
router.put("/edit-user/:userId", adminMiddleware, userValidationRules.update, adminController.editUser);
router.delete("/users/:userId", adminMiddleware, adminController.deleteUser);

// ---------------- Job Management Routes ----------------
router.get("/jobs", adminMiddleware, adminController.getJobs);
router.post("/add-job", adminMiddleware, jobValidationRules, adminController.addJob);
router.get("/jobs/:jobId", adminMiddleware, adminController.getJob);
router.put("/edit-job/:jobId", adminMiddleware, jobValidationRules, adminController.editJob);
router.delete("/jobs/:jobId", adminMiddleware, adminController.deleteJob);

module.exports = router;
