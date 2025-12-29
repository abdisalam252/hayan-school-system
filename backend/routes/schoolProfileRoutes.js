const express = require("express");
const router = express.Router();
const schoolProfileController = require("../controllers/schoolProfileController");
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Use fieldname to differentiate logo vs banners if needed, or just timestamp
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get("/", schoolProfileController.getProfile);
router.put("/", upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner1', maxCount: 1 },
    { name: 'banner2', maxCount: 1 },
    { name: 'banner3', maxCount: 1 }
]), schoolProfileController.updateProfile);

module.exports = router;
