function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('2026');
  const rows = sheet.getDataRange().getValues();
  // Remove header row
  const data = rows.slice(1).map(row => {
    return {
      code: row[0],
      name: row[1],
      holdings: row[2],
      cost: row[3],
      currentPrice: row[4],
      returnRate: row[5],
      strategy: row[6],
      warning: row[7],
      stopLoss: row[8],
      addPoint: row[9],
      tp1: row[10],
      tp2: row[11],
      notes: row[12],
      risk: row[13] || '',     // New Column: Risk Level
      advice: row[14] || '',    // New Column: Advice/Analysis
      targetPrice: row[15] || '' // New Column: Target Price
    };
  });
  
  return ContentService.createTextOutput(JSON.stringify({status: 'success', data: data}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Prevent manual execution error
  if (!e) {
      return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'No event object. Do not run doPost manually.'}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    let data = e.parameter;
    
    // Handle JSON body if present
    if (e.postData && e.postData.contents) {
        try {
           const jsonData = JSON.parse(e.postData.contents);
           // Merge JSON data into existing data object
           data = {...data, ...jsonData};
        } catch(err) {}
    }

    if (data.action === 'delete') {
      return doDelete(data.code);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('2026');
    
    // Append row
    // Columns: 0.代號, 1.名稱, 2.持倉, 3.成本, 4.現價, 5.報酬率, 6.策略, 7.警戒, 8.停損, 9.加碼, 10.停利1, 11.停利2, 12.備註, 13.風險, 14.建議, 15.目標價
    
    sheet.appendRow([
      data.code,
      data.name,
      data.holdings,
      data.cost,
      data.currentPrice,
      '', // Return Rate (let sheet calculate)
      data.strategy,
      data.warning,
      data.stopLoss,
      data.addPoint,
      data.tp1,
      data.tp2,
      data.notes,
      data.risk,    // New
      data.advice,   // New
      data.targetPrice // New
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Row added'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ... (existing code: doGet, doPost, doDelete) ... */

function doDelete(code) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('2026');
  const rows = sheet.getDataRange().getValues();
  
  // Find row index (1-based for deleteRow, but rows array is 0-based)
  // rows[i][0] is the code column
  let rowIndex = -1;
  
  // Start from 1 to skip header
  for (let i = 1; i < rows.length; i++) {
    // Loose comparison in case of string/number difference
    if (rows[i][0] == code) {
      rowIndex = i + 1; // Convert 0-based array index to 1-based sheet row number
      break;
    }
  }
  
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex);
    return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Deleted ' + code}))
      .setMimeType(ContentService.MimeType.JSON);
  } else {
     return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Code not found'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// -----------------------------------------------------------
// Run this function once from the Apps Script Editor to initialize
// 執行此函式可自動建立工作表與標題 (會自動新增目標價欄位)
// -----------------------------------------------------------
function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = '2026';
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  // Check if header exists
  const headers = [
    '代號', '名稱', '持倉', '成本', '現價', '報酬率', 
    '策略', '警戒', '停損', '加碼', '停利1', '停利2', 
    '備註', '風險', '建議', '目標價'
  ];
  
  // Update header row (will overwrite/expand)
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Freeze first row
  sheet.setFrozenRows(1);
  
  // Optional: Set some column widths
  sheet.setColumnWidth(1, 80);  // Code
  sheet.setColumnWidth(2, 120); // Name
  sheet.setColumnWidth(15, 200); // Advice
  
  Logger.log('Setup Complete! Sheet "2026" updated with Target Price column.');
}
