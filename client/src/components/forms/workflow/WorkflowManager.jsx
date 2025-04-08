import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  Notes as NotesIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';

// Import workflow stage components
import RFPStage from './stages/RFPStage';
import BidStage from './stages/BidStage';
import ResearchStage from './stages/ResearchStage';
import AnalysisStage from './stages/AnalysisStage';
import ReviewStage from './stages/ReviewStage';
import DeliveryStage from './stages/DeliveryStage';

// Define workflow stages
const stages = ['RFP', 'Bid', 'Research', 'Analysis', 'Review', 'Delivery'];

const WorkflowManager = () => {
  const { propertyId, workflowId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [validationResults, setValidationResults] = useState({ passed: false, issues: [] });
  const [property, setProperty] = useState(null);
  const [noteDialog, setNoteDialog] = useState({ open: false, note: '' });
  
  // Map stage names to components
  const stageComponents = {
    RFP: RFPStage,
    Bid: BidStage,
    Research: ResearchStage,
    Analysis: AnalysisStage,
    Review: ReviewStage,
    Delivery: DeliveryStage
  };
  
  // Helper function to get active step index
  const getActiveStepIndex = () => {
    if (!activeWorkflow) return 0;
    return stages.indexOf(activeWorkflow.current_stage);
  };
  
  // Fetch workflow data
  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/workflows/${workflowId}`);
      setActiveWorkflow(response.data);
      
      // Also fetch property data
      const propertyResponse = await axios.get(`/api/properties/${response.data.property_id}`);
      setProperty(propertyResponse.data);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load workflow data. ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };
  
  // Validate current stage
  const validateCurrentStage = async () => {
    try {
      const response = await axios.get(`/api/workflows/${workflowId}/validate`);
      setValidationResults(response.data);
      return response.data;
    } catch (err) {
      setError('Validation failed. ' + (err.response?.data?.message || err.message));
      return { passed: false, issues: [err.message] };
    }
  };
  
  // Advance to next stage
  const advanceToNextStage = async () => {
    try {
      // Validate first
      const validation = await validateCurrentStage();
      
      if (!validation.passed) {
        setSnackbar({
          open: true,
          message: 'Cannot advance stage. Please address validation issues.',
          severity: 'error'
        });
        return;
      }
      
      // If validation passes, advance the stage
      const response = await axios.post(`/api/workflows/${workflowId}/advance`);
      
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: 'success'
      });
      
      // Refresh workflow data
      fetchWorkflow();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to advance stage. ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    }
  };
  
  // Add a note to the current stage
  const addNote = async () => {
    try {
      if (!noteDialog.note.trim()) {
        setSnackbar({
          open: true,
          message: 'Note cannot be empty.',
          severity: 'warning'
        });
        return;
      }
      
      await axios.post(`/api/workflows/${workflowId}/notes`, {
        note: noteDialog.note
      });
      
      setSnackbar({
        open: true,
        message: 'Note added successfully.',
        severity: 'success'
      });
      
      // Close dialog and reset note
      setNoteDialog({ open: false, note: '' });
      
      // Refresh workflow data
      fetchWorkflow();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to add note. ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
    } else if (propertyId) {
      // If only propertyId is provided, navigate to create new workflow
      setProperty({ id: propertyId });
      setLoading(false);
    }
  }, [workflowId, propertyId]);
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Render current stage component
  const renderStageComponent = () => {
    if (!activeWorkflow || !property) return null;
    
    const StageComponent = stageComponents[activeWorkflow.current_stage];
    return (
      <StageComponent 
        workflow={activeWorkflow} 
        property={property}
        validationResults={validationResults}
        onValidate={validateCurrentStage}
        onUpdate={fetchWorkflow}
      />
    );
  };
  
  // Render notes list
  const renderNotes = () => {
    if (!activeWorkflow) return null;
    
    try {
      const stageNotes = JSON.parse(activeWorkflow.stage_notes || '{}')[activeWorkflow.current_stage] || [];
      
      if (stageNotes.length === 0) {
        return <Typography variant="body2" color="textSecondary">No notes for this stage.</Typography>;
      }
      
      return stageNotes.map((note, index) => (
        <Box key={index} mb={1}>
          <Typography variant="body2" component="div">
            {note.content}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Added on {new Date(note.created_at).toLocaleDateString()}
          </Typography>
          <Divider sx={{ my: 1 }} />
        </Box>
      ));
    } catch (e) {
      return <Typography color="error">Error loading notes.</Typography>;
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {activeWorkflow ? 
            `Workflow: ${activeWorkflow.name}` : 
            'Create New Valuation Workflow'}
        </Typography>
        
        <Stepper activeStep={getActiveStepIndex()} alternativeLabel sx={{ mt: 3, mb: 4 }}>
          {stages.map((label, index) => {
            // If we have an active workflow, check if this stage is completed
            let completed = false;
            if (activeWorkflow) {
              try {
                const stageCompletion = JSON.parse(activeWorkflow.stage_completion || '{}');
                completed = stageCompletion[label]?.completed || false;
              } catch (e) {}
            }
            
            return (
              <Step key={label} completed={completed}>
                <StepLabel>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {renderStageComponent()}
            
            {activeWorkflow && (
              <Box mt={3} display="flex" justifyContent="space-between">
                <Button 
                  variant="outlined" 
                  onClick={validateCurrentStage} 
                  startIcon={<CheckCircleIcon />}
                >
                  Validate Stage
                </Button>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={advanceToNextStage} 
                  disabled={getActiveStepIndex() >= stages.length - 1 || !validationResults.passed}
                  endIcon={<ArrowForwardIcon />}
                >
                  Advance to Next Stage
                </Button>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            {activeWorkflow && (
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Stage Notes
                    </Typography>
                    <IconButton 
                      color="primary" 
                      onClick={() => setNoteDialog({ open: true, note: '' })}
                      size="small"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  {renderNotes()}
                </CardContent>
              </Card>
            )}
            
            {validationResults.issues.length > 0 && (
              <Card sx={{ mt: 2, bgcolor: '#fff8e1' }}>
                <CardContent>
                  <Typography variant="h6" color="warning.main" display="flex" alignItems="center">
                    <WarningIcon sx={{ mr: 1 }} />
                    Validation Issues
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box component="ul" sx={{ pl: 2 }}>
                    {validationResults.issues.map((issue, index) => (
                      <Typography component="li" key={index} variant="body2">
                        {issue}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Note Dialog */}
      <Dialog open={noteDialog.open} onClose={() => setNoteDialog({ ...noteDialog, open: false })}>        
        <DialogTitle>Add Note to {activeWorkflow?.current_stage} Stage</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            rows={4}
            value={noteDialog.note}
            onChange={(e) => setNoteDialog({ ...noteDialog, note: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialog({ ...noteDialog, open: false })} color="primary">
            Cancel
          </Button>
          <Button onClick={addNote} color="primary" variant="contained">
            Add Note
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for messages */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkflowManager;
