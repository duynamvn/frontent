"use client"; 
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Card, Table, Container, Row, Col, Form, Pagination, Alert, Spinner, Modal } from "react-bootstrap";

function TeachingAssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topics, setTopics] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [newAssignment, setNewAssignment] = useState({
    topicCode: '',
    teacherId: '',
    classId: '',
    schedule: '',
    activate: false,
  });

  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const assignmentsPerPage = 5;

  useEffect(() => {
    fetchAssignments();
    fetchDropdownData(); // Load dữ liệu cho các dropdown
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
  const fetchDropdownData = async () => {
    try {
      const [topicsResponse, teachersResponse, classesResponse] = await Promise.all([
        axios.get('http://localhost:8080/api/topics'), // Adjust with your endpoint for topics
        axios.get('http://localhost:8080/api/employee-type'), // Adjust with your endpoint for teachers
        axios.get('http://localhost:8080/api/class-rooms'), // Adjust with your endpoint for classes
      ]);
      setTopics(topicsResponse.data);
      setTeachers(teachersResponse.data);
      setClasses(classesResponse.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
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
        setMessage("Cập nhật phân công giảng dạy thành công.");
      } else {
        await axios.post('http://localhost:8080/api/teaching-assignment', newAssignment);
        setMessage("Thêm phân công giảng dạy thành công.");
      }
      fetchAssignments();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving assignment:', error.response ? error.response.data : error.message);
      setMessage("Đã xảy ra lỗi khi lưu thông tin phân công.");
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
  };

  const handleEdit = (id) => {
    const assignmentToEdit = assignments.find((assignment) => assignment.id === id);
    if (assignmentToEdit) {
      setNewAssignment({
        topicCode: assignmentToEdit.course.topic.topicCode,
        teacherId: assignmentToEdit.employee.id,
        classId: assignmentToEdit.course.id,
        schedule: assignmentToEdit.course.session.sessionName,
        activate: assignmentToEdit.activate,
      });
      setEditingAssignmentId(id);
    }
    setShowModal(true);
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
              <Button variant="primary" onClick={() => {
                resetForm();
                setShowModal(true);
              }}>
                Thêm Phân Công
              </Button>
            </Card.Header>

            <Card.Body className="table-full-width table-responsive px-0">
              <Table className="table-hover table-striped">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã Chuyên Đề</th>
                    <th>Tên Giảng Viên</th>
                    <th>Mã Lớp</th>
                    <th>Lịch Dạy</th>
                    <th>Kích Hoạt</th>
                    <th>Tùy Chọn</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAssignments.length > 0 ? (
                    currentAssignments.map((assignment, index) =>(
                      <tr key={assignment.id}>
                        <td>{(currentPage - 1) * assignmentsPerPage + index + 1}</td> {/* Số thứ tự */}
                        <td>{assignment.course && assignment.course.topic ? assignment.course.topic.topicCode : 'N/A'}</td>
                        <td>{assignment.employee ? assignment.employee.fullName : 'N/A'}</td>
                        <td>{assignment.course ? assignment.course.id : 'N/A'}</td>
                        <td>{assignment.course && assignment.course.session ? assignment.course.session.sessionName : 'N/A'}</td>
                        <td>{assignment.activate ? "Kích Hoạt" : "Không Kích Hoạt"}</td>
                        <td>
                          <Button 
                          variant="info" 
                          className="btn-action"
                          style={{ marginRight: "10px" }}
                           onClick={() => handleEdit(assignment.id)}>
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

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingAssignmentId ? "Chỉnh Sửa Phân Công" : "Thêm Phân Công"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formtopicCode">
              <Form.Label>Mã Chuyên Đề</Form.Label>
              <Form.Select name="topicCode" value={newAssignment.topicCode} onChange={handleInputChange} required>
                <option value="">Chọn Chuyên Đề</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.topicCode}>{topic.topicCode}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="formemployee-type">
              <Form.Label>Tên Giảng Viên</Form.Label>
              <Form.Select name="teacherId" value={newAssignment.teacherId} onChange={handleInputChange} required>
                <option value="">Chọn Giảng Viên</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="formClassId">
              <Form.Label>Mã Lớp</Form.Label>
              <Form.Select name="classId" value={newAssignment.classId} onChange={handleInputChange} required>
                <option value="">Chọn Lớp</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.id}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="formSchedule">
              <Form.Label>Lịch Dạy</Form.Label>
              <Form.Control type="text" name="schedule" value={newAssignment.schedule} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formActivate">
              <Form.Check type="checkbox" name="activate" label="Kích Hoạt" checked={newAssignment.activate} onChange={handleInputChange} />
            </Form.Group>
            <Button variant="primary" type="submit">{editingAssignmentId ? "Cập Nhật" : "Thêm"}</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {message && <Alert variant="success">{message}</Alert>}
    </Container>
  );
}

export default TeachingAssignmentList;
