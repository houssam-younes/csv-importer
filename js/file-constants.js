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

//for header flexibility
export const userHeaderMappings = {
  'scan_code': ['Scan Code', 'scan code', 'Scan_Code', 'scan_code', 'scancode'],
  'item_name': ['Item Name', 'item name', 'itemname', 'description'],
  'department': ['Department', 'department', 'Department # In register', 'department # in register'],
  'cost': ['Cost', 'cost'],
  'price': ['Price', 'price'],
  'vendor_name': ['vendor name', 'vendor'],
  'modifier': ['modifier'],
  'units_per_case': ['units/case', 'units per case'],
  'tax_type_number': ['tax type # in register', 'tax type in register'],
  'is_food_stampable': ['is food stampable'],
  'current_inventory': ['current inventory'],
  'price_group_name': ['price group name'],
  'linked_item': ['linked item']
};

//what will be displayed, will be used in objToCsvString to keep same order
export const databaseHeaders = [
  'scan_code',
  'item_name',
  'department',
  'cost',
  'price',
];

// Define the headers that should be included in the exported CSV, along with their custom export names and default values.
//the key is the transformed header (normalized) see above
export const exportHeaders = {
  'scan_code': { exportName: 'Scan Code', defaultValue: null },
  'modifier': { exportName: 'Modifier', defaultValue: '0' },
  'item_name': { exportName: 'Description', defaultValue: null },
  'price': { exportName: 'Price', defaultValue: null },
  'cost': { exportName: 'Cost', defaultValue: null },
  'units_per_case': { exportName: 'Units/Case', defaultValue: '0' },
  'department': { exportName: 'Department # In register', defaultValue: '' },
  'tax_type_number': { exportName: 'Tax Type # in Register', defaultValue: '' },
  'is_food_stampable': { exportName: 'Is food stampable', defaultValue: '0' },
  'current_inventory': { exportName: 'Current Inventory', defaultValue: '0' },
  'price_group_name': { exportName: 'Price Group Name', defaultValue: '' },
  'vendor_name': { exportName: 'Vendor Name', defaultValue: '' },
  'linked_item': { exportName: 'Linked Item', defaultValue: '0' }
};




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



export const featureFlags = {
  showCostComparisons: false,
  showPercentages: false
};
