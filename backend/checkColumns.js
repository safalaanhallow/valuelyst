const XLSX = require('xlsx');
const path = require('path');

try {
  const filePath = path.join(__dirname, '..', 'Sales.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Get header row
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  console.log('=== COLUMN HEADERS ===');
  data[0].forEach((header, index) => {
    if (header) {
      console.log(`${index}: "${header}"`);
    }
  });
  
  console.log('\n=== FIRST DATA ROW ===');
  data[1].forEach((value, index) => {
    if (data[0][index]) {
      console.log(`${data[0][index]}: ${value}`);
    }
  });
  
} catch (error) {
  console.error('Error:', error.message);
}
