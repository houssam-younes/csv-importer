export const RowTypes = {
  MATCHING: "matching",
  PARTIAL: "partial",
  NO_MATCH: "no-match",
};

export const RowSource = {
  USER: "user-row",
  DATABASE: "database-row",
  EXPORT: "export-row"
};

export const userHeaderMappings = {
  'scan_code': ['Scan Code', 'scan code', 'Scan_Code', 'ScanCode'],
  'item_name': ['Item Name', 'item name', 'Scan_Code', 'ItemName', 'Description'],
  'department': ['Department', 'Department # In register'],
  'cost': ['Cost'],
  'price': ['Price'],
};

export const databaseHeaders = [
  'scan_code',
  'item_name',
  'department',
  'cost',
  'price',
];

// Initialize CELL_INDICES to dynamically fill in indices
// example:
//CELL_INDICES = {
// price: 3,
// cost: 4
// };
export const CELL_INDICES = {};

databaseHeaders.forEach((columnName, columnIndex) => {
  CELL_INDICES[columnName] = columnIndex;
});


export const columnsForUpdate = [
  'cost',
  'price',
  'department'
];

// columnsForUpdate.forEach((columnName) => {
//   const columnIndex = databaseHeaders.indexOf(columnName);
//   if (columnIndex !== -1) {
//     CELL_INDICES[columnName] = columnIndex;
//   }
// });

