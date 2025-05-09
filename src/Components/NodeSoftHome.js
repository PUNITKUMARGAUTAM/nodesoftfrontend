import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "http://localhost:5000";

function NodeSoftHome() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", age: "" });
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, limit: 5 });

  const [showMarksFor, setShowMarksFor] = useState(null);
  const [marks, setMarks] = useState([]);
  const [markForm, setMarkForm] = useState({ subject: "", score: "" });
  const [markEditingId, setMarkEditingId] = useState(null);
  const [markMeta, setMarkMeta] = useState({ total: 0, limit: 5 });
  const [markPage, setMarkPage] = useState(1);

  const fetchStudents = async (pg = 1) => {
    try {
      const res = await axios.get(`${API_URL}/students?page=${pg}&limit=5`);
      setStudents(res.data.data || []);
      setMeta(res.data.meta || { total: 0, limit: 5 });
      setPage(pg);
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudents([]);
    }
  };

  const fetchMarks = async (studentId, pg = 1) => {
    try {
      const res = await axios.get(`${API_URL}/students/${studentId}/marks?page=${pg}&limit=5`);
      setMarks(res.data.data || []);
      setMarkMeta(res.data.meta || { total: 0, limit: 5 });
      setMarkPage(pg);
    } catch (err) {
      console.error("Error fetching marks:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`${API_URL}/students/${editingId}`, form);
        Swal.fire("Updated!", "Student updated successfully!", "success");
      } else {
        await axios.post(`${API_URL}/students`, form);
        Swal.fire("Created!", "Student added successfully!", "success");
      }
      setForm({ name: "", email: "", age: "" });
      setEditingId(null);
      fetchStudents(page);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Unknown error", "error");
    }
  };

  const handleEdit = (student) => {
    setForm(student);
    setEditingId(student.id);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete this student?",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/students/${id}`);
        Swal.fire("Deleted!", "Student deleted.", "success");
        fetchStudents(page);
      } catch (err) {
        Swal.fire("Error", err.response?.data?.error || "Delete failed", "error");
      }
    }
  };

  const handleMarkChange = (e) => {
    setMarkForm({ ...markForm, [e.target.name]: e.target.value });
  };

  const handleMarkSubmit = async (studentId) => {
    try {
      if (markEditingId) {
        await axios.put(`${API_URL}/marks/${markEditingId}`, markForm);
        Swal.fire("Updated!", "Mark updated.", "success");
      } else {
        await axios.post(`${API_URL}/marks`, {
          student_id: studentId,
          ...markForm,
        });
        Swal.fire("Created!", "Mark added.", "success");
      }
      setMarkForm({ subject: "", score: "" });
      setMarkEditingId(null);
      fetchMarks(studentId, markPage);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Error saving mark", "error");
    }
  };

  const handleMarkEdit = (mark) => {
    setMarkForm(mark);
    setMarkEditingId(mark.id);
  };

  const handleMarkDelete = async (id, studentId) => {
    const confirm = await Swal.fire({
      title: "Delete this mark?",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/marks/${id}`);
        Swal.fire("Deleted!", "Mark deleted.", "success");
        fetchMarks(studentId, markPage);
      } catch (err) {
        Swal.fire("Error", "Unable to delete mark.", "error");
      }
    }
  };

  const openMarksSection = (studentId) => {
    setShowMarksFor(studentId);
    fetchMarks(studentId);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Student Management</h2>

      <div className="mb-3">
        <input
          placeholder="Name"
          name="name"
          className="form-control mb-2"
          value={form.name}
          onChange={handleChange}
        />
        <input
          placeholder="Email"
          name="email"
          className="form-control mb-2"
          value={form.email}
          onChange={handleChange}
        />
        <input
          placeholder="Age"
          name="age"
          type="number"
          className="form-control mb-2"
          value={form.age}
          onChange={handleChange}
        />
        <button className="btn btn-primary" onClick={handleSubmit}>
          {editingId ? "Update" : "Create"}
        </button>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Age</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <React.Fragment key={s.id}>
              <tr>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.age}</td>
                <td>
                  <button className="btn btn-sm btn-info me-2" onClick={() => handleEdit(s)}>Edit</button>
                  <button className="btn btn-sm btn-danger me-2" onClick={() => handleDelete(s.id)}>Delete</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => openMarksSection(s.id)}>Marks</button>
                </td>
              </tr>

              {showMarksFor === s.id && (
                <tr>
                  <td colSpan="4">
                    <div className="bg-light p-3">
                      <h5>Marks for {s.name}</h5>
                      <div className="row">
                        <div className="col-md-5">
                          <input
                            className="form-control mb-2"
                            placeholder="Subject"
                            name="subject"
                            value={markForm.subject}
                            onChange={handleMarkChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            className="form-control mb-2"
                            placeholder="Score"
                            name="score"
                            type="number"
                            value={markForm.score}
                            onChange={handleMarkChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <button
                            className="btn btn-success"
                            onClick={() => handleMarkSubmit(s.id)}
                          >
                            {markEditingId ? "Update Mark" : "Add Mark"}
                          </button>
                        </div>
                      </div>

                      <table className="table table-sm">
                        <thead>
                          <tr><th>Subject</th><th>Score</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                          {marks.map((m) => (
                            <tr key={m.id}>
                              <td>{m.subject}</td>
                              <td>{m.score}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-info me-2"
                                  onClick={() => handleMarkEdit(m)}
                                >Edit</button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleMarkDelete(m.id, s.id)}
                                >Delete</button>
                              </td>
                            </tr>
                          ))}
                          {marks.length === 0 && (
                            <tr><td colSpan="3" className="text-center">No marks yet</td></tr>
                          )}
                        </tbody>
                      </table>

                      {markMeta.total > markMeta.limit && (
                        <nav>
                          <ul className="pagination">
                            {Array.from({ length: Math.ceil(markMeta.total / markMeta.limit) }, (_, i) => (
                              <li key={i + 1} className={`page-item ${markPage === i + 1 ? "active" : ""}`}>
                                <button
                                  className="page-link"
                                  onClick={() => fetchMarks(s.id, i + 1)}
                                >{i + 1}</button>
                              </li>
                            ))}
                          </ul>
                        </nav>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {meta.total > meta.limit && (
        <nav>
          <ul className="pagination">
            {Array.from({ length: Math.ceil(meta.total / meta.limit) }, (_, i) => (
              <li key={i + 1} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => fetchStudents(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export default NodeSoftHome;
