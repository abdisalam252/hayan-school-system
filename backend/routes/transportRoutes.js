const express = require("express");
const router = express.Router();
const transportController = require("../controllers/transportController");

router.get("/", transportController.getRoutes);
router.post("/", transportController.addRoute);
router.put("/:id", transportController.updateRoute);
router.delete("/:id", transportController.deleteRoute);

module.exports = router;
