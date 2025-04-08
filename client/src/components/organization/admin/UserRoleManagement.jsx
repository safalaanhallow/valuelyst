import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Alert, Row, Col, Badge } from 'react-bootstrap';
import axios from 'axios';
import { getAuthToken } from '../../../utils/auth';

const UserRoleManagement = ({ organizationId }) => {
  const [users, setUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  
  // Form states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Client');
  const [selectedUserId, setSelectedUserId] = useState('');
  
  const roles = ['Admin', 'Appraiser', 'Reviewer', 'Client'];
  
  useEffect(() => {
    fetchOrganizationUsers();
    fetchAvailableUsers();
  }, [organizationId]);
  
  const fetchOrganizationUsers = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const response = await axios.get(`/api/organizations/${organizationId}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching organization users:', err);
      setError('Failed to load organization users. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailableUsers = async () => {
    try {
      const token = await getAuthToken();
      // This endpoint would need to be implemented to fetch users without an org
      const response = await axios.get('/api/users?noOrg=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableUsers(response.data);
    } catch (err) {
      console.error('Error fetching available users:', err);
    }
  };
  
  const handleAddUser = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      await axios.post(`/api/organizations/${organizationId}/users`, {
        userId: selectedUserId,
        role: selectedRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowAddModal(false);
      setSelectedUserId('');
      setSelectedRole('Client');
      setSuccess('User added to organization successfully');
      
      // Refresh user lists
      await fetchOrganizationUsers();
      await fetchAvailableUsers();
    } catch (err) {
      console.error('Error adding user to organization:', err);
      setError(err.response?.data?.message || 'Failed to add user to organization');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      const token = await getAuthToken();
      await axios.put(`/api/organizations/${organizationId}/users/${selectedUser.id}/role`, {
        role: selectedRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowEditModal(false);
      setSelectedUser(null);
      setSuccess('User role updated successfully');
      
      // Refresh user list
      await fetchOrganizationUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveUser = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      const token = await getAuthToken();
      await axios.delete(`/api/organizations/${organizationId}/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowRemoveModal(false);
      setSelectedUser(null);
      setSuccess('User removed from organization successfully');
      
      // Refresh user lists
      await fetchOrganizationUsers();
      await fetchAvailableUsers();
    } catch (err) {
      console.error('Error removing user from organization:', err);
      setError(err.response?.data?.message || 'Failed to remove user from organization');
    } finally {
      setLoading(false);
    }
  };
  
  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  
  return (
    <Card className="shadow-sm">
      <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
        <span>Organization Users</span>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => setShowAddModal(true)}
          disabled={availableUsers.length === 0}
        >
          Add User
        </Button>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
        
        {loading ? (
          <div className="text-center p-3">Loading users...</div>
        ) : users.length === 0 ? (
          <Alert variant="info">No users in this organization yet.</Alert>
        ) : (
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedRole(user.role);
                        setShowEditModal(true);
                      }}
                    >
                      Edit Role
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowRemoveModal(true);
                      }}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
      
      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add User to Organization</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select User</Form.Label>
              <Form.Select 
                value={selectedUserId} 
                onChange={e => setSelectedUserId(e.target.value)}
                required
              >
                <option value="">Select a user...</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Assign Role</Form.Label>
              <Form.Select 
                value={selectedRole} 
                onChange={e => setSelectedRole(e.target.value)}
                required
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddUser}
            disabled={!selectedUserId || loading}
          >
            {loading ? 'Adding...' : 'Add User'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Role Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p>
                <strong>User:</strong> {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select 
                  value={selectedRole} 
                  onChange={e => setSelectedRole(e.target.value)}
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateRole}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Role'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Remove User Modal */}
      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Remove User from Organization</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p>
                Are you sure you want to remove <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> from this organization?
              </p>
              <p>
                This action will remove all organization-specific permissions from this user.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleRemoveUser}
            disabled={loading}
          >
            {loading ? 'Removing...' : 'Remove User'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'Admin':
      return 'danger';
    case 'Appraiser':
      return 'primary';
    case 'Reviewer':
      return 'success';
    case 'Client':
      return 'info';
    default:
      return 'secondary';
  }
};

export default UserRoleManagement;
