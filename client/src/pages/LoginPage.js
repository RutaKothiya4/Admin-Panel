// LoginPage component with form, Redux login dispatch, error handling, and redirect after login

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
import { loginThunk } from "../features/auth/authThunks";
import { useNavigate, useLocation } from "react-router-dom";
import Loader from "../components/Loader";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((s) => s.auth);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginThunk(form));
    if (res.type.endsWith("fulfilled")) {
      const redirect = location.state?.from?.pathname || "/Home";
      navigate(redirect, { replace: true });
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <Container>
      <Row className="justify-content-center">
        <Col md="6">
          <Card className="shadow-sm">
            <CardBody>
              <CardTitle tag="h2" className="mb-4 text-center">
                Login
              </CardTitle>
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
                <Button color="primary" className="w-100 mt-3">
                  Login
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
