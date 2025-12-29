const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");

router.get("/", settingsController.getSettings);
router.put("/batch", settingsController.updateSettingsBatch);
router.put("/:key", settingsController.updateSetting);

module.exports = router;
