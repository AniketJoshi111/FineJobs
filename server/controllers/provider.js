const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const Job = require("../models/job");
const Applicant = require("../models/applicant");
const User = require("../models/user");

const { clearResume } = require("../util/helper");

const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const Job = require("../models/job");
const Applicant = require("../models/applicant");
const User = require("../models/user");

const { clearResume } = require("../util/helper");

// Controllers
const getStats = (req, res, next) => {
  let jobsCount = 0;
  let applicantsCount = 0;
  Job.find({ providerId: req.userId })
    .countDocuments()
    .then((jobs) => {
      jobsCount = jobs;
      return Applicant.find({ providerId: req.userId }).countDocuments();
    })
    .then((applicants) => {
      applicantsCount = applicants;
      return res.status(200).json({
        message: "Successfully fetched the stats",
        stats: { jobsCount, applicantsCount },
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const getRecents = (req, res, next) => {
  Job.find({ providerId: req.userId })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean()
    .then((jobs) => {
      return res.status(200).json({
        message: "Successfully fetched the recent jobs",
        recentJobs: jobs,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const getJobs = (req, res, next) => {
  Job.find({ providerId: req.userId })
    .lean()
    .then((jobs) => {
      res.status(200).json({
        message: "Fetched the list of jobs",
        jobs: jobs,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const addJob = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const newJob = new Job({
    ...req.body,
    providerId: req.userId,
  });
  let jobId;
  newJob
    .save()
    .then((job) => {
      jobId = job._id;
      return User.findById(req.userId);
    })
    .then((user) => {
      user.jobsPosted.push(jobId);
      return user.save();
    })
    .then(() => {
      res.status(201).json({ message: "Job Added Successfully" });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const getJob = (req, res, next) => {
  const jobId = req.params.jobId;

  Job.findOne({ _id: jobId, providerId: req.userId })
    .lean()
    .then((job) => {
      if (!job) {
        const error = new Error("Job not found");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Fetched the job Successfully", job });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const editJob = (req, res, next) => {
  const jobId = req.params.jobId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  Job.findOneAndUpdate({ _id: jobId, providerId: req.userId }, req.body, {
    useFindAndModify: false,
  })
    .then((data) => {
      if (!data) {
        res.status(404).json({
          message: `Cannot update job with id=${jobId}. Maybe job was not found!`,
        });
      } else {
        res.status(200).json({ message: "Job was updated successfully." });
      }
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const deleteJob = (req, res, next) => {
  const jobId = req.params.jobId;
  let resumes = [];
  let applicants = [];

  Job.findOneAndDelete({ _id: jobId, providerId: req.userId })
    .then((data) => {
      if (!data) {
        const error = new Error("Cannot delete job. Job not found!");
        error.statusCode = 404;
        throw error;
      }
      return User.findOneAndUpdate(
        { _id: req.userId },
        { $pull: { jobsPosted: jobId } }
      );
    })
    .then(() => {
      return Applicant.find({ jobId: jobId, providerId: req.userId }).then(
        (docs) => {
          docs.forEach((doc) => resumes.push(doc.resume));
          docs.forEach((doc) => applicants.push(doc._id));
        }
      );
    })
    .then(() => Applicant.deleteMany({ _id: { $in: applicants } }))
    .then(() => {
      resumes.forEach((resume) => clearResume(resume));
      res.json({ message: "Job record was deleted successfully!" });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const getApplicantsForJob = (req, res, next) => {
  const jobId = req.params.jobId;
  const providerId = req.userId;

  Applicant.find({
    providerId,
    jobId,
    status: { $regex: "Applied", $options: "i" },
  })
    .populate("userId", "name")
    .lean()
    .then((applicants) => {
      if (!applicants) {
        return res
          .status(200)
          .json({ message: "Looks like no one has applied yet!" });
      }
      return res.status(200).json({
        message: "Successfully fetched the applicants",
        applicants,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const getShortlistsForJob = (req, res, next) => {
  const jobId = req.params.jobId;
  const providerId = req.userId;

  Applicant.find({
    providerId,
    jobId,
    status: { $regex: "Shortlisted", $options: "i" },
  })
    .populate("userId", "name email")
    .lean()
    .then((applicants) => {
      if (!applicants) {
        return res
          .status(200)
          .json({ message: "Looks like no one has been shortlisted yet!" });
      }
      return res.status(200).json({
        message: "Successfully fetched the applicants",
        shortlists: applicants,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const getApplicantResume = (req, res, next) => {
  const applicantId = req.params.applicantItemId;
  Applicant.findOne({ _id: applicantId, providerId: req.userId })
    .lean()
    .then((applicant) => {
      if (!applicant) {
        return res.status(404).json({ message: "Applicant not found" });
      }
      const resumePath = path.join(applicant.resume);
      fs.readFile(resumePath, (err, data) => {
        if (err) return next(err);
        res.setHeader("Content-type", "application/pdf");
        res.send(data);
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const shortlistApplicant = (req, res, next) => {
  const applicantItemId = req.params.applicantItemId;
  Applicant.findById({ _id: applicantItemId })
    .then((applicant) => {
      if (!applicant) {
        return res.status(401).json({ message: "Applicant not found" });
      }
      if (applicant.providerId.toString() !== req.userId.toString()) {
        const error = new Error("You are unauthorized to do the action!");
        error.statusCode = 401;
        throw error;
      }
      if (applicant.status === "Shortlisted") {
        return res.status(409).json({ message: "Already shortlisted!" });
      }
      applicant.status = "Shortlisted";
      return applicant.save();
    })
    .then(() => {
      res.status(200).json({ message: "Shortlisted the candidate!" });
    })
    .catch((err) => {
      next(err);
    });
};

const rejectApplicant = (req, res, next) => {
  const applicantItemId = req.params.applicantItemId;

  Applicant.findById(applicantItemId)
    .then((applicant) => {
      if (!applicant) {
        return res.status(404).json({ message: "Applicant not found!" });
      }
      if (req.userId.toString() !== applicant.providerId.toString()) {
        const error = new Error("You are unauthorized to do the action!");
        error.statusCode = 401;
        throw error;
      }
      clearResume(applicant.resume);
      return Applicant.findByIdAndDelete(applicantItemId);
    })
    .then(() => {
      return res
        .status(200)
        .json({ message: "Applicant rejected successfully!" });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const postShortlist = async (req, res, next) => {
  const applicantId = req.params.applicantId;

  try {
    const applicant = await Applicant.findById(applicantId)
      .populate("userId")
      .populate("jobId");

    if (!applicant) {
      const error = new Error("Applicant not found.");
      error.statusCode = 404;
      throw error;
    }

    applicant.status = "shortlisted";
    await applicant.save();

    if (applicant.userId && applicant.userId.email) {
      await transporter.sendMail({
        to: applicant.userId.email,
        from: process.env.EMAIL_USER,
        subject: `Congratulations! You've been shortlisted for ${applicant.jobId.title}`,
        html: `
          <h1>Hello ${applicant.name},</h1>
          <p>We are pleased to inform you that you have been shortlisted for the position of <strong>${applicant.jobId.title}</strong>.</p>
          <p>The hiring manager will be in touch with the next steps soon.</p>
          <p>Best regards,<br/>The Hiring Team</p>
        `,
      });
    }

    res
      .status(200)
      .json({ message: "Applicant shortlisted successfully and email sent." });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

// Grouped export
module.exports = {
  getStats,
  getRecents,
  getJobs,
  addJob,
  getJob,
  editJob,
  deleteJob,
  getApplicantsForJob,
  getShortlistsForJob,
  getApplicantResume,
  shortlistApplicant,
  rejectApplicant,
  postShortlist,
};
