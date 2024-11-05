"use client"; 
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Card, Table, Container, Row, Col, Form, Pagination, Alert, Spinner, Modal } from "react-bootstrap";

function TuitionFeeList() {
  const [tuitionFees, setTuitionFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [newTuitionFee, setNewTuitionFee] = useState({
    collected_money: '', // Số tiền đã thu
    collection_date: '', // Ngày thu
    note: '',            // Ghi chú
    activate: '',        // Trạng thái (Đã thanh toán, Chưa thanh toán)
    registration_date: '', // Ngày đăng ký
    course_id: '',       // ID khóa học
    student_id: '',      // ID học viên
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
      const response = await axios.get('http://localhost:8080/api/tuition-fees');
      setTuitionFees(response.data);
      setError(null);
    } catch (error) {
      setError('Lỗi khi lấy danh sách học phí');
      console.error('Error fetching tuition fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTuitionFee(prevState => ({
      ...prevState,
      [name]: value,
    }));
    setErrorMessage(''); // Reset error message on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra các trường bắt buộc
    const requiredFields = ['collected_money', 'collection_date', 'activate'];
    const emptyFields = requiredFields.filter(field => !newTuitionFee[field]);

    if (emptyFields.length > 0) {
      setErrorMessage(`Vui lòng điền đầy đủ thông tin: ${emptyFields.join(', ')}`);
      return;
    }

    try {
      if (editingTuitionFeeId) {
        await axios.put(`http://localhost:8080/api/tuition-fees/${editingTuitionFeeId}`, newTuitionFee);
        setSuccessMessage("Cập nhật học phí thành công.");
      } else {
        await axios.post('http://localhost:8080/api/tuition-fees', newTuitionFee);
        setSuccessMessage("Thêm học phí thành công.");
      }
      fetchTuitionFees();
      resetForm();
      setShowModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving tuition fee:', error);
      if (error.response) {
        setErrorMessage(`Đã xảy ra lỗi: ${error.response.data.message || error.response.statusText}`);
      } else {
        setErrorMessage("Đã xảy ra lỗi trong yêu cầu.");
      }
    }
  };

  const resetForm = () => {
    setNewTuitionFee({
      collected_money: '',
      collection_date: '',
      note: '',
      activate: '',  // Reset status
      registration_date: '',
      course_id: '',
      student_id: '',
    });
    setEditingTuitionFeeId(null);
    setErrorMessage(''); // Reset error message on form reset
  };

  const handleEdit = (id) => {
    const tuitionFeeToEdit = tuitionFees.find((fee) => fee.id === id);
    if (tuitionFeeToEdit) {
      setNewTuitionFee({
        collected_money: tuitionFeeToEdit.collected_money,
        collection_date: tuitionFeeToEdit.collection_date,
        note: tuitionFeeToEdit.note,
        activate: tuitionFeeToEdit.activate ? "Đã thanh toán" : "Chưa thanh toán", // Convert boolean to string
        registration_date: tuitionFeeToEdit.registration_date,
        course_id: tuitionFeeToEdit.course_id,
        student_id: tuitionFeeToEdit.student_id,
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
        console.error('Error deleting tuition fee:', error);
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
              <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
                Thêm Học Phí
              </Button>
            </Card.Header>

            <Card.Body className="table-full-width table-responsive px-0">
              <Table className="table-hover table-striped">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Số Tiền</th>
                    <th>Ngày Thu</th>
                    <th>Ghi Chú</th>
                    <th>Trạng Thái</th>
                    <th>Tùy Chọn</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTuitionFees.length > 0 ? (
                    currentTuitionFees.map((fee, index) => (
                      <tr key={fee.id}>
                        <td>{indexOfFirstFee + index + 1}</td>
                        <td>{fee.collected_money ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
                        <td>{fee.collection_date}</td>
                        <td>{fee.note}</td>
                        <td>{fee.activate ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
                        <td>
                          <Button variant="info" className="btn-action" onClick={() => handleEdit(fee.id)}>
                            Sửa
                          </Button>
                          <Button variant="danger" onClick={() => handleDelete(fee.id)}>
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">Không có học phí nào.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
            <Card.Footer>
              <Pagination>
                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingTuitionFeeId ? "Sửa Học Phí" : "Thêm Học Phí"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formCollectedMoney">
              <Form.Label>Số Tiền Đã Thu</Form.Label>
              <Form.Control
                type="number"
                name="collected_money"
                value={newTuitionFee.collected_money}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCollectionDate">
              <Form.Label>Ngày Thu</Form.Label>
              <Form.Control
                type="date"
                name="collection_date"
                value={newTuitionFee.collection_date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formNote">
              <Form.Label>Ghi Chú</Form.Label>
              <Form.Control
                type="text"
                name="note"
                value={newTuitionFee.note}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formActivate">
              <Form.Label>Trạng Thái</Form.Label>
              <Form.Control
                as="select"
                name="activate"
                value={newTuitionFee.activate}
                onChange={handleInputChange}
                required
              >
                <option value="">Chọn Trạng Thái</option>
                <option value="true">Đã thanh toán</option>
                <option value="false">Chưa thanh toán</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formRegistrationDate">
              <Form.Label>Ngày Đăng Ký</Form.Label>
              <Form.Control
                type="date"
                name="registration_date"
                value={newTuitionFee.registration_date}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formCourseId">
              <Form.Label>ID Khóa Học</Form.Label>
              <Form.Control
                type="text"
                name="course_id"
                value={newTuitionFee.course_id}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formStudentId">
              <Form.Label>ID Học Viên</Form.Label>
              <Form.Control
                type="text"
                name="student_id"
                value={newTuitionFee.student_id}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editingTuitionFeeId ? "Cập Nhật" : "Thêm"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default TuitionFeeList;
