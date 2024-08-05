"use client";
import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { firestore, auth, provider } from '@/firebase'; // Ensure firebase imports
import { collection, doc, getDocs, query, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { Camera } from 'react-camera-pro'; // Ensure this import is correct
import LoginPage from './login-page'; // Import the LoginPage component

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [itemName, setItemName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null); // Track user authentication status
  const camera = useRef(null); // Camera reference

  useEffect(() => {
    // Debugging: Log authentication state change
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log('Auth state changed:', user);
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

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

  const addItem = async (item, img) => {
    if (!item.trim()) return; // Prevent adding empty items
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, image: img });
    } else {
      await setDoc(docRef, { quantity: 1, image: img });
    }
    await updateInventory();
  };

  const handleAddItem = () => {
    if (itemName) {
      addItem(itemName, image); // Image can be null
      setItemName('');
      setImage(null);
      setShowCamera(false);
      setShowModal(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm)
  );

  const removeItem = async (name) => {
    await deleteDoc(doc(firestore, 'inventory', name));
    await updateInventory();
  };

  const decrementQuantity = async (name) => {
    const docRef = doc(firestore, 'inventory', name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity > 1) {
        await setDoc(docRef, { quantity: quantity - 1, image: docSnap.data().image });
      } else {
        await deleteDoc(docRef);
      }
    }
    await updateInventory();
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user); // Set the authenticated user
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear the authenticated user
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  return (
    <Container fluid className={`d-flex flex-column min-vh-100 p-4 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <>
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
            <Button
              variant="secondary"
              className="ms-2"
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </div>

          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>{showCamera ? 'Take Picture' : 'Add Item'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                {showCamera ? (
                  <div className="camera-container">
                    <Camera ref={camera} numberOfCamerasCallback={() => {}} /> {/* Adjust if needed */}
                    <div className="camera-controls">
                      <Button
                        className="btn-cancel"
                        variant="secondary"
                        onClick={() => setShowCamera(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="btn-take-photo"
                        variant="primary"
                        onClick={() => {
                          const photo = camera.current.takePhoto(); // Capture photo
                          setImage(photo);
                          setShowCamera(false);
                        }}
                      >
                        Take Photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Item Name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </Form.Group>
                    <Button
                      variant="primary"
                      className="me-2"
                      onClick={() => setShowCamera(true)}
                    >
                      Add Picture
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleAddItem}
                    >
                      Add
                    </Button>
                  </>
                )}
                {image && !showCamera && (
                  <div className="mt-3">
                    <img src={image} alt='Taken photo' className="img-fluid" />
                  </div>
                )}
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
              {filteredInventory.map(({ name, quantity, image }) => (
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
                      {image ? (
                        <img src={image} alt={name} className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <span className="text-muted">No Picture</span>
                      )}
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
                          onClick={() => addItem(name, image)}
                          className="btn-sm"
                        >
                          +
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => removeItem(name)}
                          className="btn-sm"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </>
      )}
    </Container>
  );
}
