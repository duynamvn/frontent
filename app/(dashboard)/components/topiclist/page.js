"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Badge,
  Button,
  Card,
  Table,
  Container,
  Row,
  Col,
  Form,
  Modal,
  Pagination,
} from "react-bootstrap";

function TopicList() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTopic, setNewTopic] = useState({
    topicName: "",
    topicCode: "",
    theoryHours: "",
    practicalHours: "",
    originalPrice: "",
    promotionalPrice: "",
  });
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showTuitionFeeList, setShowTuitionFeeList] = useState(false);
  const [selectedTuitionFee, setSelectedTuitionFee] = useState(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [topicsPerPage] = useState(5); // Số lượng chuyên đề mỗi trang

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/topics");
      const sortedTopics = response.data.sort((a, b) => a.id - b.id);
      setTopics(sortedTopics);
    } catch (error) {
      setError("Failed to fetch topics");
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTopic({ ...newTopic, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTopicId) {
        await axios.put(`http://localhost:8080/api/topics/${editingTopicId}`, {
          ...newTopic,
        });
        alert("Thông tin chuyên đề đã được cập nhật thành công.");
      } else {
        await axios.post("http://localhost:8080/api/topics", { ...newTopic });
        alert("Chuyên đề đã được thêm thành công.");
      }
      fetchTopics();
      resetForm();
    } catch (error) {
      console.error("Error saving topic:", error);
      alert("Đã có lỗi xảy ra khi lưu thông tin chuyên đề.");
    }
  };

  const resetForm = () => {
    setNewTopic({
      topicName: "",
      topicCode: "",
      theoryHours: "",
      practicalHours: "",
      originalPrice: "",
      promotionalPrice: "",
    });
    setEditingTopicId(null);
    setShowForm(false);
    setSelectedTuitionFee(null); // Reset học phí đã chọn
  };

  const handleEdit = (id) => {
    const topicToEdit = topics.find((topic) => topic.id === id);
    if (topicToEdit) {
      setNewTopic({
        topicName: topicToEdit.topicName,
        topicCode: topicToEdit.topicCode,
        theoryHours: topicToEdit.theoryHours,
        practicalHours: topicToEdit.practicalHours,
        originalPrice: topicToEdit.originalPrice,
        promotionalPrice: topicToEdit.promotionalPrice,
      });
      setEditingTopicId(id);
      setShowForm(true);
      setSelectedTuitionFee(topicToEdit.tuitionFeeId); // Lấy học phí đã chọn
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chuyên đề này?")) {
      try {
        await axios.delete(`http://localhost:8080/api/topics/${id}`);
        fetchTopics();
        alert("Chuyên đề đã được xóa thành công.");
      } catch (error) {
        console.error("Error deleting topic:", error);
        alert("Đã có lỗi xảy ra khi xóa chuyên đề.");
      }
    }
  };

  const handleSelectTuitionFee = (fee) => {
    setSelectedTuitionFee(fee);
    setShowTuitionFeeList(false); // Ẩn danh sách học phí khi đã chọn
  };

  const handleShowModal = () => setShowForm(true);
  const handleCloseModal = () => {
    resetForm();
    setShowForm(false);
  };

  // Tính toán các chỉ số phân trang
  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  const currentTopics = topics.slice(indexOfFirstTopic, indexOfLastTopic);

  // Thay đổi trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p>Loading topics...</p>;
  if (error) return <p className="error">{error}</p>;

  // Tính tổng số trang
  const totalPages = Math.ceil(topics.length / topicsPerPage);

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header>
              <Card.Title as="h2">Danh Sách Chuyên Đề</Card.Title>
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  variant="primary"
                  onClick={() => setShowTuitionFeeList(true)}
                >
                  Chọn Học Phí
                </Button>
                <Button variant="primary" onClick={handleShowModal}>
                  Thêm Chuyên Đề
                </Button>
              </div>
            </Card.Header>

            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên Chuyên Đề</th>
                    <th>Mã Chuyên Đề</th>
                    <th>Giờ Lý Thuyết</th>
                    <th>Giờ Thực Hành</th>
                    <th>Giá Gốc</th>
                    <th>Giá Khuyến Mãi</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTopics.map((topic, index) => (
                    <tr key={topic.id}>
                      <td>{indexOfFirstTopic + index + 1}</td>
                      <td>{topic.topicName}</td>
                      <td>{topic.topicCode}</td>
                      <td>{topic.theoryHours}</td>
                      <td>{topic.practicalHours}</td>
                      <td>{topic.originalPrice}</td>
                      <td>{topic.promotionalPrice}</td>
                      <td>
                        <Button variant="info" style={{ marginRight: '10px' }} onClick={() => handleEdit(topic.id)}>
                          Sửa
                        </Button>
                        <Button variant="danger" onClick={() => handleDelete(topic.id)}>
                          Xóa
                        </Button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Thanh phân trang */}
              <Pagination>
                <Pagination.First onClick={() => paginate(1)} />
                <Pagination.Prev
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {Array.from({ length: totalPages }, (_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last onClick={() => paginate(totalPages)} />
              </Pagination>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal cho Thêm/Sửa Chuyên Đề */}
      <Modal show={showForm} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTopicId ? "Cập Nhật Chuyên Đề" : "Thêm Chuyên Đề"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formTopicsName">
              <Form.Label>Tên Chuyên Đề</Form.Label>
              <Form.Control
                type="text"
                name="topicName"
                value={newTopic.topicName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formTopicsCode">
              <Form.Label>Mã Chuyên Đề</Form.Label>
              <Form.Control
                type="text"
                name="topicCode"
                value={newTopic.topicCode}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formTheoryHours">
              <Form.Label>Giờ Lý Thuyết</Form.Label>
              <Form.Control
                type="number"
                name="theoryHours"
                value={newTopic.theoryHours}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPracticalHours">
              <Form.Label>Giờ Thực Hành</Form.Label>
              <Form.Control
                type="number"
                name="practicalHours"
                value={newTopic.practicalHours}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formOriginalPrice">
              <Form.Label>Giá Gốc</Form.Label>
              <Form.Control
                type="number"
                name="originalPrice"
                value={newTopic.originalPrice}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPromotionalPrice">
              <Form.Label>Giá Khuyến Mãi</Form.Label>
              <Form.Control
                type="number"
                name="promotionalPrice"
                value={newTopic.promotionalPrice}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editingTopicId ? "Cập Nhật" : "Thêm"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default TopicList;
