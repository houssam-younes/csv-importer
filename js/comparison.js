import { parseCsv } from "./parseCsv.js";
import { similarity } from "./distance.js";

// External variable for database items map
let databaseMap = new Map();
let simplifiedMap = new Map();

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

// export function setDatabaseMap(databaseItems) {
//   //   const databaseItems = parseCsv(databaseObj);
//   databaseMap = new Map(databaseItems.map((item) => [item.scan_code, item]));
// }

function simplifyString(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function buildSimplifiedMap(databaseItems) {
  const map = new Map();
  databaseItems.forEach(item => {
    const key = simplifyString(item.item_name);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  });
  return map;
}

export function compareCsvDataToDB(databaseCsv, userCsv) {
  // Initialize the database map
  setDatabaseMap(databaseCsv);
  console.log('done and set');
  // const simplifiedMap = buildSimplifiedMap([...databaseMap.values()]);

  const userItems = parseCsv(userCsv);
  const userCsvLines = userCsv.trim().split("\n");


  const dbHeaders =
    databaseMap.size > 0 ? Object.keys([...databaseMap.values()][0]) : [];
  const userHeaders = userCsvLines[0]
    ? userCsvLines[0].split(",").map((header) => header.trim())
    : [];

  let matchingItems = [dbHeaders.join(",")];
  let partialMatches = [dbHeaders.join(",")];
  let noMatches = [userHeaders.join(",")];

  userItems.forEach((userItem) => {
    const userItemCsv = objectToCsvString(userItem, dbHeaders);

    if (!findExactMatches(userItem, matchingItems, userItemCsv, dbHeaders)) {
      // console.log('started search partial');
      if (
        // !findPartialMatches(userItem, partialMatches, userItemCsv, dbHeaders)
        !findPartialMatch(userItem, partialMatches, userItemCsv, dbHeaders)
      ) {
          noMatches.push(userItemCsv); // Handle no matches
      }
    }
  });

  return { matchingItems, partialMatches, noMatches };
}

// Function to find exact matches
function findExactMatches(userItem, matchingItems, userItemCsv, dbHeaders) {
  const matchingItem = databaseMap.get(userItem.scan_code);
  if (matchingItem) {
    matchingItems.push(userItemCsv, objectToCsvString(matchingItem, dbHeaders));
    return true;
  }
  return false;
}

function findSimplifiedPartialMatches(userItem, partialMatches, userItemCsv, dbHeaders) {
  const simplifiedUserItemName = simplifyString(userItem.item_name);
  const potentialMatches = simplifiedMap.get(simplifiedUserItemName) || [];
  // console.log('potential matches');
  // console.log(potentialMatches);
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
    partialMatches.push(userItemCsv, objectToCsvString(bestMatch, dbHeaders));
    console.log('found partial match for '+simplifiedUserItemName);
    return true;
  }
  return false;
}


function findExhaustivePartialMatches(userItem, partialMatches, userItemCsv, dbHeaders) {
  let bestMatch = null;
  let highestScore = 0;

  for (let dbItem of databaseMap.values()) {
    const score = similarity(userItem.item_name.trim().toLowerCase(), dbItem.item_name.trim().toLowerCase());
    if (score>=0.9){
      console.log('www greater than 0.9 can continue '+userItem.item_name.trim().toLowerCase());
      partialMatches.push(userItemCsv, objectToCsvString(dbItem, dbHeaders));
      return true;
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = dbItem;
    }
  }

  if (bestMatch && highestScore >= 0.7) {
    partialMatches.push(userItemCsv, objectToCsvString(bestMatch, dbHeaders));
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
function findPartialMatches(userItem, partialMatches, userItemCsv, dbHeaders) {

  const simplifiedMap = buildSimplifiedMap(databaseItems);
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

  const userDescription = userItem.item_name
    ? userItem.item_name.trim().toLowerCase()
    : "";
  for (let dbItem of databaseMap.values()) {
    const dbDescription = dbItem.item_name
      ? dbItem.item_name.trim().toLowerCase()
      : "";
    if (similarity(userDescription, dbDescription) >= 0.7) {
      // 70% similarity
      partialMatches.push(userItemCsv, objectToCsvString(dbItem, dbHeaders));
      return true;
    }
  }
  return false;
}

// Function to convert object to CSV string
function objectToCsvString(obj, headers) {
  return headers
    .map((header) => {
      const value = obj[header] ? obj[header].toString() : "";
      if (value.includes(",") || value.includes("\n") || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    })
    .join(",");
}

// export function compareCsvDataToDB2(databaseCsv, userCsv) {
//   // Assume parseCsv returns an array of objects and the first row contains headers

//   //   const { databaseMap, userItems, dbHeaders, userHeaders } =
//   //     initializeMapsAndHeaders(databaseCsv, userCsv);

//   console.log("db csv ", databaseCsv);
//   const databaseItems = databaseCsv;
//   console.log("whats databaseitems ", databaseItems);
//   const userItems = parseCsv(userCsv);
//   const userCsvLines = userCsv.trim().split("\n");

//   const dbHeaders = Object.keys(databaseItems[0]);
//   const userHeaders =
//     userCsvLines.length > 0
//       ? userCsvLines[0].split(",").map((header) => header.trim())
//       : [];
//   let matchingItems = [dbHeaders.join(",")];
//   let partialMatches = [dbHeaders.join(",")];
//   // Use original headers from user CSV
//   let noMatches = [userHeaders.join(",")];

//   console.log("comparing");

//   userItems.forEach((userItem) => {
//     const userItemCsv = objectToCsvString(userItem, dbHeaders);

//     //const matchingItem = databaseItems.find(dbItem => dbItem['Item Code'] === userItem['Item Code']);
//     const matchingItem = databaseItems.find(
//       (dbItem) => dbItem["scan_code"] == userItem["scan_code"]
//     );
//     if (matchingItem) {
//       const dbItemCsv = objectToCsvString(matchingItem, dbHeaders);
//       matchingItems.push(dbItemCsv, userItemCsv);
//     } else {
//       // Perform a case-insensitive partial match for descriptions
//       const userDescription = userItem["item_name"]
//         ? userItem["item_name"].trim().toLowerCase()
//         : "";
//       let isPartialMatchFound = false;

//       if (userDescription) {
//         const partialMatch = databaseItems.find((dbItem) => {
//           // return dbDescription.includes(userDescription) || userDescription.includes(dbDescription);
//           //const dbDescription = dbItem['Description'] ? dbItem['Description'].trim().toLowerCase() : "";
//           const dbDescription = dbItem["item_name"]
//             ? dbItem["item_name"].trim().toLowerCase()
//             : "";
//           return similarity(userDescription, dbDescription) >= 0.7; // 70% similarity
//         });

//         if (partialMatch) {
//           const partialMatchCsv = objectToCsvString(partialMatch, dbHeaders);
//           partialMatches.push(partialMatchCsv, userItemCsv);
//           isPartialMatchFound = true;
//         }
//       }
//       if (!isPartialMatchFound) {
//         noMatches.push(userItemCsv);
//       }
//     }
//   });
//   console.log("done comparing");

//   return { matchingItems, partialMatches, noMatches };
// }

// export function compareCsvData(databaseCsv, userCsv) {
//   // Assume parseCsv returns an array of objects and the first row contains headers
//   const databaseItems = parseCsv(databaseCsv);
//   console.log("whats databaseitems ", databaseItems);
//   const userItems = parseCsv(userCsv);
//   const userCsvLines = userCsv.trim().split("\n");

//   const dbHeaders = Object.keys(databaseItems[0]);
//   const userHeaders =
//     userCsvLines.length > 0
//       ? userCsvLines[0].split(",").map((header) => header.trim())
//       : [];
//   let matchingItems = [dbHeaders.join(",")];
//   let partialMatches = [dbHeaders.join(",")];
//   // Use original headers from user CSV
//   let noMatches = [userHeaders.join(",")];

//   userItems.forEach((userItem) => {
//     const userItemCsv = objectToCsvString(userItem, dbHeaders);

//     //const matchingItem = databaseItems.find(dbItem => dbItem['Item Code'] === userItem['Item Code']);
//     const matchingItem = databaseItems.find(
//       (dbItem) => dbItem["scan_code"] == userItem["scan_code"]
//     );
//     if (matchingItem) {
//       const dbItemCsv = objectToCsvString(matchingItem, dbHeaders);
//       matchingItems.push(dbItemCsv, userItemCsv);
//     } else {
//       // Perform a case-insensitive partial match for descriptions
//       const userDescription = userItem["item_name"]
//         ? userItem["item_name"].trim().toLowerCase()
//         : "";
//       let isPartialMatchFound = false;

//       if (userDescription) {
//         const partialMatch = databaseItems.find((dbItem) => {
//           // return dbDescription.includes(userDescription) || userDescription.includes(dbDescription);
//           //const dbDescription = dbItem['Description'] ? dbItem['Description'].trim().toLowerCase() : "";
//           const dbDescription = dbItem["item_name"]
//             ? dbItem["item_name"].trim().toLowerCase()
//             : "";
//           return similarity(userDescription, dbDescription) >= 0.7; // 70% similarity
//         });

//         if (partialMatch) {
//           const partialMatchCsv = objectToCsvString(partialMatch, dbHeaders);
//           partialMatches.push(partialMatchCsv, userItemCsv);
//           isPartialMatchFound = true;
//         }
//       }
//       if (!isPartialMatchFound) {
//         noMatches.push(userItemCsv);
//       }
//     }
//   });

//   return { matchingItems, partialMatches, noMatches };
// }

// function objectToCsvString2(obj, headers) {
//   // Convert object to CSV string, ensuring to handle commas, newlines, and quotes
//   return headers
//     .map((header) => {
//       const value = obj[header] ? obj[header].toString() : "";
//       if (value.includes(",") || value.includes("\n") || value.includes('"')) {
//         return `"${value.replace(/"/g, '""')}"`;
//       }
//       return value;
//     })
//     .join(",");
// }

// function isPartialMatch(desc1, desc2) {
//     // Basic partial match logic
//     console.log('desc1 '+desc1);
//     console.log('desc 2 '+desc2);
//     return desc1.includes(desc2) || desc2.includes(desc1);
// }
