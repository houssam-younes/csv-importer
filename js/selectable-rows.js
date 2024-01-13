export function addSelectionOptionsToRows(index) {
    let selectionHtml = `
    <td>
      <input type="radio" name="selection${index}" value="db" id="db${index}">
      <label for="db${index}">DB</label>
      <input type="radio" name="selection${index}" value="user" id="user${index}">
      <label for="user${index}">User</label>
    </td>`;

    return selectionHtml;
  }
  


export function exportSelectedRows() {
    let csvContent = "data:text/csv;charset=utf-8,";
  
    // Loop through table rows
    document.querySelectorAll('.csvTable tr').forEach((row, index) => {
      if (index === 0) { // Header row
        csvContent += Array.from(row.children).slice(0, -2).map(e => `"${e.textContent}"`).join(",") + "\r\n";
      } else {
        const selected = row.querySelector('input[type="radio"]:checked');
        if (selected) {
          const selectedRowCells = Array.from(row.children).slice(0, -2).map(e => `"${e.textContent}"`);
          csvContent += selectedRowCells.join(",") + "\r\n";
        }
      }
    });
  
    // Download the CSV file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "selected_rows.csv");
    link.click(); // Trigger download
  }
  