import { userHeaderMappings } from "../file-constants.js";

export let originalUserHeaders = [];

export function setOriginalUserHeaders(headers) {
    originalUserHeaders = headers;
}

// Function to normalize a single header
export function normalizeHeader(header) {
    let lowerCaseHeader = header.toLowerCase();
    for (const dbHeader in userHeaderMappings) {
        if (userHeaderMappings[dbHeader].includes(lowerCaseHeader)) {
            return dbHeader; // Return the database header that matches the user header
        }
    }
    return header; // Return the original header if no match is found
}

// Function to normalize all headers in an item
export function normalizeUserItemKeys(userItem, userHeaders) {
    let normalizedItem = {};
    userHeaders.forEach(header => {
        const normalizedHeader = normalizeHeader(header);
        normalizedItem[normalizedHeader] = userItem[header];
    });
    return normalizedItem;
}
