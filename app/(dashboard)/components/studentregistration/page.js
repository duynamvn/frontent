"use client"; 
import React, { useState } from "react";
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
    Pagination
} from 'react-bootstrap';
import axios from "axios";

function StudentRegistration() {
  const [studentData, setStudentData] = useState({
    activate: true,
    address: "",
    date_of_birth: "",
    email: "",
    full_name: "",
    gender: "",
    national_id: "",
    phone_number: "",
    student_code: "",
    image_name: "",
    collected_money: false,
    collection_date: "",
    note: "",
    registration_date: "",
    course_id: "",
    student_id: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudentData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/student", studentData);
      setSuccess("Đăng ký học viên thành công!");
      setError(null);
      console.log("Response:", response.data);
      // Reset form if needed
      setStudentData({
        activate: true,
        address: "",
        date_of_birth: "",
        email: "",
        full_name: "",
        gender: "",
        national_id: "",
        phone_number: "",
        student_code: "",
        image_name: "",
        collected_money: false,
        collection_date: "",
        note: "",
        registration_date: "",
        course_id: "",
        student_id: "",
      });
    } catch (error) {
      console.error("Error registering student:", error);
      setError("Đã xảy ra lỗi khi đăng ký học viên.");
      setSuccess(null);
    }
  };

  return (
    <Container>
      <h2>Đăng Ký Học Viên</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="fullName">
          <Form.Label>Tên Học Viên</Form.Label>
          <Form.Control
            type="text"
            name="fullName"
            value={studentData.fullName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="dateOfBirth">
          <Form.Label>Ngày Sinh</Form.Label>
          <Form.Control
            type="date"
            name="dateOfBirth"
            value={studentData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={studentData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="gender">
          <Form.Label>Giới Tính</Form.Label>
          <Form.Control
            as="select"
            name="gender"
            value={studentData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="address">
          <Form.Label>Địa Chỉ</Form.Label>
          <Form.Control
            type="text"
            name="address"
            value={studentData.address}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="phoneNumber">
          <Form.Label>Số Điện Thoại</Form.Label>
          <Form.Control
            type="string"
            name="phoneNumber"
            value={studentData.phoneNumber}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="nationalID">
          <Form.Label>CCCD</Form.Label>
          <Form.Control
            type="text"
            name="nationalID"
            value={studentData.nationalID}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="studentCode">
          <Form.Label>Mã Học Viên</Form.Label>
          <Form.Control
            type="text"
            name="studentCode"
            value={studentData.studentCode}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="imageName">
          <Form.Label> Hình Ảnh</Form.Label>
          <Form.Control
            type="file"
            name="imageName"
            value={studentData.imageName}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="collectedMoney">
          <Form.Check
            type="checkbox"
            label="Đã Thu Tiền"
            name="collected_money"
            checked={studentData.collected_money}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="collectionDate">
          <Form.Label>Ngày Thu</Form.Label>
          <Form.Control
            type="date"
            name="collection_date"
            value={studentData.collection_date}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="note">
          <Form.Label>Ghi Chú</Form.Label>
          <Form.Control
            type="text"
            name="note"
            value={studentData.note}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="registrationDate">
          <Form.Label>Ngày Đăng Ký</Form.Label>
          <Form.Control
            type="date"
            name="registration_date"
            value={studentData.registration_date}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="courseId">
          <Form.Label>Mã Khóa Học</Form.Label>
          <Form.Control
            type="number"
            name="course_id"
            value={studentData.course_id}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Đăng Ký
        </Button>
      </Form>
    </Container>
  );
}

export default StudentRegistration;
