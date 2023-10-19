import fs from 'fs';
import path from 'path';
import pretty from '../../logger/pretty';

export async function writeJSON(data: Record<string, any>, filePath: string) {
    try {
        // Convert the data to a JSON string
        const jsonData = JSON.stringify(data, null, 2);
        // Write the JSON data to the file
        fs.writeFileSync(filePath, jsonData, {
            flag: 'w+'
        });

        pretty.log('Data has been written to ' + filePath);
    } catch (error: any) {
        pretty.error('Error writing JSON data: ' + error.message);
    }
}


export function createTempDir() {
    try {
        if (fs.existsSync(tempDirPath)) {
            return;
        }

        fs.mkdirSync(tempDirPath);
    } catch (error) {
        console.error(error)
    }
}

// return objs in array1 not present in array2 based on the key argument
export function filterObjectsByKey<T>(
    array1: any[],
    array2: any[],
    key: string
): T[] {
    const array2Keys = new Set(array2.map((obj) => obj[key]));
    return array1.filter((obj) => !array2Keys.has(obj[key]));
}


export const tempDirPath = path.join(process.cwd(), 'tmp')

export function envk(key: string, def = null) {
    return process.env[key] || def;
  }