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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    let newErrors = {
      fullName: "",
      dateOfBirth: "",
      gender: "",
      nationalID: "",
      email: "",
      phoneNumber: "",
      employeeTypeId: "",
    };

    if (!newEmployee.fullName) newErrors.fullName = "Vui lòng điền đầy đủ thông tin!";
    if (!newEmployee.dateOfBirth) newErrors.dateOfBirth = "Vui lòng điền đầy đủ thông tin!";
    if (!newEmployee.gender) newErrors.gender = "Vui lòng điền đầy đủ thông tin!";
    if (!newEmployee.nationalID) newErrors.nationalID = "Vui lòng điền đầy đủ thông tin!";
    if (!newEmployee.email) newErrors.email = "Vui lòng điền đầy đủ thông tin!";
    if (!newEmployee.phoneNumber) newErrors.phoneNumber = "Vui lòng điền đầy đủ thông tin!";
    if (!newEmployee.employeeTypeId) newErrors.employeeTypeId = "Vui lòng điền đầy đủ thông tin!";

    if (Object.values(newErrors).some((error) => error !== "")) {
      setErrorMessage(newErrors);
      return; // Dừng lại nếu có lỗi
    }

    // Nếu không có lỗi, tiến hành thêm hoặc sửa nhân viên
    try {
      if (editingEmployeeId) {
        await axios.put(
          `http://localhost:8080/api/employees/${editingEmployeeId}`,
          newEmployee
        );
        setSuccessMessage("Cập nhật nhân viên thành công");
      } else {
        await axios.post("http://localhost:8080/api/employees", newEmployee);
        setSuccessMessage("Thêm mới nhân viên thành công");
      }
      fetchEmployees();
      resetForm();
      setShowModal(false);
    } catch (error) {
      setErrorMessage("Đã xảy ra lỗi khi lưu nhân viên");
    }
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
          <Modal.Title>
            {editingEmployeeId ? "Sửa Nhân Viên" : "Thêm Nhân Viên"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formFullName">
              <Form.Label>Họ và Tên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập họ và tên"
                name="fullName"
                value={newEmployee.fullName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formDateOfBirth">
              <Form.Label>Ngày Sinh</Form.Label>
              <Form.Control
                type="date"
                name="dateOfBirth"
                value={newEmployee.dateOfBirth}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formGender">
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
            <Form.Group controlId="formNationalID">
              <Form.Label>CCCD</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập CCCD"
                name="nationalID"
                value={newEmployee.nationalID}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Nhập email"
                name="email"
                value={newEmployee.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPhoneNumber">
              <Form.Label>Số Điện Thoại</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập số điện thoại"
                name="phoneNumber"
                value={newEmployee.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formEmployeeType">
              <Form.Label>Loại Nhân Viên</Form.Label>
              <Form.Control
                as="select"
                name="employeeTypeId"
                value={newEmployee.employeeTypeId}
                onChange={handleInputChange}
                required
              >
                <option value="">Chọn loại nhân viên</option>
                <option value="1">Giáo Viên</option>
                <option value="2">Nhân viên</option>
              </Form.Control>
            </Form.Group>

            
            
            <Form.Group controlId="formActivate">
              <Form.Label>Kích Hoạt</Form.Label>
              <Form.Check
                type="checkbox"
                name="activate"
                checked={newEmployee.activate}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formAddress">
              <Form.Label>Địa Chỉ</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập địa chỉ"
                name="address"
                value={newEmployee.address}
                onChange={handleInputChange}
              />
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
  <Button variant="primary" type="submit" className="me-2">
    {editingEmployeeId ? "Cập Nhật" : "Thêm"}
  </Button>
</div>

          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thông Tin Chi Tiết Nhân Viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <>
              <p><strong>Họ và Tên:</strong> {selectedEmployee.fullName}</p>
              <p><strong>Ngày Sinh:</strong> {selectedEmployee.dateOfBirth.join('-')}</p>
              <p><strong>Giới Tính:</strong> {selectedEmployee.gender}</p>
              <p><strong>CCCD:</strong> {selectedEmployee.nationalID}</p>
              <p><strong>Email:</strong> {selectedEmployee.email}</p>
              <p><strong>Số Điện Thoại:</strong> {selectedEmployee.phoneNumber}</p>
              <p><strong>Loại Nhân Viên:</strong> {selectedEmployee.employeeTypeId}</p>
              <p><strong>Địa Chỉ:</strong> {selectedEmployee.address}</p>
              <p><strong>Kích Hoạt:</strong> {selectedEmployee.activate ? "Có" : "Không"}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default EmployeeList;
