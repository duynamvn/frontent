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
  const [newCourse, setNewCourse] = useState({
    courseCode: "",
    courseName: "",
    startDate: "",
    endDate: "",
    totalStudent: 0,
    activate: false,
  });
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Đã có lỗi xảy ra khi tải dữ liệu khóa học.");
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
                      <td>{course.courseName}</td>
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

      <Modal show={showModal} onHide={resetForm} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCourseId ? "Cập Nhật Khóa Học" : "Thêm Khóa Học"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formCourseCode">
              <Form.Label>Mã Khóa Học</Form.Label>
              <Form.Control
                type="text"
                name="courseCode"
                value={newCourse.courseCode}
                onChange={handleInputChange}
                isInvalid={formError.courseCode}
              />
              <Form.Control.Feedback type="invalid">
                Vui lòng không được bỏ trống.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formCourseName">
              <Form.Label>Tên Khóa Học</Form.Label>
              <Form.Control
                type="text"
                name="courseName"
                value={newCourse.courseName}
                onChange={handleInputChange}
                isInvalid={formError.courseName}
              />
              <Form.Control.Feedback type="invalid">
                Vui lòng không được bỏ trống.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formStartDate">
              <Form.Label>Ngày Bắt Đầu</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={newCourse.startDate}
                onChange={handleInputChange}
                isInvalid={formError.startDate}
              />
              <Form.Control.Feedback type="invalid">
                Vui lòng điền đầy đủ thông tin.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formEndDate">
              <Form.Label>Ngày Kết Thúc</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={newCourse.endDate}
                onChange={handleInputChange}
                isInvalid={formError.endDate}
              />
              <Form.Control.Feedback type="invalid">
                Vui lòng điền đầy đủ thông tin.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formTotalStudent">
              <Form.Label>Số Học Viên</Form.Label>
              <Form.Control
                type="number"
                name="totalStudent"
                value={newCourse.totalStudent}
                onChange={handleInputChange}
                isInvalid={formError.totalStudent}
              />
              <Form.Control.Feedback type="invalid">
                Số học viên phải lớn hơn 0.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formActivate">
              <Form.Check
                type="checkbox"
                label="Kích Hoạt"
                name="activate"
                checked={newCourse.activate}
                onChange={() =>
                  setNewCourse({ ...newCourse, activate: !newCourse.activate })
                }
              />
            </Form.Group>
            <Modal.Footer>
              <Button variant="primary" type="submit">
                {editingCourseId ? "Cập Nhật" : "Thêm"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      <Pagination className="mt-3">
        <Pagination.Prev
          onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
          disabled={currentPage === 1}
        />
        {[...Array(totalPages).keys()].map((number) => (
          <Pagination.Item
            key={number + 1}
            active={number + 1 === currentPage}
            onClick={() => setCurrentPage(number + 1)}
          >
            {number + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() =>
            setCurrentPage(
              currentPage < totalPages ? currentPage + 1 : totalPages
            )
          }
          disabled={currentPage === totalPages}
        />
      </Pagination>
    </Container>
  );
};

export default CourseList;
