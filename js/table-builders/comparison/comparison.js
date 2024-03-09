import { parseCsv } from "../../csv-file-helpers/parseCsv.js";
import { similarity } from "./distance.js";
import { databaseHeaders, userHeaderMappings } from "../../file-constants.js";
import { setGlobalErrorMessage, clearGlobalErrorMessage } from '../../csv-file-helpers/file-error.js'; // Adjust the path as needed
import { normalizeUserItemKeys, originalUserHeaders, setOriginalUserHeaders } from "../../csv-file-helpers/user-header-to-db-header.js";
import { incrementMatchingTotals, incrementPartialMatchTotals } from './price-comparison.js';

// External variable for database items map
let databaseMap = new Map();
let simplifiedMap = new Map();
let userMap = new Map();
export let exportRowsMap = new Map();

// Define a unique Symbol for the selection status
export const isSelectedKey = Symbol('isSelected');

export function getExportRowsMap() {
  return exportRowsMap;
}
export function clearExportRowsMap() {
  exportRowsMap = new Map();
}

export function getUserMap() {
  return userMap;
}

// Function to add items to exportRowMap with selection status
function addToExportRowsMap(userItem) {
  // Clone userItem to avoid modifying the original object
  const userItemWithSelection = { ...userItem };

  // Check if the ID already exists in exportRowsMap
  if (exportRowsMap.has(userItem.scan_code)) {
    console.warn("Duplicate Scan Code detected: " + userItem.scan_code);
  }

  // Use the Symbol as a key for the selection status
  //userItemWithSelection[isSelectedKey] = false;
  userItemWithSelection[isSelectedKey] = true;

  // Store the modified item in exportRowMap
  exportRowsMap.set(userItem.scan_code, userItemWithSelection);
}

// Function to toggle the selection status of a row in exportRowMap
export function toggleSelection(scan_code) {
  if (exportRowsMap.has(scan_code)) {
    const userItem = exportRowsMap.get(scan_code);
    // Toggle the selection status using the Symbol key
    userItem[isSelectedKey] = !userItem[isSelectedKey];
  }
}

function prepareForExport3() {
  const exportData = [];

  exportRowMap.forEach((userItem) => {
    const itemForExport = {};

    // Copy all string-keyed properties
    for (const key in userItem) {
      if (userItem.hasOwnProperty(key)) {
        itemForExport[key] = userItem[key];
      }
    }

    // Optionally, explicitly skip Symbol-keyed properties (for clarity)
    const symbolKeys = Object.getOwnPropertySymbols(userItem);
    symbolKeys.forEach((symbolKey) => {
      delete itemForExport[symbolKey];
    });

    exportData.push(itemForExport);
  });

  return exportData;
}

// Function to set the database map
// export function setDatabaseMap(databaseItems) {
//   databaseMap.clear();
//   simplifiedMap.clear();

//   databaseItems.forEach(item => {
//     // Adding to databaseMap
//     databaseMap.set(item.scan_code, item);

//     // Building simplifiedMap
//     const simplifiedKey = simplifyString(item.item_name);
//     if (!simplifiedMap.has(simplifiedKey)) {
//       simplifiedMap.set(simplifiedKey, []);
//     }
//     simplifiedMap.get(simplifiedKey).push(item);
//   });
// }

/**
 * Clears and sets the global database map with items from the database.
 * Items with scan codes shorter than 6 characters are still added to the databaseMap,
 * but not to the simplifiedMap used for scan code prefix matching.
 * @param {Array} databaseItems - An array of item objects from the database.
 */
export function setDatabaseMap(databaseItems) {
  databaseMap.clear();
  simplifiedMap.clear();

  databaseItems.forEach(item => {
    // Ensure all items are added to the database map
    databaseMap.set(item.scan_code, item);

    // Add items to simplifiedMap if their scan codes are at least 6 characters long
    if (item.scan_code.length >= 6) {
      const scanCodePrefix = item.scan_code.substring(0, 6);
      if (!simplifiedMap.has(scanCodePrefix)) {
        simplifiedMap.set(scanCodePrefix, []);
      }
      simplifiedMap.get(scanCodePrefix).push(item);
    }
  });
}


export function getDatabaseMap() {
  return databaseMap;
}

// export function setDatabaseMap(databaseItems) {
//   //   const databaseItems = parseCsv(databaseObj);
//   databaseMap = new Map(databaseItems.map((item) => [item.scan_code, item]));
// }

function simplifyString(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

// function buildSimplifiedMap(databaseItems) {
//   const map = new Map();
//   databaseItems.forEach(item => {
//     const key = simplifyString(item.item_name);
//     if (!map.has(key)) {
//       map.set(key, []);
//     }
//     map.get(key).push(item);
//   });
//   return map;
// }

/**
 * Compares user-uploaded CSV data against a pre-existing database to categorize each item as an exact match,
 * partial match, or no match based on the item's scan code. This process includes checking for header
 * compatibility and handling items without scan codes explicitly. Each user item is processed individually,
 * ensuring robustness through internal error handling.
 * 
 * @param {any} databaseCsv - A string containing the database items in CSV format.
 * @param {string} userCsv - A string containing the user-uploaded items in CSV format.
 * @returns {Object} An object containing arrays for exact matches, partial matches, and no matches, each including CSV headers.
 * 
 * @async
 */
export async function compareCsvDataToDB(databaseCsv, userCsv) {
  // Initialize the database map
  setDatabaseMap(databaseCsv);
  const userItems = parseCsv(userCsv);

  const headerStringFirstEntry = [databaseHeaders.join(",")];

  let matchingItems = [...headerStringFirstEntry];
  let partialMatches = [...headerStringFirstEntry];
  let noMatches = [...headerStringFirstEntry];

  const userHeaders = userItems.length > 0 ? Object.keys(userItems[0]) : [];

  // Check if any user header matches the database headers
  const anyHeaderMatches = databaseHeaders.some(header => userHeaders.includes(header));

  // If no header matches, set a global error message
  if (!anyHeaderMatches) {
    setGlobalErrorMessage("Headers do not match database headers.");
  } else {
    // If some headers match, check for missing headers and list them if any
    const missingHeaders = databaseHeaders.filter(header => !userHeaders.includes(header));
    if (missingHeaders.length > 0) {
      const errorMessage = `Missing required headers: ${missingHeaders.join(', ')}`;
      setGlobalErrorMessage(errorMessage);
    } else {
      clearGlobalErrorMessage(); // Clear any previous error message if all headers are correct
    }
  }

  // Iterate through user items to determine match status
  userItems.forEach((userItem) => {
    try {
      const userItemCsv = objectToCsvString(userItem, databaseHeaders);

      if (!userItem.scan_code) {
        // If the item lacks a scan_code, directly classify as no match
        noMatches.push(userItemCsv);
        return;
      }
      userMap.set(userItem.scan_code, userItem); // Track each user item
      addToExportRowsMap(userItem); // Prepare each item for potential export
      // Attempt to find an exact match; if not found, then attempt to find a partial match
      if (!findExactMatches(userItem, matchingItems, userItemCsv)) {
        if (!findPartialMatch(userItem, partialMatches, userItemCsv, databaseHeaders)) {
          // If no matches found, add to noMatches
          noMatches.push(userItemCsv);
        }
      }
    } catch (error) {
      console.error("Error processing user item:", error, { userItem });
      // Optionally handle the error, e.g., by adding the item to a separate error list
    }
  });

  console.log('User export map:', exportRowsMap);

  return { matchingItems, partialMatches, noMatches };
}


// export async function compareCsvDataToDB(databaseCsv, userCsv) {
//   // Initialize the database map
//   setDatabaseMap(databaseCsv);
//   const userItems = parseCsv(userCsv);

//   const headerStringFirstEntry = [databaseHeaders.join(",")];

//   // let commonHeaders = [databaseHeaders.join(",")];
//   let matchingItems = [...headerStringFirstEntry];
//   let partialMatches = [...headerStringFirstEntry];
//   let noMatches = [...headerStringFirstEntry];

//   const userHeaders = userItems.length > 0 ? Object.keys(userItems[0]) : [];
//   // Extract and store original user headers
//   //  setOriginalUserHeaders(userHeaders);
//   //  originalUserHeaders = userItems.length > 0 ? Object.keys(userItems[0]) : [];
//   // let noMatches = [userHeaders.join(",")];

//   // Check if any user header matches the database headers
//   const anyHeaderMatches = databaseHeaders.some(header => userHeaders.includes(header));

//   // If no header matches, set a global error message
//   if (!anyHeaderMatches) {
//     setGlobalErrorMessage("Headers do not match database headers.");
//   } else {
//     // If some headers match, check for missing headers and list them if any
//     const missingHeaders = databaseHeaders.filter(header => !userHeaders.includes(header));
//     if (missingHeaders.length > 0) {
//       const errorMessage = `Missing required headers: ${missingHeaders.join(', ')}`;
//       setGlobalErrorMessage(errorMessage);
//     } else {
//       clearGlobalErrorMessage(); // Clear any previous error message if all headers are correct
//     }
//   }


//   userItems.forEach((userItem) => {
//     if (!userItem.scan_code) {
//       //const userItemCsv = objectToCsvString(userItem, userHeaders); // Use user headers here
//       const userItemCsv = objectToCsvString(userItem, databaseHeaders); // Use user headers here
//       noMatches.push(userItemCsv);
//       return;
//     }
//     userMap.set(userItem.scan_code, userItem);
//     addToExportRowsMap(userItem);

//     let userItemCsv = objectToCsvString(userItem, databaseHeaders);

//     if (!findExactMatches(userItem, matchingItems, userItemCsv)) {
//       if (
//         !findPartialMatch(userItem, partialMatches, userItemCsv, databaseHeaders)
//       ) {
//         userItemCsv = objectToCsvString(userItem, databaseHeaders);
//         //userItemCsv = objectToCsvString(userItem, userHeaders); 
//         noMatches.push(userItemCsv);
//       }
//     }
//   });

//   console.log('whats user export map');
//   console.log(exportRowsMap);

//   return { matchingItems, partialMatches, noMatches };
// }

function displayErrorMessage(errorMessage) {
  // Remove existing error message, if any
  const existingError = document.getElementById('errorContainer');
  if (existingError) {
    existingError.parentNode.removeChild(existingError);
  }

  // Create and insert the new error message
  const errorContainer = document.createElement('div');
  errorContainer.setAttribute('id', 'errorContainer');
  errorContainer.style.color = 'red';
  errorContainer.style.fontWeight = 'bold';
  errorContainer.style.marginTop = '20px';
  errorContainer.innerHTML = `<span style="color: red;">⚠️</span> ${errorMessage}`;

  const mainElement = document.querySelector('main');
  mainElement.insertBefore(errorContainer, mainElement.firstChild); // Insert at the top of the main element
}

// Function to find exact matches
// function findExactMatches(userItem, matchingItems, userItemCsv) {
//   const matchingItem = databaseMap.get(userItem.scan_code);
//   if (matchingItem) {
//     // matchingItems.push(
//     //   { csv: userItemCsv, type: 'user', pair_id: pair_id },
//     //   { csv: objectToCsvString(matchingItem, dbHeaders), type: 'db', pair_id: pair_id }
//     // );
//     matchingItems.push({ csv: userItemCsv, pair_id: matchingItem.scan_code });
//     incrementMatchingTotals(matchingItem, userItem);
//     // matchingItems.push(userItemCsv, objectToCsvString(matchingItem, dbHeaders));
//     return true;
//   }
//   return false;
// }

/**
 * Attempts to find an exact match for a user item in the database based on scan code.
 * Adds the match to the provided array if found.
 * @param {Object} userItem - The user item being checked.
 * @param {Array} matchingItems - Array to append to if an exact match is found.
 * @param {String} userItemCsv - CSV string representation of the user item.
 * @returns {Boolean} True if an exact match is found, otherwise false. Returns false also on error.
 */
function findExactMatches(userItem, matchingItems, userItemCsv) {
  try {
    const matchingItem = databaseMap.get(userItem.scan_code);
    if (matchingItem) {
      matchingItems.push({ csv: userItemCsv, pair_id: matchingItem.scan_code });
      incrementMatchingTotals(matchingItem, userItem);
      return true;
    }
  } catch (error) {
    console.error("Error finding exact match for item:", userItem, error);
  }
  return false;
}

/**
 * Attempts to find a partial match for a user item in the database based on the first 6 digits of the scan code.
 * Adds the first found match to the provided array if found.
 * @param {Object} userItem - The user item being checked.
 * @param {Array} partialMatches - Array to append to if a partial match is found.
 * @param {String} userItemCsv - CSV string representation of the user item.
 * @param {Array} dbHeaders - Array of database headers (unused in this function but included for signature consistency).
 * @returns {Boolean} True if a partial match is found, otherwise false. Returns false also on error.
 */
function findPartialMatch(userItem, partialMatches, userItemCsv, dbHeaders) {
  try {
    const scanCodePrefix = userItem.scan_code.substring(0, 6);
    const potentialMatches = simplifiedMap.get(scanCodePrefix);

    if (potentialMatches && potentialMatches.length > 0) {
      for (const dbItem of potentialMatches) {
        if (dbItem.scan_code.startsWith(scanCodePrefix)) {
          partialMatches.push({ csv: userItemCsv, pair_id: dbItem.scan_code });
          incrementPartialMatchTotals(dbItem, userItem);
          return true; // Early return on first match found
        }
      }
    }
  } catch (error) {
    console.error("Error finding partial match for item:", userItem, error);
  }
  return false;
}


function findSimplifiedPartialMatches(userItem, partialMatches, userItemCsv) {
  const simplifiedUserItemName = simplifyString(userItem.item_name);
  const potentialMatches = simplifiedMap.get(simplifiedUserItemName) || [];
  let bestMatch = null;
  let highestScore = 0;

  potentialMatches.forEach(dbItem => {
    const score = similarity(userItem.item_name, dbItem.item_name);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = dbItem;
    }
  });

  if (bestMatch && highestScore >= 0.7) {
    partialMatches.push({ csv: userItemCsv, pair_id: bestMatch.scan_code });
    //partialMatches.push(userItemCsv, objectToCsvString(bestMatch, dbHeaders));
    incrementPartialMatchTotals(bestMatch, userItem);
    return true;
  }
  return false;
}


function findExhaustivePartialMatches(userItem, partialMatches, userItemCsv) {
  let bestMatch = null;
  let highestScore = 0;

  for (let dbItem of databaseMap.values()) {
    const score = similarity(userItem.item_name.trim().toLowerCase(), dbItem.item_name.trim().toLowerCase());
    if (score >= 0.9) {
      partialMatches.push({ csv: userItemCsv, pair_id: bestMatch.scan_code });
      return true;
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = dbItem;
    }
  }

  if (bestMatch && highestScore >= 0.7) {
    partialMatches.push({ csv: userItemCsv, pair_id: bestMatch.scan_code });
    // partialMatches.push(userItemCsv, objectToCsvString(bestMatch, dbHeaders));
    // partialMatches.push(userItemCsv, objectToCsvString(bestMatch, dbHeaders));
    incrementPartialMatchTotals(bestMatch, userItem);
    return true;
  }
  return false;
}

// function findPartialMatch(userItem, partialMatches, userItemCsv, dbHeaders) {
//   let isPartialMatchFound = false;
//   isPartialMatchFound = findSimplifiedPartialMatches(userItem, partialMatches, userItemCsv, dbHeaders);
//   if (!isPartialMatchFound) {
//     isPartialMatchFound = findExhaustivePartialMatches(userItem, partialMatches, userItemCsv, dbHeaders);
//   }
//   return isPartialMatchFound;
//   // if (findSimplifiedPartialMatches(userItem, partialMatches, userItemCsv, dbHeaders)) {
//   //   isPartialMatchFound = true;
//   // }
//   // else if (findExhaustivePartialMatches(userItem, partialMatches, userItemCsv, dbHeaders)) {
//   //   isPartialMatchFound = true;
//   // }
//   // if (isPartialMatchFound) {
//   //   incrementPartialMatchTotals(parseFloat(bestMatch.price), parseFloat(userItem.price));
//   // }
//   // return isPartialMatchFound;
// }

// Function to find partial matches
// function findPartialMatches(userItem, partialMatches, userItemCsv, dbHeaders) {

//   const simplifiedMap = buildSimplifiedMap(databaseItems);
//   const simplifiedUserItemName = simplifyString(userItem.item_name);
//   const potentialMatches = simplifiedMap.get(simplifiedUserItemName) || [];
//   let bestMatch = null;
//   let highestScore = 0;

//   potentialMatches.forEach(dbItem => {
//     const score = similarity(userItem.item_name, dbItem.item_name);
//     if (score > highestScore) {
//       highestScore = score;
//       bestMatch = dbItem;
//     }
//   });

//   const userDescription = userItem.item_name
//     ? userItem.item_name.trim().toLowerCase()
//     : "";
//   for (let dbItem of databaseMap.values()) {
//     const dbDescription = dbItem.item_name
//       ? dbItem.item_name.trim().toLowerCase()
//       : "";
//     if (similarity(userDescription, dbDescription) >= 0.7) {
//       // 70% similarity
//       return true;
//     }
//   }
//   return false;
// }

// Function to convert object to CSV string
//uses db headers mostly
export function objectToCsvString(obj, headers) {
  try {
    // Create an empty array to store the CSV values
    const csvValues = [];

    // Iterate through each header
    for (const header of headers) {
      // Retrieve the corresponding value from the object, using a ternary operator for conciseness
      const value = obj[header] ? obj[header].toString() : "";

      // Check if the value needs quoting
      if (value.includes(",") || value.includes("\n") || value.includes('"')) {
        // Quote the value and escape any existing double quotes
        csvValues.push(`"${value.replace(/"/g, '""')}"`);
      } else {
        // Add the value without quotes
        csvValues.push(value);
      }
    }

    // Join the CSV values with commas and return the string
    return csvValues.join(",");
  } catch (error) {
    console.warn("Error converting object to CSV string:", error, { obj, headers });
    return '';
  }
}
