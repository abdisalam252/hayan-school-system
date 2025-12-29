const router = require("express").Router();
const notificationController = require("../controllers/notificationController");

router.get("/", notificationController.getNotifications);
router.post("/", notificationController.createNotification); // Mainly for testing or manual triggers
router.put("/read-all", notificationController.markAllAsRead);
router.put("/:id/read", notificationController.markAsRead);

module.exports = router;
