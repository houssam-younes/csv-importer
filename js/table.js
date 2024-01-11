import { databaseCsvHeaders } from "./main.js";

const RowTypes = {
  MATCHING: "matching",
  PARTIAL: "partial",
  NO_MATCH: "no-match",
};

function areHeadersMatching(userHeaders, dbHeaders) {
  // Compare the headers here and return true if they match, false otherwise
  return (
    userHeaders
      .split(",")
      .map((h) => h.trim())
      .join(",") === dbHeaders.join(",")
  );
}

export function createCsvTable(rows, type) {
  let table = '<table id="csvTable">';

  if (!areHeadersMatching(rows[0], databaseCsvHeaders)) {
    return "<p>Error: CSV headers do not match the database headers.</p>";
  }

  // Add table headers (assuming the first row contains headers)
  const headers = rows[0].split(",").map((header) => header.trim());
  const headerRow = headers.map((header) => `<th>${header}</th>`).join("");
  table += `<tr>${headerRow}</tr>`;

  function getRowClass(index, type) {
    if (type === RowTypes.NO_MATCH) {
      return "no-match-user-row";
    }
    return index % 2 === 0 ? `${type}-database-row` : `${type}-user-row`;
  }

  // Add each data row to the table
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].split(",").map((cell) => cell.trim());
    const rowClass = getRowClass(i, type);
    const rowHtml = cells.map((cell) => `<td>${cell}</td>`).join("");
    table += `<tr class="${rowClass}">${rowHtml}</tr>`;
  }

  table += "</table>";

  return table;
}

export function displayResults(matchingItems, partialMatches, noMatches) {
  // console.log("toggle displaying results");
  const matchingContent = document.querySelector(
    "#matchingItems .expandable-content .table-container"
  );
  const partialContent = document.querySelector(
    "#partialMatches .expandable-content .table-container"
  );
  const noMatchContent = document.querySelector(
    "#noMatches .expandable-content .table-container"
  );

  matchingContent.innerHTML = createCsvTable(matchingItems, RowTypes.MATCHING);
  partialContent.innerHTML = createCsvTable(partialMatches, RowTypes.PARTIAL);
  noMatchContent.innerHTML = createCsvTable(noMatches, RowTypes.NO_MATCH);

  document.querySelectorAll(".expandable-title").forEach((title) => {
    title.removeEventListener("click", toggleExpand);
    title.addEventListener("click", toggleExpand);
  });
}

function toggleExpand() {
  let content = this.nextElementSibling;
  // console.log(content.style.display);
  if (content.style.display === "none") {
    content.style.display = "block";
  } else {
    content.style.display = "none";
  }
}

// function objectsToCsvRows(objects) {
//     return objects.map(obj => {
//       return Object.values(obj).map(value => {
//         // Check if the value contains a comma, newline, or double-quote
//         if (value.includes(',') || value.includes('\n') || value.includes('"')) {
//           // If so, enclose the value in double quotes and escape existing quotes
//           return `"${value.replace(/"/g, '""')}"`;
//         }
//         return value;
//       }).join(',');
//     });
// }

export function clearCsvTable() {
  document.getElementById("csvDisplayArea").innerHTML = "";
}
