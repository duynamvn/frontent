"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Table,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Pagination,
  Modal,
  Form,
} from "react-bootstrap";

function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const studentsPerPage = 5;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/student");
      setStudents(response.data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch students");
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    setEditMode(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa học viên này không?")) {
      try {
        await axios.delete(`http://localhost:8080/api/student/${id}`);
        fetchStudents();
        alert("Xóa học viên thành công.");
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Đã xảy ra lỗi khi xóa học viên.");
      }
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSave = async () => {
  // Kiểm tra nếu có bất kỳ trường nào chưa điền
  if (
    !selectedStudent.fullName ||
    !selectedStudent.dateOfBirth ||
    !selectedStudent.nationalID ||
    !selectedStudent.email ||
    !selectedStudent.gender ||
    !selectedStudent.address ||
    !selectedStudent.phoneNumber ||
    !selectedStudent.studentCode
  ) {
    alert("Vui lòng điền đầy đủ thông tin trước khi lưu.");
    return; // Dừng việc lưu nếu thiếu thông tin
  }

  try {
    await axios.put(
      `http://localhost:8080/api/student/${selectedStudent.id}`,
      selectedStudent
    );
    fetchStudents();
    setShowModal(false);
    alert("Cập nhật học viên thành công.");
  } catch (error) {
    console.error("Error updating student:", error);
    alert("Đã xảy ra lỗi khi cập nhật học viên.");
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedStudent({ ...selectedStudent, [name]: value });
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(students.length / studentsPerPage);

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header>
              <Card.Title as="h2">Danh sách Học Viên</Card.Title>
            </Card.Header>
            <Card.Body className="table-full-width table-responsive px-0">
              <Table className="table-hover table-striped">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên Học Viên</th>
                    <th>Số Điện Thoại</th>
                    <th>CCCD</th>
                    <th>Trạng Thái</th>
                    <th>Tùy Chọn</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.length > 0 ? (
                    currentStudents.map((student, index) => (
                      <tr key={student.id}>
                        <td>
                          {index + 1 + (currentPage - 1) * studentsPerPage}
                        </td>
                        <td>{student.fullName}</td>
                        <td>{student.phoneNumber}</td>
                        <td>{student.nationalID}</td>
                        <td>
                          {student.activate ? "Còn Học" : "Đã Tốt Nghiệp"}
                        </td>
                        <td>
                          <Button
                            variant="info"
                            onClick={() => handleEdit(student)}
                            style={{ marginRight: "10px" }}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(student.id)}
                            style={{ marginRight: "10px" }}
                          >
                            Xóa
                          </Button>
                          <Button
                            variant="link"
                            onClick={() => handleToggleExpand(student)}
                          >
                            <i className="fas fa-search"></i>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Không có dữ liệu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <Pagination>
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for Student Details */}
      {selectedStudent && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {editMode
                ? "Chỉnh sửa thông tin học viên"
                : "Thông tin chi tiết học viên"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editMode ? (
              <Form>
                <Form.Group>
                  <Form.Label>Tên</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={selectedStudent.fullName || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Ngày Sinh</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={selectedStudent.dateOfBirth || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>CCCD</Form.Label>
                  <Form.Control
                    type="text"
                    name="nationalID"
                    value={selectedStudent.nationalID || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={selectedStudent.email || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Giới Tính</Form.Label>
                  <Form.Control
                    as="select"
                    name="gender"
                    value={selectedStudent.gender || ""}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Địa Chỉ</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={selectedStudent.address || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Số Điện Thoại</Form.Label>
                  <Form.Control
                    type="string"
                    name="phoneNumber"
                    value={selectedStudent.phoneNumber || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                

                <Form.Group>
                  <Form.Label>Trạng Thái</Form.Label>
                  <Form.Control
                    as="select"
                    name="activate"
                    value={
                      selectedStudent.activate ? "Còn Học" : "Đã Nghỉ"
                    }
                    onChange={handleInputChange}
                  >
                    <option value="true">Còn Học</option>
                    <option value="false">Đã Nghỉ</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Ảnh</Form.Label>
                  <Form.Control
                    type="file"
                    name="imageName"
                    onChange={handleInputChange}
                  />
                </Form.Group>
                {/* Thêm các trường thông tin khác ở đây */}
              </Form>
            ) : (
              <div>
                <p><strong>Họ và Tên:</strong> {selectedStudent.fullName}</p>
                <p><strong>Ngày Sinh:</strong> {selectedStudent.dateOfBirth.join('-')}</p>
                <p>
                  <strong>Email:</strong> {selectedStudent.email}
                </p>
                <p>
                  <strong>Giới Tính:</strong> {selectedStudent.gender}
                </p>
                <p>
                  <strong>Địa Chỉ:</strong> {selectedStudent.address}
                </p>
                <p>
                  <strong>Số Điện Thoại:</strong> {selectedStudent.phoneNumber}
                </p>
                <p>
                  <strong>Mã Học Viên:</strong> {selectedStudent.studentCode}
                </p>
                <p>
                  <strong>Trạng Thái:</strong>{" "}
                  {selectedStudent.activate ? "Còn Học " : "Đã Nghỉ"}
                </p>
                <p>
                  <strong>Ảnh:</strong> {selectedStudent.imageName}
                </p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            {editMode ? (
              <Button variant="primary" onClick={handleSave}>
                Lưu
              </Button>
            ) : null}
            
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}

export default StudentList;
