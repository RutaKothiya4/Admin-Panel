import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { registerThunk } from "../features/auth/authThunks";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

export default function RegisterPage() {
  // Form state: username, password, role
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "User",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  // Handle input changes for form fields
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit registration form
  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(registerThunk(form));
    // On successful registration, redirect to login page
    if (res.type.endsWith("fulfilled")) {
      navigate("/login");
    }
  };

  // Show loader while processing registration
  if (loading) return <Loader />;

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md="6">
          <Card className="shadow-sm">
            <CardBody>
              <CardTitle tag="h2" className="mb-4 text-center">
                Register
              </CardTitle>
              {/* Display error if any */}
              {error && <Alert color="danger">{error}</Alert>}
              <Form onSubmit={onSubmit}>
                <FormGroup>
                  <Label>Username</Label>
                  <Input
                    name="username"
                    value={form.username}
                    onChange={onChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Role</Label>
                  <Input
                    type="select"
                    name="role"
                    value={form.role}
                    onChange={onChange}
                  >
                    <option>User</option>
                    <option>Manager</option>
                    <option>Super Admin</option>
                  </Input>
                </FormGroup>
                <Button color="primary" className="w-100 mt-3">
                  Register
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
