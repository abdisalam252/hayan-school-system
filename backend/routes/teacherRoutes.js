const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/teachers/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const handleUploads = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]);

router.get("/", teacherController.getTeachers);
router.post("/", handleUploads, teacherController.addTeacher);
router.put("/:id", handleUploads, teacherController.updateTeacher);
router.delete("/:id", teacherController.deleteTeacher);

module.exports = router;
