'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Form, Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { firestore } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async (item) => {
    if (!item.trim()) return; // Prevent adding empty items
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const decrementQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity > 1) {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    await deleteDoc(docRef);
    await updateInventory();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addItem(itemName);
      setItemName('');
      setShowModal(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm)
  );

  return (
    <Container fluid className={`d-flex flex-column min-vh-100 p-4 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-center flex-grow-1">Pantry Tracker</h1>
        <Button
          variant={darkMode ? 'light' : 'dark'}
          className={`rounded-circle ${darkMode ? 'text-dark' : 'text-light'}`}
          style={{ width: '40px', height: '40px' }}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️' : '🌙'}
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Item"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </Form.Group>
            <Button
              variant="primary"
              className="me-2"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                setShowModal(false);
              }}
            >
              Add
            </Button>
            <Button variant="secondary">Add Picture</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Container className="mb-4">
        
        <Row>
          <Col className="d-flex mb-3 gap-2">
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
              className="me-2"
              style={{ height: '40px', fontSize: '0.9rem' }}
            >
              Add New Item
            </Button>
            <Button variant="secondary" style={{ height: '40px', fontSize: '0.9rem' }}>
              Add Picture
            </Button>
          </Col>
          <Col>
            <InputGroup className="mb-3">
              <FormControl
                type="text"
                placeholder="Search..."
                onChange={handleSearch}
              />
              <Button variant="outline-primary">Search</Button>
            </InputGroup>
          </Col>
        </Row>
      </Container>

      <Container>
        <Row className="mb-4">
          <Col className="text-center py-3 border rounded" style={{ backgroundColor: darkMode ? '#333' : '#83848a' }}>
            <h2>Inventory Items</h2>
          </Col>
        </Row>
        <Row className="g-3">
          {filteredInventory.map(({ name, quantity }) => (
            <Col md={4} key={name}>
              <div
                className="item-box d-flex flex-column align-items-center p-3 border rounded"
                style={{
                  backgroundColor: darkMode ? '#444' : '#e9ecef', // Darker box background
                  border: `2px solid ${darkMode ? '#ddd' : '#ccc'}`, // Light border color for contrast
                }}
              >
                <div
                  className="item-box-image d-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: '100%',
                    height: '100px', // Adjust image placeholder height
                    backgroundColor: darkMode ? '#555' : '#ddd', // Light background for image placeholder
                    borderRadius: '8px',
                  }}
                >
                  <span className="text-muted">Add Picture</span>
                </div>
                <div className="item-box-content d-flex flex-column align-items-center w-100">
                  <div className="mb-2 item-box-description">
                    <span className={`fw-bold ${darkMode ? 'text-light' : 'text-dark'}`}>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                    <div className={`text-${darkMode ? 'light' : 'dark'}`}>Quantity: {quantity}</div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      variant="outline-secondary"
                      onClick={() => decrementQuantity(name)}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className={`mx-2 ${darkMode ? 'text-light' : 'text-dark'}`}>{quantity}</span>
                    <Button
                      variant="outline-secondary"
                      onClick={() => addItem(name)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Button
                  variant="danger"
                  className="mt-2"
                  onClick={() => removeItem(name)}
                >
                  Remove
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
}
