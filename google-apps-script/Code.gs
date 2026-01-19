function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length === 0) return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: [] })).setMimeType(ContentService.MimeType.JSON);

  var headers = data[0];
  var result = [];
  
  // Mapping for Chinese Headers to English Keys (for Frontend)
  var map = getHeaderMap(); 

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var header = headers[j];
      var key = map[header] || header; // Use mapped key or original
      obj[key] = row[j];
    }
    result.push(obj);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse parameters
    var params;
    if (e.postData && e.postData.contents && e.postData.type === 'application/json') {
       try {
         params = JSON.parse(e.postData.contents);
       } catch(z) {
         params = e.parameter;
       }
    } else {
       params = e.parameter;
    }
    
    var action = params.action;
    
    // --- FEATURE: Proxy Stock Price (TWSE & OTC) ---
    if (action === 'getPrice') {
       var code = params.code;

       function getPriceFromPrefix(prefix) {
            var url = "https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=" + prefix + "_" + code + ".tw&json=1&delay=0&_=" + new Date().getTime();
            try {
                var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
                var content = response.getContentText();
                var json = JSON.parse(content);
                if (json.msgArray && json.msgArray.length > 0) {
                    return json.msgArray[0];
                }
            } catch (e) {}
            return null;
       }

       // Try TSE first, then OTC
       var stock = getPriceFromPrefix('tse');
       if (!stock) stock = getPriceFromPrefix('otc');
       
        if (stock) {
           var price = stock.z; 
           if (price === '-') price = stock.y; 
           
           return ContentService.createTextOutput(JSON.stringify({ 
               status: 'success', 
               price: price, 
               name: stock.n 
           })).setMimeType(ContentService.MimeType.JSON);
       }
       return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Not found' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get headers and prepare reverse map (English Key -> Sheet Header)
    var dataRows = sheet.getDataRange().getValues();
    var headers = dataRows[0];
    var map = getHeaderMap(); // Chinese -> English
    var reverseMap = {};
    for(var k in map) { reverseMap[map[k]] = k; }

    // Helper to find column index by English Key
    function getColIndex(key) {
        var targetHeader = reverseMap[key] || key;
        return headers.indexOf(targetHeader);
    }
    var codeColIdx = getColIndex('code');
    if (codeColIdx === -1) codeColIdx = 0; 


    if (action === 'delete') {
      var code = params.code;

      for (var i = 1; i < dataRows.length; i++) {
        if (dataRows[i][codeColIdx] == code) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Deleted' })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Not found' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'update') {
      var updateData = params.data;
      if (typeof updateData === 'string') {
        try { updateData = JSON.parse(updateData); } catch(e) {}
      }

      var code = updateData.code;

      for (var i = 1; i < dataRows.length; i++) {
        if (dataRows[i][codeColIdx] == code) {
          // Found row, update columns
          for(var key in updateData) {
              var colIdx = getColIndex(key);
              if (colIdx !== -1) {
                  sheet.getRange(i + 1, colIdx + 1).setValue(updateData[key]);
              }
          }
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Updated' })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Not found' })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'create') {
        var newStrategy;
        if (params.data) {
            newStrategy = params.data;
            if (typeof newStrategy === 'string') { try { newStrategy = JSON.parse(newStrategy); } catch(e) {} }
        } else {
            return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Missing data' })).setMimeType(ContentService.MimeType.JSON);
        }

        // Check existing
        for (var i = 1; i < dataRows.length; i++) {
            if(dataRows[i][codeColIdx] == newStrategy.code) {
                return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Already exists' })).setMimeType(ContentService.MimeType.JSON);
            }
        }

        var newRow = [];
        for (var j = 0; j < headers.length; j++) {
            var header = headers[j];
            var key = map[header] || header; // Map Header -> Key
            newRow.push(newStrategy[key] || '');
        }

        sheet.appendRow(newRow);

        return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Created' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Default Fallback: Unknown Action
     return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown Action', received: action }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function getHeaderMap() {
  return {
    '代號': 'code',
    '名稱': 'name',
    '持倉': 'holdings',
    '成本': 'cost',
    '現價': 'currentPrice',
    '報酬率': 'returnRate',
    '策略': 'strategy',
    '警戒': 'warning',
    '停損': 'stopLoss',
    '加碼': 'addPoint',
    '停利1': 'tp1',
    '停利2': 'tp2',
    '目標價': 'targetPrice',
    '風險': 'risk',
    '建議': 'advice',
    '備註': 'notes'
  };
}
