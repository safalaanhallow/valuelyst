import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Alert } from 'react-bootstrap';
import UserRoleManagement from './UserRoleManagement';
import DataExportControls from './DataExportControls';
import axios from 'axios';
import { getAuthToken } from '../../../utils/auth';

const OrgAdminPanel = ({ organizationId }) => {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const token = await getAuthToken();
        const response = await axios.get(`/api/organizations/${organizationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrganization(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError('Failed to load organization data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchOrganization();
    }
  }, [organizationId]);

  if (loading) {
    return <div className="text-center p-5">Loading organization data...</div>;
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        {error}
      </Alert>
    );
  }

  if (!organization) {
    return (
      <Alert variant="warning" className="m-3">
        Organization not found or you don't have permission to access it.
      </Alert>
    );
  }

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">Organization Administration: {organization.name}</h2>
      
      <Tabs
        activeKey={activeTab}
        onSelect={k => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="users" title="User Management">
          <UserRoleManagement organizationId={organizationId} />
        </Tab>
        <Tab eventKey="exports" title="Data Export Controls">
          <DataExportControls organizationId={organizationId} />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default OrgAdminPanel;
