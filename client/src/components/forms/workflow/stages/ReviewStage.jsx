import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import axios from 'axios';

const ReviewStage = ({ workflow, property, validationResults, onValidate, onUpdate }) => {
  const [users, setUsers] = useState([]);
  const [reviewData, setReviewData] = useState({
    reviewer_id: workflow?.reviewer_id || '',
    review_status: 'Pending',
    review_comments: '',
    validation_checklist: JSON.stringify({
      comp_selection_reviewed: false,
      adjustments_reviewed: false,
      valuation_parameters_reviewed: false,
      cap_rate_validated: false,
      financial_calculations_validated: false,
      overall_value_conclusion_approved: false
    })
  });
  const [checklistItems, setChecklistItems] = useState({
    comp_selection_reviewed: false,
    adjustments_reviewed: false,
    valuation_parameters_reviewed: false,
    cap_rate_validated: false,
    financial_calculations_validated: false,
    overall_value_conclusion_approved: false
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Fetch users for reviewer assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
    loadReviewData();
  }, []);
  
  // Load existing review data
  const loadReviewData = () => {
    try {
      // Check if workflow already has review data
      if (workflow && workflow.reviewer_id) {
        setReviewData(prev => ({ ...prev, reviewer_id: workflow.reviewer_id }));
      }
      
      // If property has valuations with review data
      if (property && property.valuations) {
        const valuations = JSON.parse(property.valuations);
        if (valuations.review_status) {
          setReviewData(prev => ({
            ...prev,
            review_status: valuations.review_status || 'Pending',
            review_comments: valuations.review_comments || ''
          }));
        }
        
        // Load checklist if available
        if (valuations.validation_checklist) {
          try {
            const checklist = JSON.parse(valuations.validation_checklist);
            setChecklistItems(checklist);
          } catch (e) {
            console.error('Error parsing validation checklist:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error loading review data:', error);
    }
  };
  
  // Handle reviewer selection
  const handleReviewerChange = (event) => {
    setReviewData({
      ...reviewData,
      reviewer_id: event.target.value
    });
  };
  
  // Handle review status change
  const handleStatusChange = (event) => {
    setReviewData({
      ...reviewData,
      review_status: event.target.value
    });
  };
  
  // Handle comments change
  const handleCommentsChange = (event) => {
    setReviewData({
      ...reviewData,
      review_comments: event.target.value
    });
  };
  
  // Handle checklist item toggle
  const handleChecklistToggle = (item) => {
    const updatedChecklist = {
      ...checklistItems,
      [item]: !checklistItems[item]
    };
    
    setChecklistItems(updatedChecklist);
    setReviewData({
      ...reviewData,
      validation_checklist: JSON.stringify(updatedChecklist)
    });
  };
  
  // Check if all checklist items are checked
  const allChecked = () => {
    return Object.values(checklistItems).every(value => value === true);
  };
  
  // Save review data
  const saveReviewData = async () => {
    try {
      // Update workflow with reviewer
      await axios.put(`/api/workflows/${workflow.id}`, {
        reviewer_id: reviewData.reviewer_id
      });
      
      // Update property valuations with review data
      const currentValuations = property.valuations ? JSON.parse(property.valuations) : {};
      const updatedValuations = {
        ...currentValuations,
        review_status: reviewData.review_status,
        review_comments: reviewData.review_comments,
        validation_checklist: reviewData.validation_checklist,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewData.reviewer_id
      };
      
      await axios.put(`/api/properties/${property.id}`, {
        valuations: JSON.stringify(updatedValuations)
      });
      
      if (onUpdate) onUpdate();
      if (onValidate) onValidate();
    } catch (error) {
      console.error('Error saving review data:', error);
    }
  };
  
  // Finalize review
  const finalizeReview = () => {
    // Check if all items are checked
    if (!allChecked()) {
      setDialogOpen(true);
      return;
    }
    
    // Set status to Approved and save
    setReviewData({
      ...reviewData,
      review_status: 'Approved'
    }, () => saveReviewData());
  };
  
  // Get reviewer name
  const getReviewerName = () => {
    const reviewer = users.find(user => user.id === parseInt(reviewData.reviewer_id));
    return reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Not assigned';
  };
  
  // Format property valuation details
  const getValuationDetails = () => {
    try {
      if (!property || !property.valuations) return {};
      
      const valuations = JSON.parse(property.valuations);
      
      return {
        estimatedValue: valuations.estimated_value || 'Not specified',
        capRate: valuations.cap_rate || 'Not specified',
        valuePerSF: valuations.value_per_sf || 'Not specified'
      };
    } catch (error) {
      console.error('Error parsing valuations:', error);
      return {};
    }
  };
  
  const valuationDetails = getValuationDetails();
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Review Stage</Typography>
      <Typography variant="body2" paragraph>
        In this stage, a reviewer will validate the valuation analysis and provide feedback.
      </Typography>
      
      {validationResults.issues.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {validationResults.issues.find(issue => issue.includes('reviewer')) || 
           'Please assign a reviewer and complete the review process.'}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Review Details</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="reviewer-label">Reviewer</InputLabel>
                    <Select
                      labelId="reviewer-label"
                      value={reviewData.reviewer_id}
                      onChange={handleReviewerChange}
                      label="Reviewer"
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {users.filter(user => user.role === 'Reviewer').map(user => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} - Reviewer
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="status-label">Review Status</InputLabel>
                    <Select
                      labelId="status-label"
                      value={reviewData.review_status}
                      onChange={handleStatusChange}
                      label="Review Status"
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Revisions Needed">Revisions Needed</MenuItem>
                      <MenuItem value="Approved">Approved</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Review Comments"
                    multiline
                    rows={4}
                    value={reviewData.review_comments}
                    onChange={handleCommentsChange}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<SaveIcon />}
                  onClick={saveReviewData}
                >
                  Save Review
                </Button>
                
                <Button 
                  variant="contained" 
                  color="success" 
                  startIcon={<CheckIcon />}
                  onClick={finalizeReview}
                  disabled={!reviewData.reviewer_id}
                >
                  Finalize Review
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Valuation Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Estimated Value</Typography>
                <Typography variant="body1">${valuationDetails.estimatedValue}</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Capitalization Rate</Typography>
                <Typography variant="body1">{valuationDetails.capRate}%</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Value per SF</Typography>
                <Typography variant="body1">${valuationDetails.valuePerSF}</Typography>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`Review Status: ${reviewData.review_status}`}
                  color={reviewData.review_status === 'Approved' ? 'success' : 
                         reviewData.review_status === 'Revisions Needed' ? 'error' : 'primary'}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Reviewer: {getReviewerName()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Validation Checklist</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={checklistItems.comp_selection_reviewed} 
                        onChange={() => handleChecklistToggle('comp_selection_reviewed')}
                      />
                    }
                    label="Comparable Selection Reviewed"
                  />
                </ListItem>
                
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={checklistItems.adjustments_reviewed} 
                        onChange={() => handleChecklistToggle('adjustments_reviewed')}
                      />
                    }
                    label="Adjustments Methodology Reviewed"
                  />
                </ListItem>
                
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={checklistItems.valuation_parameters_reviewed} 
                        onChange={() => handleChecklistToggle('valuation_parameters_reviewed')}
                      />
                    }
                    label="Valuation Parameters Reviewed"
                  />
                </ListItem>
                
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={checklistItems.cap_rate_validated} 
                        onChange={() => handleChecklistToggle('cap_rate_validated')}
                      />
                    }
                    label="Cap Rate Within Acceptable Range"
                  />
                </ListItem>
                
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={checklistItems.financial_calculations_validated} 
                        onChange={() => handleChecklistToggle('financial_calculations_validated')}
                      />
                    }
                    label="Financial Calculations Validated"
                  />
                </ListItem>
                
                <ListItem>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={checklistItems.overall_value_conclusion_approved} 
                        onChange={() => handleChecklistToggle('overall_value_conclusion_approved')}
                      />
                    }
                    label="Overall Value Conclusion Approved"
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={saveReviewData}
                >
                  Save Checklist
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Review Not Complete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Not all checklist items have been validated. Would you like to mark them as complete or continue reviewing?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Continue Reviewing</Button>
          <Button 
            onClick={() => {
              // Check all items
              const allChecked = Object.fromEntries(
                Object.keys(checklistItems).map(key => [key, true])
              );
              
              setChecklistItems(allChecked);
              setReviewData({
                ...reviewData,
                review_status: 'Approved',
                validation_checklist: JSON.stringify(allChecked)
              });
              
              setDialogOpen(false);
              
              // Save after state update
              setTimeout(saveReviewData, 0);
            }} 
            color="primary"
          >
            Mark All Complete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewStage;
