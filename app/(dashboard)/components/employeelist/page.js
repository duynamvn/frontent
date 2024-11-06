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

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    nationalID: "",
    email: "",
    phoneNumber: "",
    activate: false,
    address: "",
    employeeTypeId: "",
  });
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // Modal for employee details
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Employee details
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 5;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/employees");
      setEmployees(response.data);
      setError(null);
    } catch (error) {
      setError("Lỗi khi lấy danh sách nhân viên");
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEmployee((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrorMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let newErrors = {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      nationalID: '',
      email: '',
      phoneNumber: '',
      employeeTypeId: '',
    };
  
    if (!newEmployee.fullName) newErrors.fullName = 'Vui lòng điền đầy đủ thông tin!';
    if (!newEmployee.dateOfBirth) newErrors.dateOfBirth = 'Vui lòng điền đầy đủ thông tin!';
    if (!newEmployee.gender) newErrors.gender = 'Vui lòng điền đầy đủ thông tin!';
    if (!newEmployee.nationalID) newErrors.nationalID = 'Vui lòng điền đầy đủ thông tin!';
    if (!newEmployee.email) newErrors.email = 'Vui lòng điền đầy đủ thông tin!';
    if (!newEmployee.phoneNumber) newErrors.phoneNumber = 'Vui lòng điền đầy đủ thông tin!';
    if (!newEmployee.employeeTypeId) newErrors.employeeTypeId = 'Vui lòng điền đầy đủ thông tin!';
  
    if (Object.values(newErrors).some(error => error !== '')) {
      setErrors(newErrors);
      return; // Dừng lại nếu có lỗi
    }
  
    // Nếu không có lỗi, tiến hành thêm hoặc sửa nhân viên
    // Code để thêm hoặc sửa nhân viên...
  };
  

  const resetForm = () => {
    setNewEmployee({
      fullName: "",
      dateOfBirth: "",
      gender: "",
      nationalID: "",
      email: "",
      phoneNumber: "",
      activate: false,
      address: "",
      employeeTypeId: "",
    });
    setEditingEmployeeId(null);
    setErrorMessage("");
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
        console.error("Error deleting employee:", error);
        alert("Đã xảy ra lỗi khi xóa nhân viên.");
      }
    }
  };

  const handleShowDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = employees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );
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
              <Button
                variant="primary"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                Thêm Nhân Viên
              </Button>
            </Card.Header>

            <Card.Body className="table-full-width table-responsive px-0">
              <Table className="table-hover table-striped">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ và Tên</th>
                    <th>CCCD</th>
                    <th>Số Điện Thoại</th>
                    <th>Tùy Chọn</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.length > 0 ? (
                    currentEmployees.map((employee, index) => (
                      <tr key={employee.id}>
                        <td>{indexOfFirstEmployee + index + 1}</td>
                        <td>{employee.fullName}</td>
                        <td>{employee.nationalID}</td>
                        <td>{employee.phoneNumber}</td>
                        <td>
                          <Button
                            variant="info"
                            style={{ marginRight: "10px" }}
                            onClick={() => handleEdit(employee.id)}
                          >
                            Sửa
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(employee.id)}
                          >
                            Xóa
                          </Button>
                          <Button
                            variant="link"
                            onClick={() => handleShowDetails(employee)}
                          >
                            <i className="fas fa-search"></i>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        Không có nhân viên nào.
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
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => paginate(index + 1)}
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
      <Form.Group controlId="fullName">
        <Form.Label>Họ và Tên</Form.Label>
        <Form.Control
          type="text"
          name="fullName"
          value={newEmployee.fullName}
          onChange={handleInputChange}
          placeholder="Nhập họ và tên"
          required
        />
      </Form.Group>
      <Form.Group controlId="dateOfBirth">
        <Form.Label>Ngày Sinh</Form.Label>
        <Form.Control
          type="date"
          name="dateOfBirth"
          value={newEmployee.dateOfBirth}
          onChange={handleInputChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="gender">
        <Form.Label>Giới Tính</Form.Label>
        <Form.Control
          as="select"
          name="gender"
          value={newEmployee.gender}
          onChange={handleInputChange}
          required
        >
          <option value="">Chọn giới tính</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="nationalID">
        <Form.Label>CCCD</Form.Label>
        <Form.Control
          type="text"
          name="nationalID"
          value={newEmployee.nationalID}
          onChange={handleInputChange}
          placeholder="Nhập số CCCD"
          required
        />
      </Form.Group>
      <Form.Group controlId="email">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={newEmployee.email}
          onChange={handleInputChange}
          placeholder="Nhập email"
          required
        />
      </Form.Group>
      <Form.Group controlId="phoneNumber">
        <Form.Label>Số Điện Thoại</Form.Label>
        <Form.Control
          type="text"
          name="phoneNumber"
          value={newEmployee.phoneNumber}
          onChange={handleInputChange}
          placeholder="Nhập số điện thoại"
          required
        />
      </Form.Group>
      <Form.Group controlId="activate">
        <Form.Check
          type="checkbox"
          label="Kích hoạt"
          name="activate"
          checked={newEmployee.activate}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Form.Group controlId="address">
        <Form.Label>Địa Chỉ</Form.Label>
        <Form.Control
          type="text"
          name="address"
          value={newEmployee.address}
          onChange={handleInputChange}
          placeholder="Nhập địa chỉ"
          required
        />
      </Form.Group>
      <Form.Group controlId="employeeTypeName">
        <Form.Label>Loại Nhân Viên</Form.Label>
        <Form.Control
          as="select"
          name="employeeTypeName"
          value={newEmployee.employeeTypeName}
          onChange={handleInputChange}
          required
        >
          <option value="">Chọn loại nhân viên</option>
          <option value="1">Nhân Viên </option>
          <option value="2">Giáo Viên</option>
        </Form.Control>
      </Form.Group>
      <Button variant="primary" type="submit">
        {editingEmployeeId ? "Lưu Thay Đổi" : "Thêm Nhân Viên"}
      </Button>
    </Form>
  </Modal.Body>
</Modal>


      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết nhân viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
  {selectedEmployee && (
    <div>
      <p>Họ và Tên: {selectedEmployee.fullName}</p>
      <p>Ngày Sinh: {selectedEmployee.dateOfBirth.join('-')}</p> {/* Hiển thị ngày sinh ở định dạng dễ đọc */}
      <p>Loại Nhân Viên: {selectedEmployee.employeeType.employeeTypeName}</p> {/* Thay đổi ở đây */}
      <p>Giới Tính: {selectedEmployee.gender}</p>
      <p>CCCD: {selectedEmployee.nationalID}</p>
      <p>Email: {selectedEmployee.email}</p>
      <p>Số Điện Thoại: {selectedEmployee.phoneNumber}</p>
      <p>Địa Chỉ: {selectedEmployee.address}</p>
      <p>Trạng Thái: {selectedEmployee.activate ? "Hoạt động" : "Không hoạt động"}</p>
    </div>
  )}
</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}


export default EmployeeList;
