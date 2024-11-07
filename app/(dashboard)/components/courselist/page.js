"use client";
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Badge,
  Pagination,
} from "react-bootstrap";
import axios from "axios";


const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [studentsInCourse, setStudentsInCourse] = useState([]);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [newCourse, setNewCourse] = useState({
    courseCode: "",
    courseName: "",
    startDate: "",
    endDate: "",
    totalStudent: 0,
    activate: false,
    topicId: "",
  });
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  // Fetch courses and topics on component mount
  useEffect(() => {
    fetchCourses();
    fetchTopics();
  }, []);

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Đã có lỗi xảy ra khi tải dữ liệu khóa học.");
    }
  };

  // Fetch topics from API
  const fetchTopics = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/topics");
      setTopics(response.data);
    } catch (error) {
      console.error("Error fetching topics:", error);
      setError("Đã có lỗi xảy ra khi tải dữ liệu chuyên đề.");
      setTopics(response.data);

    }
  };

  const fetchStudentsForCourse = async (courseId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/courses/students/${courseId}`
      );
      setStudentsInCourse(response.data);
      setSelectedCourse(courseId); // Lưu lại khóa học đã chọn
      setShowStudentsModal(true); // Hiển thị modal
    } catch (error) {
      console.error("Error fetching students for course:", error);
      // Thêm thông báo lỗi chi tiết
      if (error.response) {
        // Lỗi từ server
        setError(`Lỗi: ${error.response.status} - ${error.response.data.message}`);
      } else if (error.request) {
        // Lỗi khi không nhận được phản hồi từ server
        setError("Không nhận được phản hồi từ server.");
      } else {
        // Lỗi khác
        setError("Đã có lỗi xảy ra khi tải học viên.");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse({ ...newCourse, [name]: value });
  };
  

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setNewCourse({
      courseCode: "",
      courseName: "",
      startDate: "",
      endDate: "",
      totalStudent: 0,
      activate: false,
      topicId: "", 
    });
    setEditingCourseId(null);
    setShowModal(false);
    setSuccessMessage("");
    setError("");
    setFormError({});
  };

  const handleEdit = (id) => {
    const courseToEdit = courses.find((course) => course.id === id);
    setNewCourse(courseToEdit);
    setEditingCourseId(id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) {
      try {
        await axios.delete(`http://localhost:8080/api/courses/${id}`);
        fetchCourses();
        setSuccessMessage("Bạn đã xóa khóa học thành công.");
      } catch (error) {
        console.error("Error deleting course:", error);
        setError("Đã có lỗi xảy ra khi xóa khóa học.");
      }
    }
  };
  const handlePaymentChange = (e, studentId) => {
    const updatedStudents = studentsInCourse.map((student) => {
      if (student.id === studentId) {
        student.collectedMoney = e.target.value === 'paid' ? 'paid' : 'unpaid'; // Cập nhật collectedMoney
      }
      return student;
    });
    setStudentsInCourse(updatedStudents); // Cập nhật lại state
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    // Validate form inputs
    if (!newCourse.courseCode) errors.courseCode = true;
    if (!newCourse.courseName) errors.courseName = true;
    if (!newCourse.startDate) errors.startDate = true;
    if (!newCourse.endDate) errors.endDate = true;
    if (newCourse.totalStudent <= 0) errors.totalStudent = true;

    // If there are errors, update state and return
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    try {
      if (editingCourseId) {
        await axios.put(
          `http://localhost:8080/api/courses/${editingCourseId}`,
          newCourse
        );
        setSuccessMessage("Bạn đã cập nhật khóa học thành công.");
      } else {
        await axios.post("http://localhost:8080/api/courses", newCourse);
        setSuccessMessage("Bạn đã thêm khóa học thành công.");
      }
      fetchCourses();
      resetForm();
    } catch (error) {
      console.error("Error saving course:", error);
      setError("Đã có lỗi xảy ra khi lưu thông tin khóa học.");
    }
  };

  // Phân trang
  const indexOfLastCourse = currentPage * itemsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - itemsPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Card className="strpied-tabled-with-hover">
            <Card.Header>
              <Card.Title as="h2">Danh Sách Khóa Học</Card.Title>
              <Button variant="primary" onClick={handleAddNew}>
                Thêm Khóa Học
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã Khóa Học</th>
                    <th>Tên Khóa Học</th>                 
                    <th>Ngày Bắt Đầu</th>
                    <th>Ngày Kết Thúc</th>
                    <th>Số Học Viên</th>
                    <th>Kích Hoạt</th>
                    <th>Tùy Chọn</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCourses.map((course, index) => (
                    <tr key={course.id}>
                      <td>{index + indexOfFirstCourse + 1}</td>
                      <td>{course.courseCode}</td>
                      <td>
                        {course.courseName}
                        <Button
                          variant="link"
                          onClick={() => fetchStudentsForCourse(course.id)}
                          style={{ paddingLeft: "10px" }}
                        >
                          Xem Học Viên
                        </Button>
                      </td>
                      
                      <td>{new Date(course.startDate).toLocaleDateString()}</td>
                      <td>{new Date(course.endDate).toLocaleDateString()}</td>
                      <td>{course.totalStudent}</td>
                      <td>
                        {course.activate ? (
                          <Badge variant="success">Đang Mở</Badge>
                        ) : (
                          <Badge variant="danger">Đã Đóng</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="info"
                          style={{ marginRight: "10px" }}
                          onClick={() => handleEdit(course.id)} 
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(course.id)} 
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

{/* Modal Hiển Thị Danh Sách Học Viên */}
<Modal show={showStudentsModal} onHide={() => setShowStudentsModal(false)} size="lg" centered>
  <Modal.Header closeButton>
    <Modal.Title>Danh Sách Học Viên</Modal.Title>
  </Modal.Header>
  <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
  <Table striped bordered hover>
    <thead>
      <tr>
        <th style={{ whiteSpace: 'nowrap' }}>STT</th>
        <th style={{ whiteSpace: 'nowrap' }}>Mã Học Viên</th>
        <th style={{ whiteSpace: 'nowrap' }}>Tên Học Viên</th>
        <th style={{ whiteSpace: 'nowrap' }}>Email</th>
        <th style={{ whiteSpace: 'nowrap' }}>Điện Thoại</th>
        <th style={{ whiteSpace: 'nowrap' }}>Ngày Sinh</th>
        <th style={{ whiteSpace: 'nowrap' }}>Địa Chỉ</th>
        <th style={{ whiteSpace: 'nowrap' }}>Giới Tính</th>
        <th style={{ whiteSpace: 'nowrap' }}>Học Phí</th>
      </tr>
    </thead>
    <tbody>
      {studentsInCourse.map((student, index) => (
        <tr key={student.id}>
          <td style={{ whiteSpace: 'nowrap' }}>{index + 1}</td>
          <td style={{ whiteSpace: 'nowrap' }}>{student.studentCode}</td>
          <td style={{ whiteSpace: 'nowrap' }}>{student.fullName}</td>
          <td style={{ whiteSpace: 'nowrap' }}>{student.email}</td>
          <td style={{ whiteSpace: 'nowrap' }}>{student.phoneNumber}</td>
          <td style={{ whiteSpace: 'nowrap' }}>{student.dateOfBirth.join('-')}</td>
          <td style={{ whiteSpace: 'nowrap' }}>{student.address}</td>
          <td style={{ whiteSpace: 'nowrap' }}>{student.gender}</td>
          <td style={{ whiteSpace: 'nowrap' }}>
            {student.collectedMoney ? 'Đã Đóng' : 'Chưa Đóng'}
          </td>
            
          
        </tr>
      ))}
    </tbody>
  </Table>
</Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowStudentsModal(false)}>
      Đóng
    </Button>
  </Modal.Footer>
</Modal>
      {/* Modal Thêm/Sửa Khóa Học */}
      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCourseId ? "Sửa Khóa Học" : "Thêm Khóa Học"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="courseCode">
              <Form.Label>Mã Khóa Học</Form.Label>
              <Form.Control
                type="text"
                name="courseCode"
                value={newCourse.courseCode}
                onChange={handleInputChange}
                isInvalid={formError.courseCode}
              />
              <Form.Control.Feedback type="invalid">Vui lòng nhập mã khóa học.</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="topicName">
                <Form.Label>Tên Chuyên Đề</Form.Label>
                <Form.Control
                  as="select"
                  name="topicName"
                  value={newCourse.topicName}
                  onChange={handleInputChange}
                  isInvalid={formError.topicName}
                >
                  <option value="">Chọn Chuyên Đề</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.name}>
                      {topic.topicName}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">Vui lòng chọn tên chuyên đề.</Form.Control.Feedback>
              </Form.Group>

            

            <Form.Group controlId="courseName">
              <Form.Label>Tên Khóa Học</Form.Label>
              <Form.Control
                type="text"
                name="courseName"
                value={newCourse.courseName}
                onChange={handleInputChange}
                isInvalid={formError.courseName}
              />
              <Form.Control.Feedback type="invalid">Vui lòng nhập tên khóa học.</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="startDate">
              <Form.Label>Ngày Bắt Đầu</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={newCourse.startDate}
                onChange={handleInputChange}
                isInvalid={formError.startDate}
              />
              <Form.Control.Feedback type="invalid">Vui lòng chọn ngày bắt đầu.</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="endDate">
              <Form.Label>Ngày Kết Thúc</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={newCourse.endDate}
                onChange={handleInputChange}
                isInvalid={formError.endDate}
              />
              <Form.Control.Feedback type="invalid">Vui lòng chọn ngày kết thúc.</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="totalStudent">
              <Form.Label>Số Học Viên</Form.Label>
              <Form.Control
                type="number"
                name="totalStudent"
                value={newCourse.totalStudent}
                onChange={handleInputChange}
                isInvalid={formError.totalStudent}
              />
              <Form.Control.Feedback type="invalid">Vui lòng nhập số học viên hợp lệ.</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="activate">
              <Form.Check
                type="checkbox"
                label="Kích Hoạt"
                name="activate"
                checked={newCourse.activate}
                onChange={(e) => setNewCourse({ ...newCourse, activate: e.target.checked })}
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
  <Button variant="secondary" onClick={resetForm} className="me-2">
    Hủy
  </Button>
  <Button variant="primary" type="submit">
    {editingCourseId ? "Cập Nhật" : "Thêm"}
  </Button>
</div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CourseList;
