import { CustomHandlerFn } from "../builders/parser-options";
import { ScannerOptions } from "../builders/scanner-options";
import { Parser } from 'i18next-scanner';
import fs from "fs/promises";
import * as fsSync from 'fs';
import path from 'path';
import { ISourceString, createSourceStringObj, defaultHandler } from "./handlers";
import { createTempDir, tempDirPath, writeJSON } from "./utils";

export class TranslationScanner {
    private parser: any;
    private constFileData: any;
    private constFilePath: string;
    private customHandler: CustomHandlerFn | undefined;
    private keyCountMap: Record<string, number> = {};

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
        createTempDir();
    }

    parseContentAsync(filePath: string) {
        return new Promise((resolve, reject) => {
            const content = fsSync.readFileSync(filePath, 'utf-8');
            const allPriorityKeys = Object.keys(this.constFileData);
            const allSourceStringsFound: unknown[] = [];
            this.parser.parseFuncFromString(content.toString(), (key: string, opts: Record<string, any>) => {
                if (allPriorityKeys.includes(key)) {
                    const e = Error(`\nKey: '${key}' is already defined in '${this.constFilePath}'\nRemove '${key}' from '${filePath}'\n`);
                    console.log(e.message);
                    return;
                }
                this.keyCountMap[key] = this.keyCountMap[key] ? this.keyCountMap[key] + 1 : 1;
                if(this.keyCountMap[key] > 1) {
                    console.log(`Ignoring adding key - '${key}' to resource store '${key}' is already registered`);
                    return;
                }
                const argsToUse = allPriorityKeys.includes(key) ? this.constFileData[key] : opts;
                const sourceString = createSourceStringObj(key, argsToUse);
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

    async extractMethodsStrings(baseDir: string) {
        const files = await this.getAllFilePaths(baseDir);

        const allScanPromises: any[] = [];

        files.forEach(path => {
            allScanPromises.push(this.parseContentAsync(path));
        });
        let sourceStrings = await Promise.all(allScanPromises);
        sourceStrings = sourceStrings.filter(arr => arr.length);
        return sourceStrings;
    }

    async extractTemplateStrings(baseDir: string) {
        throw Error('Not implemented');
    }

    async extractSourceStringsFromConstantFile() {
        let sourceStrings: ISourceString[] = [];
        Object.keys(this.constFileData).forEach(key => {
            const sourceString = createSourceStringObj(key, this.constFileData[key]);
            this.parser.set(key, sourceString.defaultValue);
            sourceStrings.push(sourceString);
        })
        sourceStrings = sourceStrings.flat();
        return sourceStrings;
    }

    async scan(baseDir: string) {
        try {
            const sourceStrings = [
                ...(await this.extractMethodsStrings(baseDir)),
                ...(await this.extractSourceStringsFromConstantFile())
            ].flat();

            writeJSON(sourceStrings, path.join(tempDirPath, 'sourceStrings.json'));

            console.log(this.keyCountMap)
            return sourceStrings;

        } catch (error) {
            console.log(error)
        }
    }

    getResourceStore() {
        return this.parser.get();
    }
}