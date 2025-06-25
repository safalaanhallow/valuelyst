const XLSX = require('xlsx');
const path = require('path');

function checkExcelColumns() {
  try {
    console.log('🔍 Checking columns in Sales.xlsx...\n');
    
    const filePath = path.join(__dirname, '..', 'Sales.xlsx');
    console.log('📁 Reading file:', filePath);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get the first row to see column headers
    const data = XLSX.utils.sheet_to_json(worksheet, { range: 0 });
    
    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('📋 Available columns in Sales.xlsx:');
      columns.forEach((col, i) => {
        console.log(`   ${i+1}. "${col}"`);
      });
      
      console.log('\n🔍 Looking for parcel-related columns:');
      const parcelColumns = columns.filter(col => 
        col.toLowerCase().includes('parcel') ||
        col.toLowerCase().includes('apn') ||
        col.toLowerCase().includes('pin') ||
        col.toLowerCase().includes('id') ||
        col.toLowerCase().includes('number')
      );
      
      if (parcelColumns.length > 0) {
        console.log('✅ Found potential parcel/ID columns:');
        parcelColumns.forEach(col => console.log(`   - "${col}"`));
      } else {
        console.log('❌ No obvious parcel/ID columns found');
      }
      
      // Show sample data for first few rows
      console.log('\n📊 Sample data (first 2 rows):');
      data.slice(0, 2).forEach((row, i) => {
        console.log(`\n   Row ${i+1}:`);
        Object.keys(row).forEach(key => {
          const value = row[key];
          if (value !== null && value !== undefined && value !== '') {
            console.log(`     ${key}: ${value}`);
          }
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error reading Excel file:', error.message);
  }
}

checkExcelColumns();
