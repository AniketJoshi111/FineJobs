// routes/provider.js
const express = require("express");
const { body } = require("express-validator");

const providerController = require("../controllers/provider");
const isAuthenticated = require("../middleware/is-authenticated");
const { isAuthorized, isProvider } = require("../middleware/is-authorized");

const router = express.Router();

//  Middleware Utils
const providerMiddleware = [isAuthenticated, isAuthorized, isProvider];

const jobValidationRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("startDate").trim().notEmpty().withMessage("Start date is required"),
  body("endDate").trim().notEmpty().withMessage("End date is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
];

// Provider Dashboard Routes 
router.get("/dashboard-stats", providerMiddleware, providerController.getStats);
router.get("/dashboard-recents", providerMiddleware, providerController.getRecents);

// Job Management Routes 
router.get("/jobs", providerMiddleware, providerController.getJobs);
router.post("/add-job", providerMiddleware, jobValidationRules, providerController.addJob);

router.get("/jobs/:jobId", providerMiddleware, providerController.getJob);
router.put("/edit-job/:jobId", providerMiddleware, jobValidationRules, providerController.editJob);
router.delete("/jobs/:jobId", providerMiddleware, providerController.deleteJob);

// Applicants & Shortlists 
router.get("/view-applicants/:jobId", providerMiddleware, providerController.getApplicantsForJob);
router.get("/view-shortlists/:jobId", providerMiddleware, providerController.getShortlistsForJob);

//Applicant Resume & Actions
router.get("/applicants/view-resume/:applicantItemId", providerMiddleware, providerController.getApplicantResume);
router.patch("/applicants/shortlist/:applicantItemId", providerMiddleware, providerController.shortlistApplicant);
router.patch("/applicants/reject/:applicantItemId", providerMiddleware, providerController.rejectApplicant);

module.exports = router;
