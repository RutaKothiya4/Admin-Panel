import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutThunk } from "../features/auth/authThunks";

export default function NavbarTop() {
  const { accessToken, role } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutModal, setLogoutModal] = useState(false);

  // Toggle modal visibility
  const toggleLogoutModal = () => setLogoutModal(!logoutModal);

  // Confirm logout
  const confirmLogout = async () => {
    toggleLogoutModal();
    await dispatch(logoutThunk());
    navigate("/login");
  };

  return (
    <>
      <Navbar color="light" expand="md" className="mb-4 px-3 shadow-sm">
        <NavbarBrand tag={Link} to="/">
          RBAC
        </NavbarBrand>
        <Nav className="ms-auto" navbar>
          {accessToken ? (
            <>
              <NavItem>
                <NavLink tag={Link} to="/Home">
                  Home
                </NavLink>
              </NavItem>

              {role === "Super Admin" && (
                <>
                  <NavItem>
                    <NavLink tag={Link} to="/dashboard">
                      Dashboard
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink tag={Link} to="/admin">
                      Admin
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink tag={Link} to="/manager">
                      Manager
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink tag={Link} to="/user">
                      User
                    </NavLink>
                  </NavItem>
                </>
              )}

              {role === "Manager" && (
                <>
                  <NavItem>
                    <NavLink tag={Link} to="/manager">
                      Manager
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink tag={Link} to="/user">
                      User
                    </NavLink>
                  </NavItem>
                </>
              )}

              <NavItem>
                <NavLink href="#" onClick={toggleLogoutModal}>
                  Logout
                </NavLink>
              </NavItem>
            </>
          ) : (
            <>
              <NavItem>
                <NavLink tag={Link} to="/login">
                  Login
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/register">
                  Register
                </NavLink>
              </NavItem>
            </>
          )}
        </Nav>
      </Navbar>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={logoutModal} toggle={toggleLogoutModal}>
        <ModalHeader toggle={toggleLogoutModal}>Confirm Logout</ModalHeader>
        <ModalBody>Are you sure you want to logout?</ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={confirmLogout}>
            Yes, Logout
          </Button>
          <Button color="secondary" onClick={toggleLogoutModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
