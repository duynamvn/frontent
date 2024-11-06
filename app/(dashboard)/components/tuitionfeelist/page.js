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
  Form,
  Pagination,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";

function TuitionFeeList() {
  const [tuitionFees, setTuitionFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [newTuitionFee, setNewTuitionFee] = useState({
    promotionalPrice: "", // Đổi thành số tiền thực tế
    collectionDate: "", // Ngày thu
    note: "", // Ghi chú
    activate: "", // Trạng thái (Đã thanh toán, Chưa thanh toán)
    registrationDate: "", // Ngày đăng ký
    courseCode: "", // Mã khóa học
    studentCode: "", // Mã học viên
  });
  const [editingTuitionFeeId, setEditingTuitionFeeId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const tuitionFeesPerPage = 5;

  useEffect(() => {
    fetchTuitionFees();
  }, []);

  const fetchTuitionFees = async () => {
    setLoading(true);
    try {
        const response = await axios.get("http://localhost:8080/api/tuition-fees");
        const tuitionFeesWithCodes = response.data.map(tuitionFee => ({
            ...tuitionFee,
            courseCode: tuitionFee.course.courseCode, // Lưu Mã Khóa Học vào state
        }));
        setTuitionFees(tuitionFeesWithCodes);
        setError(null);
    } catch (error) {
        setError("Lỗi khi lấy danh sách học phí");
        console.error("Error fetching tuition fees:", error);
    } finally {
        setLoading(false);
    }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTuitionFee((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setErrorMessage(""); // Reset error message on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra các trường bắt buộc
    const requiredFields = ["promotionalPrice", "collectionDate", "activate", "courseCode", "studentCode"]; // Sửa tên trường
    const emptyFields = requiredFields.filter((field) => !newTuitionFee[field]);

    if (emptyFields.length > 0) {
      setErrorMessage(
        `Vui lòng điền đầy đủ thông tin: ${emptyFields.join(", ")}`
      );
      return;
    }

    // Convert giá trị boolean cho API
    const tuitionFeeData = {
      ...newTuitionFee,
      activate: newTuitionFee.activate === "Đã thanh toán", // Chuyển đổi trạng thái
    };

    try {
      if (editingTuitionFeeId) {
        await axios.put(
          `http://localhost:8080/api/tuition-fees/${editingTuitionFeeId}`,
          tuitionFeeData
        );
        setSuccessMessage("Cập nhật học phí thành công.");
      } else {
        await axios.post(
          "http://localhost:8080/api/tuition-fees",
          tuitionFeeData
        );
        setSuccessMessage("Thêm học phí thành công.");
      }
      fetchTuitionFees();
      resetForm();
      setShowModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving tuition fee:", error);
      if (error.response) {
        setErrorMessage(
          `Đã xảy ra lỗi: ${error.response.data.message || error.response.statusText}`
        );
      } else {
        setErrorMessage("Đã xảy ra lỗi trong yêu cầu.");
      }
    }
  };

  const resetForm = () => {
    setNewTuitionFee({
      promotionalPrice: "",
      collectionDate: "",
      note: "",
      activate: "",
      registrationDate: "",
      courseCode: "",
      studentCode: "",
    });
    setEditingTuitionFeeId(null);
    setErrorMessage(""); // Reset error message on form reset
  };

  const handleEdit = (id) => {
    const tuitionFeeToEdit = tuitionFees.find((fee) => fee.id === id);
    if (tuitionFeeToEdit) {
      setNewTuitionFee({
        promotionalPrice: tuitionFeeToEdit.promotionalPrice,
        collectionDate: tuitionFeeToEdit.collectionDate.join("-"), // Format the date as needed
        note: tuitionFeeToEdit.note,
        activate: tuitionFeeToEdit.activate ? "Đã thanh toán" : "Chưa thanh toán", // Convert boolean to string
        registrationDate: tuitionFeeToEdit.registrationDate.join("-"),
        courseCode: tuitionFeeToEdit.courseCode,
        studentCode: tuitionFeeToEdit.studentCode,
      });
      setEditingTuitionFeeId(id);
      setShowModal(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa học phí này không?")) {
      try {
        await axios.delete(`http://localhost:8080/api/tuition-fees/${id}`);
        fetchTuitionFees();
        alert("Xóa học phí thành công.");
      } catch (error) {
        console.error("Error deleting tuition fee:", error);
        alert("Đã xảy ra lỗi khi xóa học phí.");
      }
    }
  };

  const indexOfLastFee = currentPage * tuitionFeesPerPage;
  const indexOfFirstFee = indexOfLastFee - tuitionFeesPerPage;
  const currentTuitionFees = tuitionFees.slice(indexOfFirstFee, indexOfLastFee);
  const totalPages = Math.ceil(tuitionFees.length / tuitionFeesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Card className="strpied-tabled-with-hover">
            <Card.Header>
              <Card.Title as="h2">Danh sách Học Phí</Card.Title>
              <Button
                variant="primary"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                Thêm Học Phí
              </Button>
            </Card.Header>

            <Card.Body className="table-full-width table-responsive px-0">
              <Table className="table-hover table-striped">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã Khóa Học</th>
                    <th>Mã Học Viên</th>
                    <th>Số Tiền</th>
                    <th>Ngày Thu</th>
                    <th>Ghi Chú</th>
                    <th>Trạng Thái</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTuitionFees.length > 0 ? (
                    currentTuitionFees.map((tuitionFee, index) => (
                      <tr key={tuitionFee.id}>
                        <td>{indexOfFirstFee + index + 1}</td>
                        <td>{tuitionFee.courseCode}</td> {/* Mã Khóa Học */}
                        <td>{tuitionFee.studentCode}</td> {/* Mã Học Viên */}
                        <td>
                          {tuitionFee.promotionalPrice != null
                            ? tuitionFee.promotionalPrice.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })
                            : "Chưa có giá"}
                        </td>
                        <td>{tuitionFee.collectionDate.join("-")}</td>
                        <td>{tuitionFee.note}</td>
                        <td>
                          {tuitionFee.activate ? "Đã thanh toán" : "Chưa thanh toán"}
                        </td>
                        <td>
                          <Button
                            variant="info"
                            className="btn-action"
                            style={{ marginRight: "10px" }}
                            onClick={() => handleEdit(tuitionFee.id)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(tuitionFee.id)}
                          >
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        Không có học phí nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
            <Card.Footer>
              <Pagination>
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingTuitionFeeId ? "Cập Nhật Học Phí" : "Thêm Học Phí"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Số Tiền</Form.Label>
              <Form.Control
                type="number"
                name="promotionalPrice"
                value={newTuitionFee.promotionalPrice}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Ngày Thu</Form.Label>
              <Form.Control
                type="date"
                name="collectionDate"
                value={newTuitionFee.collectionDate}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Ghi Chú</Form.Label>
              <Form.Control
                type="text"
                name="note"
                value={newTuitionFee.note}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Trạng Thái</Form.Label>
              <Form.Control
                as="select"
                name="activate"
                value={newTuitionFee.activate}
                onChange={handleInputChange}
                required
              >
                <option value="">Chọn trạng thái...</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Chưa thanh toán">Chưa thanh toán</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Ngày Đăng Ký</Form.Label>
              <Form.Control
                type="date"
                name="registrationDate"
                value={newTuitionFee.registrationDate}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Mã Khóa Học</Form.Label>
              <Form.Control
                type="text"
                name="courseCode"
                value={newTuitionFee.courseCode}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Mã Học Viên</Form.Label>
              <Form.Control
                type="text"
                name="studentCode"
                value={newTuitionFee.studentCode}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Đóng
              </Button>
              <Button type="submit" variant="primary">
                {editingTuitionFeeId ? "Cập Nhật" : "Thêm"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default TuitionFeeList;
