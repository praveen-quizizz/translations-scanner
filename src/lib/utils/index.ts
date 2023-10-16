import fs from 'fs';
import path from 'path';

export async function writeJSON(data: Record<string, any>, filePath: string) {
    try {
        // Convert the data to a JSON string
        const jsonData = JSON.stringify(data, null, 2);
        // Write the JSON data to the file
        fs.writeFileSync(filePath, jsonData, {
            flag: 'w+'
        });

        console.log('Data has been written to', filePath);
    } catch (error: any) {
        console.error('Error writing JSON data:', error.message);
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


export const tempDirPath = path.join(process.cwd(), 'tmp')