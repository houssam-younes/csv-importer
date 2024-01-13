export function jsonToCsv(jsonData) {
    if (!jsonData || !jsonData.length) return "";
    const headers = Object.keys(jsonData[0]);
    const csvRows = [headers.join(",")];
    jsonData.forEach(row => {
      const values = headers.map(header => row[header] ?? "");
      csvRows.push(values.join(","));
    });
    return csvRows.join("\n");
  }
  
  export function processCsvFile(file, databaseCsv, callback) {
    const reader = new FileReader();
    reader.onload = e => {
      const userCsvData = e.target.result;
      callback(databaseCsv, userCsvData);
    };
    reader.readAsText(file);
  }
  