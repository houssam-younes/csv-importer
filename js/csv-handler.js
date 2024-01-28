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
  
  // export function processCsvFile(file, databaseCsv, callback) {
  //   const reader = new FileReader();
  //   reader.onload = e => {
  //     const userCsvData = e.target.result;
  //     // Check if the CSV content is comma-separated
  //     if (!userCsvData.includes(",")) {
  //       throw new Error("The CSV file is not comma-separated.");
  //     }
  //     // If the file is valid, proceed with the callback
  //     callback(databaseCsv, userCsvData);
  //   };
  //   reader.onerror = () => {
  //     throw new Error('Failed to read the file, make sure to use comma separated csv fie.');
  //   };
  //   reader.readAsText(file);
  // }
  
  // Refactor to return a Promise
export function processCsvFile(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
          const userCsvData = e.target.result;
          if (!userCsvData.includes(",")) {
              reject(new Error("The CSV file is not comma-separated."));
          } else {
              // If valid, resolve the Promise with the CSV data
              resolve(userCsvData);
          }
      };
      reader.onerror = () => {
          reject(new Error('Failed to read the file.'));
      };
      reader.readAsText(file);
  });
}