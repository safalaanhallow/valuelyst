const XLSX = require('xlsx');
const path = require('path');

console.log('Starting Excel file test...');

try {
  // Read the Excel file
  const filePath = path.join(__dirname, '../Sales.xlsx');
  console.log('Looking for Sales.xlsx at:', filePath);
  
  if (!require('fs').existsSync(filePath)) {
    console.error(`Sales.xlsx file not found at ${filePath}`);
    process.exit(1);
  }
  
  console.log('File exists, reading...');
  const workbook = XLSX.readFile(filePath);
  console.log('Workbook loaded, sheet names:', workbook.SheetNames);
  
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet);
  console.log(`Found ${data.length} rows in Excel file`);
  
  if (data.length > 0) {
    console.log('First row:', data[0]);
    console.log('Column headers:', Object.keys(data[0]));
  }
  
} catch (error) {
  console.error('Error reading Excel file:', error);
}
