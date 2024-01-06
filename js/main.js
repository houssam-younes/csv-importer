import { displayResults, clearCsvTable } from './table.js';
import { compareCsvData } from './comparison.js';

let databaseCsv;
export let databaseCsvHeaders;

document.addEventListener('DOMContentLoaded', function() {

    fetch('/api/inventory')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const csvData = jsonToCsv(data);
        databaseCsv=csvData;
        // Assuming each row is an object with properties matching your table columns
        databaseCsvHeaders = Object.keys(data[0]);
        // console.log('headers '+databaseCsvHeaders);
        setupNavigation();
        // Process and display your data as needed
    })
    .catch(error => {
        console.error('Error fetching inventory:', error);
    });

    console.log('hi');

    // fetch('resources/csv/system-csv.csv')
    //     .then(response => response.text())
    //     .then(csv => {
    //         console.log('whats csv from file ',csv);
    //         databaseCsv = csv;
    //         // Extract headers
    //         databaseCsvHeaders = extractHeaders(csv);
    //         console.log('headers '+databaseCsvHeaders);
    //         setupNavigation();
    //         // loadPreviousState();
    //     });
});

// function jsonToCsv(jsonData) {
//     // Check if jsonData is not empty and is an array
//     if (!jsonData || !jsonData.length) {
//       return '';
//     }
  
//     // Extract headers
//     const headers = Object.keys(jsonData[0]);
//     const csvRows = [headers.join(',')]; // Create a string for headers
  
//     // Loop over the rows
//     for (const row of jsonData) {
//       const values = headers.map(header => {
//         const escaped = ('' + row[header]).replace(/"/g, '\\"'); // Escape double quotes
//         return `"${escaped}"`; // Wrap values in double quotes to handle commas and line breaks in values
//       });
//       csvRows.push(values.join(',')); // Create a string for each row
//     }
  
//     return csvRows.join('\n'); // Join rows with new line character to get CSV format
// }  

function jsonToCsv(jsonData) {
    if (!jsonData || !jsonData.length) {
      return '';
    }
  
    // Extract headers
    const headers = Object.keys(jsonData[0]);
    const csvRows = [headers.join(',')]; // Create a string for headers
  
    // Loop over the rows
    for (const row of jsonData) {
      const values = headers.map(header => {
        let field = row[header];
        if (field == null) field = ''; // Convert null or undefined to empty string
        return field; // Don't wrap the values in double quotes
      });
      csvRows.push(values.join(',')); // Create a string for each row
    }
  
    return csvRows.join('\n'); // Join rows with a newline to get CSV format
  }
  
  
function setupNavigation() {
    const importButton = document.getElementById('importCsvBtn');
    const fileInput = document.getElementById('csvFileInput');
    const backBtn = document.getElementById('backBtn');

    importButton.onclick = () => fileInput.click();
    fileInput.onchange = handleFileSelect;
    backBtn.onclick = () => {
        clearState();
        resetFileInput(fileInput);
        switchView('importView');
    };
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    // Show spinner and disable button
    toggleLoading(true);
    // await delay(500);

    const reader = new FileReader();
    reader.onload = (e) => {
        const userCsvData = e.target.result;
        // Split the userCsvData into an array of rows
        //const userCsvRows = userCsvData.split('\n');
        // Store user CSV data as JSON
        // localStorage.setItem('userCsvData', JSON.stringify(userCsvRows));

        // Perform comparison
        const { matchingItems, partialMatches, noMatches } = compareCsvData(databaseCsv, userCsvData);
        console.log('no matches ',noMatches);
        displayResults(matchingItems, partialMatches, noMatches);
        // Hide spinner and enable button
        toggleLoading(false);
        switchView('tableView');
    };
    reader.readAsText(file);
}

function toggleLoading(isLoading) {
    document.getElementById('importCsvBtn').disabled = isLoading;
    document.getElementById('spinner').style.display = isLoading ? 'block' : 'none';
}

function loadPreviousState() {
    const userCsvData = localStorage.getItem('userCsvData');
    if (userCsvData) {
        const { matchingItems, partialMatches, noMatches } = compareCsvData(databaseCsv, userCsvData);
        displayResults(matchingItems, partialMatches, noMatches);
        switchView('tableView');
    }
}

function switchView(viewId) {
    document.getElementById('importView').style.display = viewId === 'importView' ? 'block' : 'none';
    document.getElementById('tableView').style.display = viewId === 'tableView' ? 'flex' : 'none';
}

function resetFileInput(fileInput) {
    fileInput.value = '';
}

function extractHeaders(csv) {
    // Assuming the first line of the CSV contains the headers
    return csv.split('\n')[0].split(',').map(header => header.trim());
}

function clearState() {
    // localStorage.removeItem('userCsvData');
    clearCsvTable();
}