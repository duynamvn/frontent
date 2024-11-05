"use client"; 
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Card, Table, Container, Row, Col, Form, Pagination, Alert, Spinner, Modal } from "react-bootstrap";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    nationalID: '',
    email: '',
    phoneNumber: '',
    activate: false,
    address: '',
    employeeTypeId: '',  // Thêm trường này
  });
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 5;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true); // Đặt loading trước khi gọi API
    try {
      const response = await axios.get('http://localhost:8080/api/employees');
      setEmployees(response.data);
      setError(null);
    } catch (error) {
      setError('Lỗi khi lấy danh sách nhân viên');
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEmployee(prevState => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrorMessage(''); // Reset error message on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra các trường bắt buộc
    const requiredFields = ['fullName', 'dateOfBirth', 'gender', 'nationalID', 'email', 'phoneNumber', 'employeeTypeId'];
    const emptyFields = requiredFields.filter(field => !newEmployee[field]);

    if (emptyFields.length > 0) {
      setErrorMessage(`Vui lòng điền đầy đủ thông tin: ${emptyFields.join(', ')}`);
      return;
    }

    try {
      if (editingEmployeeId) {
        await axios.put(`http://localhost:8080/api/employees/${editingEmployeeId}`, newEmployee);
        setSuccessMessage("Cập nhật nhân viên thành công.");
      } else {
        await axios.post('http://localhost:8080/api/employees', newEmployee);
        setSuccessMessage("Thêm nhân viên thành công.");
      }
      fetchEmployees();
      resetForm();
      setShowModal(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving employee:', error);
      if (error.response) {
        setErrorMessage(`Đã xảy ra lỗi: ${error.response.data.message || error.response.statusText}`);
      } else {
        setErrorMessage("Đã xảy ra lỗi trong yêu cầu.");
      }
    }
  };

  const resetForm = () => {
    setNewEmployee({
      fullName: '',
      dateOfBirth: '',
      gender: '',
      nationalID: '',
      email: '',
      phoneNumber: '',
      activate: false,
      address: '',
      employeeTypeId: '', // Reset employeeTypeId
    });
    setEditingEmployeeId(null);
    setErrorMessage(''); // Reset error message on form reset
  };

  const handleEdit = (id) => {
    const employeeToEdit = employees.find((emp) => emp.id === id);
    if (employeeToEdit) {
      setNewEmployee(employeeToEdit);
      setEditingEmployeeId(id);
      setShowModal(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này không?")) {
      try {
        await axios.delete(`http://localhost:8080/api/employees/${id}`);
        fetchEmployees();
        alert("Xóa nhân viên thành công.");
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert("Đã xảy ra lỗi khi xóa nhân viên.");
      }
    }
  };

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = employees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(employees.length / employeesPerPage);

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
              <Card.Title as="h2">Danh sách Nhân Viên</Card.Title>
              <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
                Thêm Nhân Viên
              </Button>
            </Card.Header>

            <Card.Body className="table-full-width table-responsive px-0">
              <Table className="table-hover table-striped">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ và Tên</th>
                    <th>Ngày Sinh</th>
                    <th>Giới Tính</th>
                    <th>Số CMND/CCCD</th>
                    <th>Email</th>
                    <th>Số Điện Thoại</th>
                    <th>Trạng Thái</th>
                    <th>Địa Chỉ</th>
                    <th>Loại Nhân Viên</th>
                    <th>Tùy Chọn</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.length > 0 ? (
                    currentEmployees.map((employee, index) => (
                      <tr key={employee.id}>
                        <td>{indexOfFirstEmployee + index + 1}</td>
                        <td>{employee.fullName}</td>
                        <td>{employee.dateOfBirth}</td>
                        <td>{employee.gender}</td>
                        <td>{employee.nationalID}</td>
                        <td>{employee.email}</td>
                        <td>{employee.phoneNumber}</td>
                        <td>{employee.activate ? "Hoạt Động" : "Không Hoạt Động"}</td>
                        <td>{employee.address}</td>
                        <td>{employee.employeeTypeId}</td>
                        <td>
                          <Button variant="info" className="btn-action" onClick={() => handleEdit(employee.id)}>
                            Sửa
                          </Button>
                          <Button variant="danger" onClick={() => handleDelete(employee.id)}>
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center">Không có nhân viên nào.</td>
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
          <Modal.Title>{editingEmployeeId ? "Sửa Nhân Viên" : "Thêm Nhân Viên"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formFullName">
              <Form.Label>Họ và Tên</Form.Label>
              <Form.Control type="text" name="fullName" value={newEmployee.fullName} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="formDateOfBirth">
              <Form.Label>Ngày Sinh</Form.Label>
              <Form.Control type="date" name="dateOfBirth" value={newEmployee.dateOfBirth} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="formGender">
              <Form.Label>Giới Tính</Form.Label>
              <Form.Control as="select" name="gender" value={newEmployee.gender} onChange={handleInputChange} required>
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formNationalID">
              <Form.Label>Số CMND/CCCD</Form.Label>
              <Form.Control type="text" name="nationalID" value={newEmployee.nationalID} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={newEmployee.email} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="formPhoneNumber">
              <Form.Label>Số Điện Thoại</Form.Label>
              <Form.Control type="text" name="phoneNumber" value={newEmployee.phoneNumber} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="formAddress">
              <Form.Label>Địa Chỉ</Form.Label>
              <Form.Control type="text" name="address" value={newEmployee.address} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formActivate">
              <Form.Check type="checkbox" label="Hoạt động" name="activate" checked={newEmployee.activate} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formEmployeeTypeId">
              <Form.Label>Loại Nhân Viên</Form.Label>
              <Form.Control type="text" name="employeeTypeId" value={newEmployee.employeeTypeId} onChange={handleInputChange} required />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editingEmployeeId ? "Cập nhật" : "Thêm"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default EmployeeList;
