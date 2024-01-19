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
  'vendor',
  'cost',
  'price',
];

export const CELL_INDICES = {
  price: 5, // Assuming the 'price' cell is usually at index 5
  cost: 4
  // ... other cell indices
};