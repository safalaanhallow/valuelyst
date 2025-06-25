import React, { createContext, useState, useEffect, useContext } from 'react';

const AppraisalContext = createContext();

export const useAppraisal = () => useContext(AppraisalContext);

export const AppraisalProvider = ({ children }) => {
  const [subjectProperty, setSubjectProperty] = useState(() => {
    try {
      const saved = localStorage.getItem('subjectProperty');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to parse subjectProperty from localStorage', error);
      return null;
    }
  });

  // Validate the subjectProperty structure on initial load to handle legacy data formats.
  useEffect(() => {
    if (subjectProperty && !subjectProperty.identification) {
      console.warn('Legacy subjectProperty format detected. Resetting appraisal state.');
      resetAppraisal();
    }
  }, []); // Run only once on component mount

  const [selectedComps, setSelectedComps] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedComps');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to parse selectedComps from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      if (subjectProperty) {
        localStorage.setItem('subjectProperty', JSON.stringify(subjectProperty));
      } else {
        localStorage.removeItem('subjectProperty');
      }
    } catch (error) {
      console.error('Failed to save subjectProperty to localStorage', error);
    }
  }, [subjectProperty]);

  useEffect(() => {
    try {
      localStorage.setItem('selectedComps', JSON.stringify(selectedComps));
    } catch (error) {
      console.error('Failed to save selectedComps to localStorage', error);
    }
  }, [selectedComps]);

  const addComparable = (comp) => {
    // Check for duplicates using the correct property path
    const propertyId = comp.property?.id || comp.id;
    if (!selectedComps.some(c => (c.property?.id || c.id) === propertyId)) {
      setSelectedComps(prevComps => [...prevComps, comp]);
    } else {
      console.warn('Comparable property already exists:', propertyId);
    }
  };

  const removeComparable = (identifier) => {
    if (typeof identifier === 'number') {
      // Remove by index (used in the UI)
      setSelectedComps(prevComps => prevComps.filter((_, index) => index !== identifier));
    } else {
      // Remove by property ID (fallback)
      setSelectedComps(prevComps => prevComps.filter(c => (c.property?.id || c.id) !== identifier));
    }
  };

  const resetAppraisal = () => {
    setSubjectProperty(null);
    setSelectedComps([]);
    localStorage.removeItem('subjectProperty');
    localStorage.removeItem('selectedComps');
  };

  const value = {
    subjectProperty,
    setSubjectProperty,
    selectedComps,
    addComparable,
    removeComparable,
    resetAppraisal,
    setSelectedComps
  };

  return (
    <AppraisalContext.Provider value={value}>
      {children}
    </AppraisalContext.Provider>
  );
};
