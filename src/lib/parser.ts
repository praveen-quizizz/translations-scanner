import { CustomHandlerFn, ParserOptionsBuilder } from "../builders/parser-options";
import { ScannerOptions } from "../builders/scanner-options";
import { Parser } from 'i18next-scanner';
import fs from "fs/promises";
import path from 'path';

export class TranslationScanner {
    private parser: any;
    private constFileData: any;
    private constFilePath: string;
    private customHandler: CustomHandlerFn | undefined;

    constructor(args: {
        options: Partial<ScannerOptions>,
        handler: CustomHandlerFn | undefined,
        constantsFile: string
    }) {
        this.parser = new Parser(args.options);
        this.customHandler = args.handler;
        this.constFilePath = args.constantsFile;
    }

    async init() {
        this.constFileData = await import(this.constFilePath);
    }

    private async getAllFilePaths(directoryPath: string) {
        let list: string[] = [];
        const files = await fs.readdir(directoryPath);
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const stats = await fs.stat(filePath);

            if (stats.isDirectory()) {
                const newFiles = await this.getAllFilePaths(filePath);
                list = [...list, ...newFiles];
            } else {
                list.push(filePath);
            }
        }
        return list;
    }

    private async parseContent(filePath: string) {
        const content = await fs.readFile(filePath);
        return this.parser.parseFuncFromString(content.toString(), this.customHandler);
    }

    async scan(baseDir: string) {
        try {
            const files = await this.getAllFilePaths(baseDir);
            const allScanPromises = files.map((file) => this.parseContent(file));
            const result = await Promise.all(allScanPromises);

            return result;
        } catch (error) {
            console.log(error)
        }
    }
}