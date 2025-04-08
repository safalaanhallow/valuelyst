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
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { PieChart } from 'react-minimal-pie-chart';

const allocationMethods = [
  { value: 'pro-rata', label: 'Pro-Rata Share (Area)' },
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'custom', label: 'Custom Allocation' },
  { value: 'none', label: 'No CAM Charges' },
];

const expenseCategories = [
  { id: 'landscaping', name: 'Landscaping' },
  { id: 'security', name: 'Security' },
  { id: 'utilities', name: 'Common Utilities' },
  { id: 'maintenance', name: 'Building Maintenance' },
  { id: 'management', name: 'Property Management' },
  { id: 'insurance', name: 'Insurance' },
  { id: 'taxes', name: 'Property Taxes' },
  { id: 'other', name: 'Other Expenses' },
];

// Function to generate random colors for the pie chart
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const CAMChargeAllocator = ({ open, onClose, tenants, onSave }) => {
  const [allocationMethod, setAllocationMethod] = useState('pro-rata');
  const [totalCAMExpense, setTotalCAMExpense] = useState(0);
  const [allocations, setAllocations] = useState([]);
  const [expenses, setExpenses] = useState(expenseCategories.map(cat => ({
    ...cat,
    amount: 0,
  })));
  const [editingIndex, setEditingIndex] = useState(null);
  
  // Initialize with data if available
  useEffect(() => {
    if (tenants && tenants.length > 0) {
      // Calculate total leasable area
      const totalArea = tenants.reduce((sum, tenant) => sum + Number(tenant.leasedArea || 0), 0);
      
      // Initialize allocations
      const initialAllocations = tenants.map(tenant => {
        const leasedArea = Number(tenant.leasedArea || 0);
        const sharePercentage = totalArea > 0 ? (leasedArea / totalArea) * 100 : 0;
        
        return {
          tenantId: tenant.id,
          tenantName: tenant.tenantName,
          leasedArea,
          sharePercentage,
          allocationAmount: 0,
          customAmount: tenant.annualCamAmount || 0,
          color: getRandomColor(),
        };
      });
      
      setAllocations(initialAllocations);
      
      // If we have expense data in any tenant, use it
      const tenantWithExpenses = tenants.find(t => t.camExpenses && Array.isArray(t.camExpenses));
      if (tenantWithExpenses) {
        setExpenses(tenantWithExpenses.camExpenses);
        const total = tenantWithExpenses.camExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
        setTotalCAMExpense(total);
      }
    }
  }, [tenants]);
  
  // Recalculate allocations when expenses or method changes
  useEffect(() => {
    const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    setTotalCAMExpense(totalExpense);
    
    // Calculate allocations based on method
    if (allocationMethod === 'pro-rata') {
      const totalArea = allocations.reduce((sum, alloc) => sum + Number(alloc.leasedArea || 0), 0);
      
      setAllocations(prev => prev.map(alloc => {
        const sharePercentage = totalArea > 0 ? (alloc.leasedArea / totalArea) * 100 : 0;
        return {
          ...alloc,
          sharePercentage,
          allocationAmount: (sharePercentage / 100) * totalExpense,
        };
      }));
    } else if (allocationMethod === 'fixed') {
      // Equal division among tenants
      const fixedAmount = allocations.length > 0 ? totalExpense / allocations.length : 0;
      
      setAllocations(prev => prev.map(alloc => ({
        ...alloc,
        allocationAmount: fixedAmount,
      })));
    } else if (allocationMethod === 'custom') {
      // Use custom amounts (keep existing custom amounts)
      setAllocations(prev => prev.map(alloc => ({
        ...alloc,
        allocationAmount: alloc.customAmount || 0,
      })));
    } else if (allocationMethod === 'none') {
      // No CAM charges
      setAllocations(prev => prev.map(alloc => ({
        ...alloc,
        allocationAmount: 0,
      })));
    }
  }, [expenses, allocationMethod]);
  
  const handleExpenseChange = (id, amount) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === id ? { ...exp, amount: parseFloat(amount) || 0 } : exp
    ));
  };
  
  const handleAllocationMethodChange = (e) => {
    setAllocationMethod(e.target.value);
  };
  
  const startEditing = (index) => {
    setEditingIndex(index);
  };
  
  const cancelEditing = () => {
    setEditingIndex(null);
  };
  
  const saveEditing = (index, value) => {
    const newAmount = parseFloat(value) || 0;
    setAllocations(prev => prev.map((alloc, i) => 
      i === index ? { ...alloc, customAmount: newAmount, allocationAmount: newAmount } : alloc
    ));
    setEditingIndex(null);
  };
  
  const recalculateShares = () => {
    // Recalculate share percentages based on leased area
    const totalArea = allocations.reduce((sum, alloc) => sum + Number(alloc.leasedArea || 0), 0);
    
    setAllocations(prev => prev.map(alloc => {
      const sharePercentage = totalArea > 0 ? (alloc.leasedArea / totalArea) * 100 : 0;
      return {
        ...alloc,
        sharePercentage,
      };
    }));
  };
  
  const handleSave = () => {
    // Update each tenant with their CAM allocation
    const updatedTenants = tenants.map(tenant => {
      const allocation = allocations.find(a => a.tenantId === tenant.id);
      
      if (allocation) {
        return {
          ...tenant,
          annualCamAmount: allocation.allocationAmount,
          monthlyCamAmount: allocation.allocationAmount / 12,
          camSharePercentage: allocation.sharePercentage,
          camExpenses: expenses, // Store expenses data for future reference
        };
      }
      
      return tenant;
    });
    
    onSave(updatedTenants);
    onClose();
  };
  
  // Prepare data for pie chart
  const pieData = allocations
    .filter(alloc => alloc.allocationAmount > 0)
    .map(alloc => ({
      title: alloc.tenantName,
      value: alloc.allocationAmount,
      color: alloc.color,
    }));
  
  // Check if allocations match total expense
  const totalAllocated = allocations.reduce((sum, alloc) => sum + Number(alloc.allocationAmount || 0), 0);
  const isBalanced = Math.abs(totalAllocated - totalCAMExpense) < 0.01;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">CAM Charge Allocator</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Left column - Expenses */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>CAM Expenses</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the total annual common area maintenance expenses below.
              </Typography>
              
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Expense Category</TableCell>
                      <TableCell>Annual Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.name}</TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={expense.amount}
                            onChange={(e) => handleExpenseChange(expense.id, e.target.value)}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <Typography variant="subtitle2">Total Expenses</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          ${totalCAMExpense.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="allocation-method-label">Allocation Method</InputLabel>
                <Select
                  labelId="allocation-method-label"
                  value={allocationMethod}
                  label="Allocation Method"
                  onChange={handleAllocationMethodChange}
                >
                  {allocationMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 2 }}>
                <Tooltip title="Recalculate share percentages based on current tenant square footage">
                  <Button 
                    variant="outlined" 
                    startIcon={<RefreshIcon />}
                    onClick={recalculateShares}
                    size="small"
                  >
                    Recalculate Shares
                  </Button>
                </Tooltip>
              </Box>
            </Paper>
            
            {/* Visualization */}
            {pieData.length > 0 && (
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Allocation Visualization</Typography>
                
                <Box sx={{ height: 200, position: 'relative' }}>
                  <PieChart
                    data={pieData}
                    label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`}
                    labelStyle={{
                      fontSize: '5px',
                      fontFamily: 'sans-serif',
                    }}
                    labelPosition={60}
                    radius={42}
                    lineWidth={20}
                    segmentsStyle={{ transition: 'stroke-width 0.2s' }}
                  />
                </Box>
                
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {pieData.map((entry, i) => (
                    <Box 
                      key={i} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mr: 2,
                        mb: 1,
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          backgroundColor: entry.color,
                          mr: 1 
                        }} 
                      />
                      <Typography variant="caption" noWrap>
                        {entry.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </Grid>
          
          {/* Right column - Tenant Allocations */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Tenant Allocations</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Review and adjust CAM charge allocations for each tenant.
                {allocationMethod === 'custom' && 
                  " Click the edit button to modify a tenant's allocation amount."}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color={isBalanced ? 'success.main' : 'error.main'}>
                  {isBalanced 
                    ? "✓ Allocations balance with total expenses" 
                    : `⚠ Allocations ${totalAllocated > totalCAMExpense ? 'exceed' : 'fall short of'} expenses by $${Math.abs(totalAllocated - totalCAMExpense).toFixed(2)}`}
                </Typography>
                <Tooltip title="Total allocated amounts should equal total expenses for accurate cost recovery.">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tenant</TableCell>
                      <TableCell>Area (SF)</TableCell>
                      <TableCell>Share %</TableCell>
                      <TableCell>Annual CAM</TableCell>
                      <TableCell>Monthly CAM</TableCell>
                      {allocationMethod === 'custom' && <TableCell>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allocations.map((allocation, index) => (
                      <TableRow key={index}>
                        <TableCell>{allocation.tenantName}</TableCell>
                        <TableCell>{allocation.leasedArea.toLocaleString()}</TableCell>
                        <TableCell>{allocation.sharePercentage.toFixed(2)}%</TableCell>
                        <TableCell>
                          {editingIndex === index ? (
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              defaultValue={allocation.customAmount}
                              onBlur={(e) => saveEditing(index, e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  saveEditing(index, e.target.value);
                                }
                              }}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>
                              }}
                              autoFocus
                            />
                          ) : (
                            `$${allocation.allocationAmount.toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell>${(allocation.allocationAmount / 12).toFixed(2)}</TableCell>
                        {allocationMethod === 'custom' && (
                          <TableCell>
                            {editingIndex === index ? (
                              <IconButton size="small" onClick={() => saveEditing(index, allocation.customAmount)} color="primary">
                                <SaveIcon fontSize="small" />
                              </IconButton>
                            ) : (
                              <IconButton size="small" onClick={() => startEditing(index)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="subtitle2">Totals:</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {allocations.reduce((sum, alloc) => sum + Number(alloc.sharePercentage || 0), 0).toFixed(2)}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          ${totalAllocated.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          ${(totalAllocated / 12).toFixed(2)}
                        </Typography>
                      </TableCell>
                      {allocationMethod === 'custom' && <TableCell />}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Apply Allocations
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CAMChargeAllocator;
