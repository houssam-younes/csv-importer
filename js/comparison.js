import { parseCsv } from "./parseCsv.js";
import { similarity } from "./distance.js";
import { databaseHeaders, userHeaderMappings } from "./file-constants.js";
import { setGlobalErrorMessage, clearGlobalErrorMessage } from './file-error.js'; // Adjust the path as needed
import { normalizeUserItemKeys, originalUserHeaders, setOriginalUserHeaders } from "./user-header-to-db-header.js";


// External variable for database items map
let databaseMap = new Map();
let simplifiedMap = new Map();
let userMap = new Map();

export function getUserMap() {
  return userMap;
}

// Function to set the database map
export function setDatabaseMap(databaseItems) {
  databaseMap.clear();
  simplifiedMap.clear();

  databaseItems.forEach(item => {
    // Adding to databaseMap
    databaseMap.set(item.scan_code, item);

    // Building simplifiedMap
    const simplifiedKey = simplifyString(item.item_name);
    if (!simplifiedMap.has(simplifiedKey)) {
      simplifiedMap.set(simplifiedKey, []);
    }
    simplifiedMap.get(simplifiedKey).push(item);
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

export async function compareCsvDataToDB(databaseCsv, userCsv) {
  // Initialize the database map
  setDatabaseMap(databaseCsv);
  const userItems = parseCsv(userCsv);

  let matchingItems = [databaseHeaders.join(",")];
  let partialMatches = [databaseHeaders.join(",")];
  
  const userHeaders = userItems.length > 0 ? Object.keys(userItems[0]) : [];
   // Extract and store original user headers
  //  setOriginalUserHeaders(userHeaders);
  //  originalUserHeaders = userItems.length > 0 ? Object.keys(userItems[0]) : [];
  let noMatches = [userHeaders.join(",")];

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

  await new Promise(resolve => {
    setTimeout(resolve, 2000); // Wait for 2 seconds
  });


  userItems.forEach((userItem) => {
    if (!userItem.scan_code) {
      const userItemCsv = objectToCsvString(userItem, userHeaders); // Use user headers here
      noMatches.push(userItemCsv);
      return;
    }
    userMap.set(userItem.scan_code, userItem);

    let userItemCsv = objectToCsvString(userItem, databaseHeaders);

    if (!findExactMatches(userItem, matchingItems, userItemCsv)) {
      if (
        !findPartialMatch(userItem, partialMatches, userItemCsv, databaseHeaders)
      ) {
        userItemCsv = objectToCsvString(userItem, userHeaders); 
        noMatches.push(userItemCsv);
      }
    }
  });

  return { matchingItems, partialMatches, noMatches };
}

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
function findExactMatches(userItem, matchingItems, userItemCsv) {
  const matchingItem = databaseMap.get(userItem.scan_code);
  if (matchingItem) {
    // matchingItems.push(
    //   { csv: userItemCsv, type: 'user', pair_id: pair_id },
    //   { csv: objectToCsvString(matchingItem, dbHeaders), type: 'db', pair_id: pair_id }
    // );
    matchingItems.push({ csv: userItemCsv, pair_id: matchingItem.scan_code });
    // matchingItems.push(userItemCsv, objectToCsvString(matchingItem, dbHeaders));
    return true;
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
    return true;
  }
  return false;
}

function findPartialMatch(userItem, partialMatches, userItemCsv, dbHeaders) {
  if (findSimplifiedPartialMatches(userItem, partialMatches, userItemCsv, dbHeaders)) {
    return true;
  }
  return findExhaustivePartialMatches(userItem, partialMatches, userItemCsv, dbHeaders);
}

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
export function objectToCsvString(obj, headers) {
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
}
