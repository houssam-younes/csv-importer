import { setGlobalErrorMessage } from "../../csv-file-helpers/file-error.js";

/**
 * Array to store duplicate scan codes.
 * @type {string[]}
 */
export let duplicateScanCodes = [];

/**
 * Adds a scan code to the duplicate scan codes array if it's not already included.
 * @param {string} scanCode The scan code to add.
 */
export function addDuplicateScanCode(scanCode) {
    if (!duplicateScanCodes.includes(scanCode)) {
        duplicateScanCodes.push(scanCode);
        console.warn(`Duplicate Scan Code detected: ${scanCode}`);
    }
}

/**
 * Clears the duplicate scan codes array.
 */
export function clearDuplicateScanCodes() {
    duplicateScanCodes = [];
}

/**
 * Sets a global error message with the list of duplicate scan codes and then clears the array.
 */
export function showDuplicateScanCodesErrorMessage() {
    if (duplicateScanCodes.length > 0) {
        setGlobalErrorMessage("Duplicate Scan Codes detected: " + duplicateScanCodes.join(', ') + ".<br> Please resolve to ensure count statistics are accurate.");
    }
    //clearDuplicateScanCodes();
}