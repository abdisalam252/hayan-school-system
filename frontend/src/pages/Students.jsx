import React, { useState, useEffect } from "react";
import { read, utils } from 'xlsx';
import { Plus, Search, Filter, User, Users, School, Phone, Calendar, Clock, Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle, AlertTriangle, MessageSquare, Trash2, Edit2 } from "lucide-react";
import Modal from "../components/Modal";
import ActionMenu from "../components/ActionMenu";

import { API_BASE_URL } from "../config";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [filterStatus, setFilterStatus] = useState("Active"); // 'Active' or 'Left'
  const [filterFree, setFilterFree] = useState("All"); // 'All' or 'Free'
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isIssuesModalOpen, setIsIssuesModalOpen] = useState(false);
  const [selectedStudentForIssues, setSelectedStudentForIssues] = useState(null);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [studentToPromote, setStudentToPromote] = useState(null);

  // Initial state updated for new fields
  const initialFormState = {
    name: "",
    grade: "", // Will be auto-filled based on class selection
    class_id: "",
    parent: "",
    phone: "",
    age: "",
    admission_date: new Date().toISOString().split('T')[0], // Default to today
    gender: "Male",
    health_status: "",
    is_free: false,
    status: "Active"
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingStudent, setEditingStudent] = useState(null);

  const API_URL = `${API_BASE_URL}/api/students`;
  const CLASS_API_URL = `${API_BASE_URL}/api/classes`;
  const ISSUES_API_URL = `${API_BASE_URL}/api/issues`;

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        console.error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(CLASS_API_URL);
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (e) { console.error("Error fetching classes", e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        // Update existing student
        const response = await fetch(`${API_URL}/${editingStudent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updatedStudent = await response.json();
          setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        } else {
          console.error("Failed to update student");
        }
      } else {
        // Add new student
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newStudent = await response.json();
          setStudents([...students, newStudent]);
        } else {
          console.error("Failed to add student");
        }
      }
      closeModal();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStudents(students.filter(s => s.id !== id));
      } else {
        console.error("Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      grade: student.grade,
      class_id: student.class_id || "",
      parent: student.parent || "",
      phone: student.phone || "",
      age: student.age || "",
      admission_date: student.admission_date ? student.admission_date.split('T')[0] : "",
      gender: student.gender || "Male",
      health_status: student.health_status || "",
      is_free: student.is_free || false,
      status: student.status || "Active"
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData(initialFormState);
  };

  const openIssuesModal = (student) => {
    setSelectedStudentForIssues(student);
    setIsIssuesModalOpen(true);
  };

  const openPromoteModal = (student) => {
    setStudentToPromote(student);
    setIsPromoteModalOpen(true);
  };

  const handleClassChange = (e) => {
    const selectedClassId = e.target.value;
    const selectedClass = classes.find(c => c.id.toString() === selectedClassId);
    setFormData({
      ...formData,
      class_id: selectedClassId,
      grade: selectedClass ? selectedClass.name : ""
    });
  };

  const filteredStudents = students.filter(student => {
    // 1. Filter by Status (Active/Inactive vs Left)
    const isLeft = student.status === "Left";
    if (filterStatus === "Active" && isLeft) return false; // Hide Left students in Active view
    if (filterStatus === "Left" && !isLeft) return false;  // Hide Active students in Left view

    // 2. Filter by Free/Scholarship
    if (filterFree === "Free" && !student.is_free) return false;

    // 2. Filter by Search Term
    const matchesSearch = (
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.phone && student.phone.includes(searchTerm)) ||
      (student.grade && student.grade.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!matchesSearch) return false;

    // 3. Filter by Class/Grade
    if (selectedClass && selectedClass !== "All Grades") {
      if (student.grade !== selectedClass) return false;
    }

    return true;
  });

  // Calculate stats for the current view
  const totalFreeStudents = students.filter(s => s.is_free && s.status !== 'Left').length;

  // --- CSV Import Logic ---

  const downloadTemplate = () => {
    // Removed "Grade" from headers as it's redundant with Class Name
    const headers = ["Name,Class Name,Parent Name,Phone,Age,Gender,Admission Date,Health Status,Scholarship (Yes/No)"];
    const example = ["John Doe,KG 1-A,Jane Doe,615123456,6,Male,2024-09-01,Normal,No"];
    // Add BOM for Excel compatibility
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.concat(example).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    // Explicitly name the file with .csv extension
    link.setAttribute("download", "student_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ImportModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [message, setMessage] = useState('');
    const [report, setReport] = useState(null);

    // Reset state when modal opens
    useEffect(() => {
      if (isOpen) {
        setFile(null);
        setStatus('idle');
        setMessage('');
        setReport(null);
      }
    }, [isOpen]);

    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const f = e.target.files[0];
        // Allow .csv, .txt, .xlsx, .xls
        const name = f.name.toLowerCase();
        const isValid = name.endsWith('.csv') || name.endsWith('.txt') || name.endsWith('.xlsx') || name.endsWith('.xls');

        if (!isValid) {
          setStatus('error');
          setMessage('Please upload a valid file (.csv, .txt, .xlsx, .xls).');
          return;
        }
        setFile(f);
        setStatus('idle');
        setMessage('');
        setReport(null);
      }
    };

    const processRow = (headers, values, rowNum) => {
      const obj = {};
      let rowError = null;

      headers.forEach((h, i) => {
        let val = values[i] !== undefined && values[i] !== null ? String(values[i]).trim() : '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);

        if (h.includes('class')) {
          if (val) {
            // Strict Matching
            const normalizedInput = val.toLowerCase().replace(/\s+/g, ' ').trim();
            const matchedClass = classes.find(c => c.name.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedInput);

            if (matchedClass) {
              obj['class_id'] = matchedClass.id;
              const gradePart = matchedClass.name.split('-')[0].trim();
              obj['grade'] = gradePart;
            } else {
              rowError = `Row ${rowNum}: Class '${val}' not found.`;
            }
          }
        }
        else if (h.includes('scholarship') || h.includes('free')) {
          obj['is_free'] = ['yes', 'true', '1'].includes(val.toLowerCase());
        }
        else if (h.includes('date') || h === 'admission') obj['admission_date'] = val;
        else if (h.includes('health') || h.includes('medical')) obj['health_status'] = val;
        else if (h.includes('parent')) obj['parent'] = val;
        else if (h === 'name' || h === 'full_name') obj['name'] = val;
        else if (!h.includes('grade')) {
          obj[h] = val;
        }
      });

      if (!rowError && !obj['name']) {
        rowError = `Row ${rowNum}: Student Name is missing.`;
      }

      return { obj, error: rowError };
    };

    const parseExcel = (buffer) => {
      try {
        const wb = read(buffer, { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays

        if (!jsonData || jsonData.length < 2) return { validData: [], errors: [] };

        const headers = jsonData[0].map(h => String(h).trim().toLowerCase().replace(/[\s\(\)\/]/g, '_').replace(/_+/g, '_'));
        const validData = [];
        const errors = [];

        jsonData.slice(1).forEach((row, index) => {
          if (row.length === 0) return; // Skip empty rows
          const { obj, error } = processRow(headers, row, index + 2);
          if (error) errors.push(error);
          else validData.push(obj);
        });

        return { validData, errors };
      } catch (e) {
        console.error(e);
        return { validData: [], errors: ["Failed to parse Excel file"] };
      }
    };

    const parseCSV = (text) => {
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) return { validData: [], errors: [] };

      // Detect delimiter
      const firstLine = lines[0];
      const tabCount = (firstLine.match(/\t/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      const delimiter = tabCount > commaCount ? '\t' : ',';

      const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/[\s\(\)\/]/g, '_').replace(/_+/g, '_'));

      const validData = [];
      const errors = [];

      lines.slice(1).forEach((line, index) => {
        const values = line.split(delimiter);
        const { obj, error } = processRow(headers, values, index + 2);
        if (error) errors.push(error);
        else validData.push(obj);
      });

      return { validData, errors };
    };

    const handleImport = () => {
      if (!file) return;
      setStatus('uploading');

      const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          let result;
          if (isExcel) {
            const buffer = e.target.result;
            result = parseExcel(buffer);
          } else {
            const text = e.target.result;
            result = parseCSV(text);
          }

          const { validData, errors } = result;

          if (errors.length > 0) {
            setStatus('error');
            setReport({ success: 0, failed: errors.length, errors: errors });
            setMessage(`Found ${errors.length} errors in file. Please fix and re-upload.`);
            return;
          }

          if (validData.length === 0) {
            throw new Error("No valid student data found in file");
          }

          const res = await fetch(`${API_URL}/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validData)
          });

          const importResult = await res.json();

          if (res.ok) {
            setStatus('success');
            setReport(importResult.summary);
            setMessage(`Imported: ${importResult.summary.success} success, ${importResult.summary.failed} failed.`);
            if (importResult.summary.success > 0 && importResult.summary.failed === 0) onSuccess();
          } else {
            throw new Error(importResult.error || "Import failed");
          }

        } catch (err) {
          console.error(err);
          setStatus('error');
          setMessage(err.message || "Failed to process file");
        }
      };

      if (isExcel) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Import Students via CSV</h3>

          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3 font-medium">1. Download the template</p>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700/50 rounded-lg text-sm text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition-all w-full justify-center"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Download CSV Template
              </button>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-2 text-center">Contains headers: Name, Class Name, Parent, etc.</p>
            </div>

            <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-center group">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".csv,.txt,.xlsx,.xls"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title="Upload CSV, Excel, or Text file"
              />
              <div className="space-y-2 pointer-events-none">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-colors ${file ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                  {file ? <CheckCircle className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {file ? file.name : "Upload the file (xlsx or xls) by clicking on the Upload File button below"}
                </p>
                <p className="text-xs text-gray-500">Supported: .csv, .txt, .xlsx, .xls</p>
              </div>
            </div>

            {status === 'error' && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-2">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {message}
                </div>
                {report && report.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs text-red-500 border border-red-100 dark:border-red-900/50">
                    <p className="font-semibold mb-1">Row Errors:</p>
                    {report.errors.map((e, i) => <p key={i} className="mb-0.5">{e}</p>)}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!file || status === 'uploading'}
              className={`w-full py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                            ${!file || status === 'uploading' ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20'}
                        `}
            >
              {status === 'uploading' ? 'Importing...' : 'Start Import'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Issues Management Logic ---
  const IssuesModal = ({ student, isOpen, onClose }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newIssue, setNewIssue] = useState({ type: 'Behavior', title: '', description: '', status: 'Open' });

    useEffect(() => {
      if (isOpen && student) {
        fetchIssues();
      }
    }, [isOpen, student]);

    const fetchIssues = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${ISSUES_API_URL}/student/${student.id}`);
        if (res.ok) {
          const data = await res.json();
          setIssues(data);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };

    const handleAddIssue = async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(ISSUES_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newIssue, student_id: student.id, date: new Date().toISOString().split('T')[0] })
        });
        if (res.ok) {
          fetchIssues();
          setNewIssue({ type: 'Behavior', title: '', description: '', status: 'Open' });
        }
      } catch (e) { console.error(e); }
    };

    const handleDeleteIssue = async (id) => {
      if (!window.confirm("Delete this issue record?")) return;
      try {
        await fetch(`${ISSUES_API_URL}/${id}`, { method: 'DELETE' });
        setIssues(issues.filter(i => i.id !== id));
      } catch (e) { console.error(e); }
    };

    if (!isOpen || !student) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-6 relative h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Student Issues</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage records for <span className="font-semibold text-brand-600">{student.name}</span></p>
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
            {/* Left: Issue List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {loading ? (
                <p className="text-center text-gray-500 text-sm mt-10">Loading records...</p>
              ) : issues.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2 opacity-50" />
                  <p className="text-gray-500 text-sm">No issues recorded.</p>
                </div>
              ) : (
                issues.map(issue => (
                  <div key={issue.id} className="p-4 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl shadow-sm group hover:border-brand-200 dark:hover:border-brand-700 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${issue.type === 'Behavior' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          issue.type === 'Academic' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            issue.type === 'Medical' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                          }`}>{issue.type}</span>
                        <span className="text-xs text-gray-400">{new Date(issue.date).toLocaleDateString()}</span>
                      </div>
                      <button onClick={() => handleDeleteIssue(issue.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{issue.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2">{issue.description}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Status: <span className={`${issue.status === 'Open' ? 'text-amber-600' : 'text-green-600'} font-medium`}>{issue.status}</span></span>
                      <span className="text-gray-400 italic">By: {issue.reported_by}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right: Add Form */}
            <div className="w-full md:w-72 shrink-0 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 h-fit">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Report New Issue</h4>
              <form onSubmit={handleAddIssue} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                  <select
                    value={newIssue.type}
                    onChange={e => setNewIssue({ ...newIssue, type: e.target.value })}
                    className="w-full text-sm mt-1 p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                  >
                    <option>Behavior</option>
                    <option>Academic</option>
                    <option>Medical</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                  <input
                    required
                    type="text"
                    value={newIssue.title}
                    onChange={e => setNewIssue({ ...newIssue, title: e.target.value })}
                    className="w-full text-sm mt-1 p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                    placeholder="Brief summary..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                  <textarea
                    rows="3"
                    value={newIssue.description}
                    onChange={e => setNewIssue({ ...newIssue, description: e.target.value })}
                    className="w-full text-sm mt-1 p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                    placeholder="Detailed details..."
                  ></textarea>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                  <select
                    value={newIssue.status}
                    onChange={e => setNewIssue({ ...newIssue, status: e.target.value })}
                    className="w-full text-sm mt-1 p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                  >
                    <option>Open</option>
                    <option>Resolved</option>
                    <option>Dismissed</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors mt-2">
                  Add Record
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and view all registered students.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Upload className="w-5 h-5" />
            Import
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20"
          >
            <Plus className="w-5 h-5" />
            Add Student
          </button>
        </div>
      </div>

      {/* Stats Cards - New Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-blue-100 font-medium">Total Students</p>
            <h3 className="text-2xl font-bold text-white">{students.filter(s => s.status !== 'Left').length}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-emerald-100 font-medium">Active Students</p>
            <h3 className="text-2xl font-bold text-white">{students.filter(s => s.status === 'Active').length}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-2xl shadow-lg shadow-purple-500/20 flex items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <School className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-purple-100 font-medium">Scholarship Grant</p>
            <h3 className="text-2xl font-bold text-white">{totalFreeStudents}</h3>
          </div>
        </div>
      </div>

      {/* Filters and Search - Redesigned */}
      <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-2 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm border-none focus:ring-0 outline-none text-gray-700 dark:text-white placeholder-gray-400"
          />
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 px-2">
          <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
            <button onClick={() => setFilterStatus("Active")} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === 'Active' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Active</button>
            <button onClick={() => setFilterStatus("Left")} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === 'Left' ? 'bg-white dark:bg-gray-600 shadow-sm text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Left</button>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
            <button onClick={() => setFilterFree("All")} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterFree === 'All' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>All</button>
            <button onClick={() => setFilterFree("Free")} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterFree === 'Free' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Scholarship</button>
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 text-gray-700 dark:text-gray-300"
          >
            <option value="All Grades">All Grades</option>
            {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Students Table - Card Style */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Student Info</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Class</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Parent Info</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span className="text-sm text-gray-400">Loading students...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${student.gender === 'Female' ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                          {student.name ? student.name.substring(0, 2).toUpperCase() : "??"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">{student.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="capitalize">{student.gender || "N/A"}</span>
                            <span>•</span>
                            <span>{student.age ? `${student.age} yrs` : "Age N/A"}</span>
                            {student.is_free && (
                              <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Scholarship</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs font-semibold">
                          {student.grade || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        {student.phone ? (
                          <span className="font-mono text-xs">{student.phone}</span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">No Phone</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{student.parent || "N/A"}</p>
                      <p className="text-xs text-gray-400">Parent/Guardian</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold gap-1.5 ${student.status === "Active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" :
                        student.status === "Left" ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600" :
                          "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-emerald-500' : student.status === 'Left' ? 'bg-gray-500' : 'bg-amber-500'}`}></span>
                        {student.status || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openIssuesModal(student)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                          title="Report Issue"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                        <ActionMenu
                          onEdit={() => openEditModal(student)}
                          onDelete={() => handleDelete(student.id)}
                          onPromote={() => openPromoteModal(student)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-gray-900 dark:text-white font-medium mb-1">No students found</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">We couldn't find any students matching your search filters.</p>
                      <button onClick={() => { setSearchTerm(''); setFilterStatus('Active'); setFilterFree('All'); setSelectedClass('All Grades'); }} className="mt-4 text-brand-600 hover:text-brand-700 font-medium text-sm">Clear all filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Static for now) - Minimalist */}
        {filteredStudents.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between text-xs">
            <span className="text-gray-400">Total Records: <strong className="text-gray-700 dark:text-gray-300">{filteredStudents.length}</strong></span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" disabled>Previous</button>
              <button className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal - Modernized */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingStudent ? "Edit Student Details" : "Register New Student"}>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Personal Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="Student Name" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
                <input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="Age" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Admission Date</label>
                <input type="date" value={formData.admission_date} onChange={e => setFormData({ ...formData, admission_date: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
              </div>
            </div>
          </div>




          {/* Academic & Contact Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Academic & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
                <select
                  required
                  value={formData.class_id}
                  onChange={handleClassChange}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="61 XXX XXX" />
                </div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Parent / Guardian Name</label>
                <input type="text" value={formData.parent} onChange={e => setFormData({ ...formData, parent: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="Parent Name" />
              </div>
            </div>

            {/* Status & Free Toggle */}
            {editingStudent && (
              <div className="space-y-1 pt-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Student Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Left">Left School</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_free"
                checked={formData.is_free}
                onChange={e => setFormData({ ...formData, is_free: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="is_free" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                Free Student (Scholarship)
              </label>
            </div>
          </div>


          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Health / Medical Conditions</label>
            <textarea
              rows="2"
              value={formData.health_status}
              onChange={e => setFormData({ ...formData, health_status: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
              placeholder="E.g. Asthma, Allergies, Hearing impairment..."
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-700 mt-6">
            <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-500/20">
              {editingStudent ? "Update Details" : "Register Student"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => { setIsImportModalOpen(false); fetchStudents(); }}
      />

      {/* Issues Modal */}
      <IssuesModal
        student={selectedStudentForIssues}
        isOpen={isIssuesModalOpen}
        onClose={() => setIsIssuesModalOpen(false)}
      />


      {/* Promote Modal */}
      {studentToPromote && (
        <Modal
          isOpen={isPromoteModalOpen}
          onClose={() => { setIsPromoteModalOpen(false); setStudentToPromote(null); }}
          title="Promote Student"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Promote <span className="font-bold text-gray-900 dark:text-white">{studentToPromote.name}</span> to a new class.
              Current Class: <span className="font-semibold">{studentToPromote.grade}</span>
            </p>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Warning</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">This action will update the student's class and grade immediately.</p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const newClassId = e.target.class_id.value;
                if (!newClassId) return;
                const newClass = classes.find(c => c.id.toString() === newClassId);
                if (!newClass) return;

                try {
                  const res = await fetch(`${API_URL}/${studentToPromote.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ...studentToPromote,
                      class_id: newClassId,
                      grade: newClass.name
                    })
                  });
                  if (res.ok) {
                    const updated = await res.json();
                    setStudents(students.map(s => s.id === updated.id ? updated : s));
                    setIsPromoteModalOpen(false);
                    setStudentToPromote(null);
                  }
                } catch (err) { console.error(err); }
              }}
              className="mt-4"
            >
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Class</label>
              <select name="class_id" required className="w-full mt-1 px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/20">
                <option value="">Select Target Class</option>
                {classes.filter(c => c.name !== studentToPromote.grade).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setIsPromoteModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg shadow-green-500/20">Confirm Promotion</button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div >
  );
};
export default Students;