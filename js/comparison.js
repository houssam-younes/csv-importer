import { parseCsv } from './parseCsv.js';
import { similarity } from './distance.js';

export function compareCsvData(databaseCsv, userCsv) {
    // Assume parseCsv returns an array of objects and the first row contains headers
    const databaseItems = parseCsv(databaseCsv);
    const userItems = parseCsv(userCsv);
    const userCsvLines = userCsv.trim().split("\n");

    const dbHeaders = Object.keys(databaseItems[0]);
    const userHeaders = userCsvLines.length > 0 ? userCsvLines[0].split(",").map(header => header.trim()) : [];
    let matchingItems = [dbHeaders.join(',')];
    let partialMatches = [dbHeaders.join(',')];
     // Use original headers from user CSV
    let noMatches = [userHeaders.join(',')];

    userItems.forEach(userItem => {
        const userItemCsv = objectToCsvString(userItem, dbHeaders);

        //const matchingItem = databaseItems.find(dbItem => dbItem['Item Code'] === userItem['Item Code']);
        const matchingItem = databaseItems.find(dbItem => dbItem['scan_code'] == userItem['scan_code']);
        if (matchingItem) {
            const dbItemCsv = objectToCsvString(matchingItem, dbHeaders);
            matchingItems.push(dbItemCsv, userItemCsv);
        } else {
            // Perform a case-insensitive partial match for descriptions
            const userDescription = userItem['item_name'] ? userItem['item_name'].trim().toLowerCase() : "";
            let isPartialMatchFound = false;
        
            if (userDescription) {
                const partialMatch = databaseItems.find(dbItem => {
                    // return dbDescription.includes(userDescription) || userDescription.includes(dbDescription);
                    //const dbDescription = dbItem['Description'] ? dbItem['Description'].trim().toLowerCase() : "";
                    const dbDescription = dbItem['item_name'] ? dbItem['item_name'].trim().toLowerCase() : "";
                    return similarity(userDescription, dbDescription) >= 0.7;// 70% similarity
                });
        
                if (partialMatch) {
                    const partialMatchCsv = objectToCsvString(partialMatch, dbHeaders);
                    partialMatches.push(partialMatchCsv, userItemCsv);
                    isPartialMatchFound = true;
                }
            }
            if (!isPartialMatchFound) {
                noMatches.push(userItemCsv);
            }
        }
    });

    return { matchingItems, partialMatches, noMatches };
}

function objectToCsvString(obj, headers) {
    // Convert object to CSV string, ensuring to handle commas, newlines, and quotes
    return headers.map(header => {
        const value = obj[header] ? obj[header].toString() : "";
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }).join(',');
}

// function isPartialMatch(desc1, desc2) {
//     // Basic partial match logic
//     console.log('desc1 '+desc1);
//     console.log('desc 2 '+desc2);
//     return desc1.includes(desc2) || desc2.includes(desc1);
// }


