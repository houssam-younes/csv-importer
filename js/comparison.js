import { parseCsv } from "./parseCsv.js";
import { similarity } from "./distance.js";
import { databaseHeaders } from "./file-constants.js";

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

export function compareCsvDataToDB(databaseCsv, userCsv) {
  // Initialize the database map
  setDatabaseMap(databaseCsv);
  // const simplifiedMap = buildSimplifiedMap([...databaseMap.values()]);

  const userItems = parseCsv(userCsv);
  //userMap=userItems;

  // const dbHeaders =
  // databaseMap.size > 0 ? Object.keys([...databaseMap.values()][0]) : [];

  const dbHeaders = databaseHeaders;


  // const userHeaders = userCsvLines[0]
  // ? userCsvLines[0].split(",").map((header) => header.trim())
  // : [];

  // let matchingItems = [dbHeaders.join(",")];
  // let partialMatches = [dbHeaders.join(",")];
  // let noMatches = [userHeaders.join(",")];

  let matchingItems = [databaseHeaders.join(",")];
  let partialMatches = [databaseHeaders.join(",")];
  let noMatches = [databaseHeaders.join(",")];

  userItems.forEach((userItem) => {
    if (!userItem.scan_code) {
      return;
    }
    userMap.set(userItem.scan_code, userItem);

    const userItemCsv = objectToCsvString(userItem, dbHeaders);

    if (!findExactMatches(userItem, matchingItems, userItemCsv, dbHeaders)) {
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
