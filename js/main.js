import { displayResults, clearCsvTable } from './table.js';
import { compareCsvData } from './comparison.js';

let databaseCsv;
export let databaseCsvHeaders;

document.addEventListener('DOMContentLoaded', function() {
    fetch('resources/csv/system-csv.csv')
        .then(response => response.text())
        .then(csv => {
            databaseCsv = csv;
            // Extract headers
            databaseCsvHeaders = extractHeaders(csv);
            console.log('headers '+databaseCsvHeaders);
            setupNavigation();
            // loadPreviousState();
        });
});

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
    await delay(500);

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