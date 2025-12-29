const express = require("express");
const cors = require("cors");
const studentRoutes = require("./routes/studentRoutes");
const classRoutes = require("./routes/classRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const financeRoutes = require("./routes/financeRoutes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Hayan School API");
});

app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/issues", require("./routes/issueRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/library", require("./routes/libraryRoutes"));
app.use("/api/transport", require("./routes/transportRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/school-profile", require("./routes/schoolProfileRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Recycle Bin Routes
const recycleBinController = require("./controllers/recycleBinController");
app.get("/api/recycle-bin", recycleBinController.getDeletedItems);
app.post("/api/recycle-bin/restore", recycleBinController.restoreItem);
app.delete("/api/recycle-bin/:type/:id", recycleBinController.forceDelete);

// Backup Routes
const backupController = require('./controllers/backupController');
app.get('/api/backup/export', backupController.exportBackup);
app.post('/api/backup/restore', backupController.restoreBackup);

// Bank Routes
const bankController = require("./controllers/bankController");
app.get("/api/banks", bankController.getAccounts);
app.post("/api/banks", bankController.createAccount);
app.put("/api/banks/:id", bankController.updateAccount);
app.delete("/api/banks/:id", bankController.deleteAccount);
app.post("/api/banks/transaction", bankController.bankTransaction);

// Server port
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} `);
});