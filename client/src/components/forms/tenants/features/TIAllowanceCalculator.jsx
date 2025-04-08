import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';

const TIAllowanceCalculator = ({ open, onClose, tenant, onSave }) => {
  const [tiAllowance, setTiAllowance] = useState(tenant?.tiAllowanceTotal || 0);
  const [remainingAllowance, setRemainingAllowance] = useState(tenant?.tiRemainingAllowance || 0);
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    amount: 0,
    status: 'Planned',
    contractor: '',
    completionDate: ''
  });
  
  // Initialize with TI data if available
  useEffect(() => {
    if (tenant) {
      setTiAllowance(tenant.tiAllowanceTotal || 0);
      setRemainingAllowance(tenant.tiRemainingAllowance || tenant.tiAllowanceTotal || 0);
      
      // If tenant has TI projects, initialize them
      if (tenant.tiProjects && Array.isArray(tenant.tiProjects)) {
        setProjects(tenant.tiProjects);
      }
    }
  }, [tenant]);
  
  // Recalculate remaining allowance when projects change
  useEffect(() => {
    const totalSpent = projects.reduce((total, project) => total + Number(project.amount), 0);
    setRemainingAllowance(tiAllowance - totalSpent);
  }, [projects, tiAllowance]);
  
  const handleTiAllowanceChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setTiAllowance(value);
  };
  
  const handleNewProjectChange = (field, value) => {
    setNewProject(prev => ({
      ...prev,
      [field]: field === 'amount' ? (parseFloat(value) || 0) : value
    }));
  };
  
  const handleEditingProjectChange = (field, value) => {
    setEditingProject(prev => ({
      ...prev,
      [field]: field === 'amount' ? (parseFloat(value) || 0) : value
    }));
  };
  
  const addProject = () => {
    if (!newProject.name) return;
    
    setProjects(prev => [...prev, { ...newProject, id: Date.now() }]);
    setNewProject({
      name: '',
      description: '',
      amount: 0,
      status: 'Planned',
      contractor: '',
      completionDate: ''
    });
  };
  
  const startEditing = (project) => {
    setEditingProject({ ...project });
  };
  
  const cancelEditing = () => {
    setEditingProject(null);
  };
  
  const saveEditing = () => {
    if (!editingProject) return;
    
    setProjects(prev => prev.map(p => 
      p.id === editingProject.id ? editingProject : p
    ));
    setEditingProject(null);
  };
  
  const deleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (editingProject && editingProject.id === projectId) {
      setEditingProject(null);
    }
  };
  
  const handleSave = () => {
    const updatedTenant = {
      ...tenant,
      tiAllowanceTotal: tiAllowance,
      tiRemainingAllowance: remainingAllowance,
      tiProjects: projects
    };
    
    onSave(updatedTenant);
    onClose();
  };
  
  // Calculate progress percentage
  const progressPercentage = tiAllowance > 0 ? ((tiAllowance - remainingAllowance) / tiAllowance) * 100 : 0;
  
  // Generate amortization schedule if applicable
  const generateAmortizationSchedule = () => {
    if (!tenant.tiAmortizationRate || !tenant.tiAmortizationTerm || !tenant.tiAmortizedAmount) {
      return null;
    }
    
    const principal = tenant.tiAmortizedAmount;
    const interestRate = tenant.tiAmortizationRate / 100 / 12; // Monthly interest rate
    const numberOfPayments = tenant.tiAmortizationTerm;
    
    // Calculate monthly payment using the formula: P = (r*PV) / (1 - (1+r)^-n)
    const monthlyPayment = (interestRate * principal) / (1 - Math.pow(1 + interestRate, -numberOfPayments));
    
    const schedule = [];
    let balance = principal;
    
    for (let i = 1; i <= numberOfPayments; i++) {
      const interest = balance * interestRate;
      const principalPayment = monthlyPayment - interest;
      balance -= principalPayment;
      
      schedule.push({
        paymentNumber: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interest,
        balance: Math.max(0, balance)
      });
      
      // Only show first 12 payments for brevity
      if (i >= 12 && numberOfPayments > 24) {
        schedule.push({ isSummary: true, remainingPayments: numberOfPayments - i });
        break;
      }
    }
    
    return schedule;
  };
  
  const amortizationSchedule = generateAmortizationSchedule();
  
  const projectStatuses = ['Planned', 'In Progress', 'Completed', 'Cancelled'];
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">TI Allowance Calculator</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        {/* TI Allowance Overview */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>TI Allowance Overview</Typography>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Total TI Allowance"
                type="number"
                value={tiAllowance}
                onChange={handleTiAllowanceChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Remaining Allowance"
                type="number"
                value={remainingAllowance}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  readOnly: true,
                }}
                sx={{ 
                  '& input': { 
                    color: remainingAllowance < 0 ? 'error.main' : 'success.main',
                    fontWeight: 'bold'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, progressPercentage)} 
                    color={remainingAllowance < 0 ? "error" : "primary"}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {progressPercentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {remainingAllowance < 0 ? 
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                    <PriorityHighIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Exceeded by ${Math.abs(remainingAllowance).toFixed(2)}
                  </Box> : 
                  `${((tiAllowance - remainingAllowance) / tiAllowance * 100).toFixed(1)}% used`
                }
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        {/* TI Projects */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>TI Projects</Typography>
          
          <TableContainer sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    {editingProject && editingProject.id === project.id ? (
                      // Editing mode
                      <>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={editingProject.name}
                            onChange={(e) => handleEditingProjectChange('name', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={editingProject.description || ''}
                            onChange={(e) => handleEditingProjectChange('description', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={editingProject.amount}
                            onChange={(e) => handleEditingProjectChange('amount', e.target.value)}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={editingProject.status || 'Planned'}
                              onChange={(e) => handleEditingProjectChange('status', e.target.value)}
                            >
                              {projectStatuses.map(status => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={saveEditing} color="primary">
                            <SaveIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={cancelEditing}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </>
                    ) : (
                      // View mode
                      <>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>{project.description}</TableCell>
                        <TableCell>${project.amount.toFixed(2)}</TableCell>
                        <TableCell>{project.status}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => startEditing(project)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => deleteProject(project.id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
                
                {/* Add new project row */}
                <TableRow>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="New Project Name"
                      value={newProject.name}
                      onChange={(e) => handleNewProjectChange('name', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Description"
                      value={newProject.description}
                      onChange={(e) => handleNewProjectChange('description', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      placeholder="Amount"
                      value={newProject.amount}
                      onChange={(e) => handleNewProjectChange('amount', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={newProject.status}
                        onChange={(e) => handleNewProjectChange('status', e.target.value)}
                      >
                        {projectStatuses.map(status => (
                          <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={addProject}
                      disabled={!newProject.name}
                    >
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
                
                {/* Total row */}
                <TableRow>
                  <TableCell colSpan={2} align="right">
                    <Typography variant="subtitle2">Total:</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      ${projects.reduce((sum, project) => sum + Number(project.amount), 0).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        {/* Amortization Schedule if applicable */}
        {amortizationSchedule && (
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>TI Amortization Schedule</Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Amortized Amount"
                  value={tenant.tiAmortizedAmount || 0}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    readOnly: true,
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Amortization Rate"
                  value={tenant.tiAmortizationRate || 0}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    readOnly: true,
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Amortization Term"
                  value={tenant.tiAmortizationTerm || 0}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">months</InputAdornment>,
                    readOnly: true,
                  }}
                  size="small"
                />
              </Grid>
            </Grid>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Payment #</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Principal</TableCell>
                    <TableCell>Interest</TableCell>
                    <TableCell>Remaining Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {amortizationSchedule.map((row, index) => (
                    row.isSummary ? (
                      <TableRow key={index}>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2">
                            ... {row.remainingPayments} more payments ...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={index}>
                        <TableCell>{row.paymentNumber}</TableCell>
                        <TableCell>${row.payment.toFixed(2)}</TableCell>
                        <TableCell>${row.principal.toFixed(2)}</TableCell>
                        <TableCell>${row.interest.toFixed(2)}</TableCell>
                        <TableCell>${row.balance.toFixed(2)}</TableCell>
                      </TableRow>
                    )
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TIAllowanceCalculator;
