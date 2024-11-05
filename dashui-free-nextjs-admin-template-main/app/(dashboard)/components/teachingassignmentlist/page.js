"use client"; 
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Card, Table, Container, Row, Col, Form, Pagination, Alert, Spinner } from "react-bootstrap";

function TeachingAssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    topicCode: '',
    teacherId: '',
    classId: '',
    schedule: '',
    activate: false,
  });
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const assignmentsPerPage = 5;

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/teaching-assignment');
      setAssignments(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch teaching assignments');
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAssignment({
      ...newAssignment,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssignmentId) {
        await axios.put(`http://localhost:8080/api/teaching-assignment/${editingAssignmentId}`, newAssignment);
        alert("Cập nhật phân công giảng dạy thành công.");
      } else {
        await axios.post('http://localhost:8080/api/teaching-assignment', newAssignment);
        alert("Thêm phân công giảng dạy thành công.");
      }
      fetchAssignments();
      resetForm();
    } catch (error) {
      console.error('Error saving assignment:', error.response ? error.response.data : error.message);
      alert("Đã xảy ra lỗi khi lưu thông tin phân công.");
    }
  };

  const resetForm = () => {
    setNewAssignment({
      topicCode: '',
      teacherId: '',
      classId: '',
      schedule: '',
      activate: false,
    });
    setEditingAssignmentId(null);
    setShowForm(false);
  };

  const handleEdit = (id) => {
    const assignmentToEdit = assignments.find((assignment) => assignment.id === id);
    if (assignmentToEdit) {
      setNewAssignment({
        ...assignmentToEdit,
        activate: assignmentToEdit.activate,
      });
      setEditingAssignmentId(id);
      setShowForm(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phân công này không?")) {
      try {
        await axios.delete(`http://localhost:8080/api/teaching-assignment/${id}`);
        fetchAssignments();
        alert("Xóa phân công giảng dạy thành công.");
      } catch (error) {
        console.error('Error deleting assignment:', error);
        alert("Đã xảy ra lỗi khi xóa phân công.");
      }
    }
  };

  const indexOfLastAssignment = currentPage * assignmentsPerPage;
  const indexOfFirstAssignment = indexOfLastAssignment - assignmentsPerPage;
  const currentAssignments = assignments.slice(indexOfFirstAssignment, indexOfLastAssignment);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header>
              <Card.Title as="h2">Danh sách Phân Công Giảng Dạy</Card.Title>
              <Button variant="primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Hủy' : 'Thêm Phân Công'}
              </Button>
            </Card.Header>

            {showForm && (
              <Form onSubmit={handleSubmit}>
                <Card.Body>
                  <Form.Group controlId="formtopicCode">
                    <Form.Label>Mã Chuyên Đề</Form.Label>
                    <Form.Control type="text" name="topicCode" value={newAssignment.topicCode} onChange={handleInputChange} required />
                  </Form.Group>
                  <Form.Group controlId="formTeacherId">
                    <Form.Label>Mã Giảng Viên</Form.Label>
                    <Form.Control type="text" name="teacherId" value={newAssignment.teacherId} onChange={handleInputChange} required />
                  </Form.Group>
                  <Form.Group controlId="formClassId">
                    <Form.Label>Mã Lớp</Form.Label>
                    <Form.Control type="text" name="classId" value={newAssignment.classId} onChange={handleInputChange} required />
                  </Form.Group>
                  <Form.Group controlId="formSchedule">
                    <Form.Label>Lịch Dạy</Form.Label>
                    <Form.Control type="text" name="schedule" value={newAssignment.schedule} onChange={handleInputChange} required />
                  </Form.Group>
                  <Form.Group controlId="formActivate">
                    <Form.Check type="checkbox" label="Kích Hoạt" name="activate" checked={newAssignment.activate} onChange={handleInputChange} />
                  </Form.Group>
                  <Button variant="success" type="submit">
                    {editingAssignmentId ? 'Cập Nhật Phân Công' : 'Thêm Phân Công'}
                  </Button>
                </Card.Body>
              </Form>
            )}

            <Card.Body className="table-full-width table-responsive px-0">
              <Table className="table-hover table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mã Chuyên Đề</th>
                    <th>Mã Giảng Viên</th>
                    <th>Mã Lớp</th>
                    <th>Lịch Dạy</th>
                    <th>Kích Hoạt</th>
                    <th>Tùy Chọn</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAssignments.length > 0 ? (
                    currentAssignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>{assignment.id}</td>
                        <td>{assignment.topicCode}</td>
                        <td>{assignment.teacherId}</td>
                        <td>{assignment.classId}</td>
                        <td>{assignment.schedule}</td>
                        <td>{assignment.activate ? "Kích Hoạt" : "Không Kích Hoạt"}</td>
                        <td>
                          <Button variant="info" className="btn-action" onClick={() => handleEdit(assignment.id)}>
                            Sửa
                          </Button>
                          <Button variant="danger" onClick={() => handleDelete(assignment.id)}>
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">Không tìm thấy phân công nào</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <Pagination>
                {Array.from({ length: Math.ceil(assignments.length / assignmentsPerPage) }, (_, i) => (
                  <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => paginate(i + 1)}>
                    {i + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default TeachingAssignmentList;
