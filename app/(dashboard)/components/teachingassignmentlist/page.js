"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Card, Table, Container, Row, Col, Form, Pagination, Alert, Spinner, Modal } from "react-bootstrap";

function TeachingAssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  
  const [newAssignment, setNewAssignment] = useState({
    courseCode: '',
   
    activate: false,
  });
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const assignmentsPerPage = 5;

  useEffect(() => {
    fetchAssignments();
    fetchDropdownData();
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
      const [coursesResponse, teachersResponse, classesResponse] = await Promise.all([
        axios.get('http://localhost:8080/api/courses'),       
      ]);
      setCourses(coursesResponse.data);
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
      if (!newAssignment.courseCode ) {
        setMessage("Vui lòng điền đầy đủ thông tin.");
        return;
      }
      const assignmentData = {
        courseCode: newAssignment.courseCode,
        activate: newAssignment.activate,
      };
      
      if (editingAssignmentId) {
        await axios.put(`http://localhost:8080/api/teaching-assignment/${editingAssignmentId}`, assignmentData);
        setMessage("Cập nhật phân công giảng dạy thành công.");
      } else {
        await axios.post('http://localhost:8080/api/teaching-assignment', assignmentData);
        setMessage("Thêm phân công giảng dạy thành công.");
      }
      fetchAssignments();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving assignment:', error);
      setMessage("Đã xảy ra lỗi khi lưu thông tin phân công.");
    }
  };

  const resetForm = () => {
    setNewAssignment({
      courseCode: '',
      
      activate: false,
    });
    setEditingAssignmentId(null);
  };

  const handleEdit = (id) => {
    const assignmentToEdit = assignments.find((assignment) => assignment.id === id);
    if (assignmentToEdit) {
      setNewAssignment({
        courseCode: assignmentToEdit.course?.courseCode || '',
       
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

            <Card.Body className="table-full-width table-responsive px-10">
              <Table className="table-hover table-striped">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã Khóa Học</th>
                    
                    <th>Tùy Chọn</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAssignments.length > 0 ? (
                    currentAssignments.map((assignment, index) => (
                      <tr key={assignment.id}>
                        <td>{(currentPage - 1) * assignmentsPerPage + index + 1}</td>
                        <td>{assignment.course?.courseCode || 'N/A'}</td>
                        
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
            <Form.Group controlId="formcourseCode">
              <Form.Label>Mã Khóa Học</Form.Label>
              <Form.Select name="courseCode" value={newAssignment.courseCode} onChange={handleInputChange} required>
                <option value="">Chọn Khóa Học</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.courseCode}>{course.courseCode}</option>  
                ))}
              </Form.Select>
            </Form.Group>
           
            <Form.Group controlId="formactivate">
              <Form.Check 
                type="checkbox"
                label="Kích Hoạt"
                name="activate"
                checked={newAssignment.activate}
                onChange={handleInputChange}
              />
            </Form.Group>
            {message && <Alert variant="warning">{message}</Alert>}
            <Button variant="primary" type="submit">
              {editingAssignmentId ? "Cập Nhật" : "Thêm"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default TeachingAssignmentList;
