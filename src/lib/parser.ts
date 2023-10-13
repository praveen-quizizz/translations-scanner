import { CustomHandlerFn } from "../builders/parser-options";
import { ScannerOptions } from "../builders/scanner-options";
import { Parser } from 'i18next-scanner';
import fs from "fs/promises";
import * as fsSync from 'fs';
import path, { resolve } from 'path';
import { createSourceStringObj, defaultHandler } from "./handlers";

export class TranslationScanner {
    private parser: any;
    private constFileData: any;
    private constFilePath: string;
    private customHandler: CustomHandlerFn | undefined;

    constructor(args: {
        options: Partial<ScannerOptions>,
        handler?: CustomHandlerFn | undefined,
        constantsFile: string
    }) {
        this.parser = new Parser(args.options);
        this.customHandler = args.handler ?? defaultHandler;
        this.constFilePath = args.constantsFile;
    }

    async init() {
        const module = await import(this.constFilePath);
        this.constFileData = module.default
    }

    parseContentAsync(filePath: string) {
        return new Promise((resolve, reject) => {
            const content = fsSync.readFileSync(filePath, 'utf-8');
            const allPriorityKeys = Object.keys(this.constFileData);
            const allSourceStringsFound: unknown[] = [];
            this.parser.parseFuncFromString(content.toString(), {dynamicSupportedOptions: true}, (key: string, opts: Record<string, any>) => {
                if(allPriorityKeys.includes(key)) {
                    console.error(`Key: ${key} is already defined in constants file.`);
                    return
                    // reject(new Error(`Key: ${key} is already defined in constants file.`))
                    // throw new Error(`Key: ${key} is already defined in constants file.`)
                }
                const sourceString = createSourceStringObj(key, opts);
                console.log("🚀 ~ file: parser.ts:43 ~ TranslationScanner ~ this.parser.parseFuncFromString ~ sourceString:", key, opts)
                allSourceStringsFound.push(sourceString)
                this.parser.set(key, sourceString.defaultValue);
            });
            resolve(allSourceStringsFound);
        }); 
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

    async scan(baseDir: string) {
        try {
            const files = await this.getAllFilePaths(baseDir);
            
            const allScanPromises: any[] = [];
            files.forEach(path => {
                 allScanPromises.push(this.parseContentAsync(path));
            });
            let sourceStrings = await Promise.all(allScanPromises);
            sourceStrings = sourceStrings.filter(arr => arr.length);
            console.log("Resource Store ", this.parser.get())
            return sourceStrings.flat();

        } catch (error) {
            console.log(error)
        }
    }
}