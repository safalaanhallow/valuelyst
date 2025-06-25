const XLSX = require('xlsx');
const path = require('path');

try {
  console.log('📁 Checking Excel file...');
  const filePath = path.join(__dirname, '..', 'Sales.xlsx');
  console.log('File path:', filePath);
  
  const workbook = XLSX.readFile(filePath);
  console.log('Sheet names:', workbook.SheetNames);
  
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('Column headers:', data[0]);
  console.log('First data row:', data[1]);
  console.log('Total rows:', data.length);
  
} catch (error) {
  console.error('Error:', error.message);
}
