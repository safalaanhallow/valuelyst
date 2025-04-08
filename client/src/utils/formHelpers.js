/**
 * Form helper functions for field name management and change handling
 */

/**
 * Creates a helper function for generating fully qualified field names with a prefix
 * @param {string} prefix - The prefix to add to field names (e.g., 'zoning', 'environmental')
 * @returns {Function} - A function that takes a field name and returns the prefixed name
 */
export const createFieldNameHelper = (prefix) => {
  return (name) => `${prefix}.${name}`;
};

/**
 * Creates a handleChange function that wraps formik's handleChange
 * @param {Object} formik - The formik object
 * @returns {Function} - A function that handles form field changes
 */
export const createChangeHandler = (formik) => {
  return (e) => {
    formik.handleChange(e);
  };
};

/**
 * Creates a setFieldValue function that wraps formik's setFieldValue
 * @param {Object} formik - The formik object
 * @param {string} prefix - Optional prefix to add to field names
 * @returns {Function} - A function that sets field values
 */
export const createSetFieldValueHandler = (formik, prefix = '') => {
  return (name, value) => {
    const fieldName = prefix ? `${prefix}.${name}` : name;
    formik.setFieldValue(fieldName, value);
  };
};

/**
 * Helper to safely get nested values from formik object
 * @param {Object} formik - The formik object 
 * @param {string} path - Dot notation path to the value
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} - The value at the path or defaultValue
 */
export const getNestedValue = (formik, path, defaultValue = '') => {
  const parts = path.split('.');
  let current = formik.values;
  
  for (const part of parts) {
    if (current == null) return defaultValue;
    current = current[part];
  }
  
  return current !== undefined ? current : defaultValue;
};
