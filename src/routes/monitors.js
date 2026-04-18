const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getMonitors,
  getMonitor,
  createMonitor,
  updateMonitor,
  deleteMonitor,
  getChecks,      // ← add
  getIncidents    // ← add
} = require("../controllers/monitorController");

router.get("/", auth, getMonitors);
router.get("/:id", auth, getMonitor);
router.post("/", auth, createMonitor);
router.put("/:id", auth, updateMonitor);
router.delete("/:id", auth, deleteMonitor);
router.get("/:id/checks", auth, getChecks);       // ← add
router.get("/:id/incidents", auth, getIncidents); // ← add

module.exports = router;