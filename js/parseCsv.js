import { normalizeHeader, setOriginalUserHeaders } from "./user-header-to-db-header.js";

//returns an array of objects mapped from csv data using the csv's headers
// export function parseCsv(csvData) {
//     const lines = csvData.trim().split("\n");
//     const headers = lines[0].split(",").map(header => header.trim());

//     return lines.slice(1).map(line => {
//         const values = line.split(",").map(value => value.trim());
//         return headers.reduce((obj, header, index) => {
//             obj[header] = values[index];
//             return obj;
//         }, {});
//     });
// }

//returns an array of objects mapped from csv data using the csv's mapped headers
export function parseCsv(csvData) {
    const lines = csvData.trim().split("\n");
    let headers = lines[0].split(",").map(header => header.trim());

    // Set original user headers before normalization
    setOriginalUserHeaders(headers);

    // Normalize headers
    headers = headers.map(header => normalizeHeader(header));

    return lines.slice(1).map(line => {
        const values = line.split(",").map(value => value.trim());
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });
}
