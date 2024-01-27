export const RowTypes = {
  MATCHING: "matching",
  PARTIAL: "partial",
  NO_MATCH: "no-match",
};

export const RowSource = {
  USER: "user-row",
  DATABASE: "database-row",
};

export const databaseHeaders = [
  'scan_code',
  'item_name',
  'department',
  'cost',
  'price',
];

export const columnsForUpdate = [
  'cost',
  'price',
  'department'
];

// Calculate cell indices for 'price' and 'cost' during module initialization
export const CELL_INDICES = {
  price: null,
  cost: null
};

columnsForUpdate.forEach((columnName) => {
  const columnIndex = databaseHeaders.indexOf(columnName);
  if (columnIndex !== -1) {
    CELL_INDICES[columnName] = columnIndex;
  }
});