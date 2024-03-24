import { normalizeHeader, setOriginalUserHeaders } from "./user-header-to-db-header.js";

//returns an array of objects mapped from csv data using the csv's mapped headers
/**
 * Parses CSV data into an array of objects with properties mapped from CSV headers.
 * Each object represents a row in the CSV data, taking into account that fields
 * might contain commas and thus be enclosed in double quotes.
 * 
 * @param {string} csvData - The raw CSV data as a single string.
 * @returns {Object[]} An array of objects, each representing a row from the CSV data.
 */
export function parseCsv(csvData) {
    const lines = csvData.trim().split("\n");
    //let headers = lines[0].split(",").map(header => header.trim());
    let headers = parseLine(lines[0]);

    // Set original user headers before normalization
    setOriginalUserHeaders(headers);

    // Normalize headers
    headers = headers.map(header => normalizeHeader(header));

    return lines.slice(1).map(line => {
        const values = parseLine(line);
        return headers.reduce((obj, header, index) => {
            // If the normalized header is 'scan_code', call logScanCode
            if (header === 'scan_code') {
                obj[header] = formatAsUPCText(values[index]);
            }
            else {
                obj[header] = values[index];
            }
            return obj;
        }, {});
    });
}

/**
 * Parses a single line of CSV data, taking into account fields that may be enclosed
 * in double quotes, which could contain commas. The function aims to be more readable
 * and intuitive, avoiding complex regex patterns for clarity.
 * 
 * @param {string} line - A single line of CSV data.
 * @returns {string[]} An array of values extracted from the line, correctly handling
 * commas within quoted fields.
 */
function parseLine(line) {
    const values = [];
    let currentField = '';
    let inQuotes = false;

    // Iterate through each character in the line
    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        // Toggle inQuotes status on encountering a quote
        if (char === '"') {
            inQuotes = !inQuotes;
            continue; // Move to the next character
        }

        // If it's a comma and we're not within quotes, it's a field delimiter
        if (char === ',' && !inQuotes) {
            // Push the currentField value to values array and reset currentField
            values.push(currentField);
            currentField = '';
        } else {
            // Otherwise, add the character to the currentField
            currentField += char;
        }
    }

    // Add the last field to values array
    values.push(currentField);

    return values.map(field => field.trim()); // Trim whitespace around each field
}

/**
 * Converts a numeric value to a string ensuring it's in standard decimal notation.
 * This function is particularly useful for numeric values like UPC codes that may
 * be mistakenly converted to scientific notation.
 * 
 */
function formatAsUPCText(value) {
    // If it's a number or a string that looks like a number, format it.
    if (!isNaN(value)) {
        let stringValue = value.toString();
        // Convert the string to uppercase and check if it contains 'E' (scientific notation)
        if (stringValue.toUpperCase().indexOf('E') !== -1) {
            // Convert the number to its fixed-point notation string with up to 20 decimal places
            let fixedNotationString = Number(value).toFixed(15);

            // Remove any trailing zeros and the decimal point, if it results in an integer value
            stringValue = fixedNotationString.replace(/\.?0+$/, "");

        }
        return stringValue;
    }
    // If it's not a numeric value, return it as is.
    return value;
}
