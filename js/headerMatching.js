// headerMatching.js
export function areHeadersMatching(userHeaders, dbHeaders) {
    const userHeadersArray = userHeaders.split(',').map(header => header.trim());
    return JSON.stringify(userHeadersArray) === JSON.stringify(dbHeaders);
}
