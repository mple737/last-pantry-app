"use client";
import { useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Use Next.js navigation for redirection

export default function LoginPage() {
  const router = useRouter(); 

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google Login successful:', user);
      router.push('/page'); 
    } catch (error) {
      console.error('Google Login Error:', error.message);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <Card className="p-4 shadow-lg">
            <Card.Body>
              <h3 className="text-center mb-4">Pantry Login</h3>
              
              <Button
                variant="light"
                className="w-100 d-flex align-items-center justify-content-center"
                onClick={handleGoogleLogin}
                style={{ padding: '16px', fontSize: '18px' }}
              >
                <img src="./web_light_rd_ctn@1x.png" alt="Google Login" style={{ width: '100%', height: 'auto' }} />
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
