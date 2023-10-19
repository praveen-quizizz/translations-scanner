import { CustomHandlerFn } from "../builders/parser-options";
import { ScannerOptions } from "../builders/scanner-options";
import { Parser } from 'i18next-scanner';
import fs from "fs/promises";
import * as fsSync from 'fs';
import path from 'path';
import { ISourceString, createSourceStringObj, defaultHandler } from "./handlers";
import { createTempDir, envk, filterObjectsByKey, tempDirPath, writeJSON } from "./utils";
import { batchCreateOrUpdateSourceString, createSourceFile, getAllLanguages, getAllSourceStringBySourceFileId, getAllSourceStrings, getSourceFileByName } from "../client/api";
import pretty from "../logger/pretty";
import { TRANSLATION_FILE_URL_KEY } from "../client/constants";

export class TranslationScanner {
    private parser: any;
    private constFileData: any;
    private constFilePath: string;
    private customHandler: CustomHandlerFn | undefined;
    private keyCountMap: Record<string, number> = {};
    private sourceFile: Record<string, any> = {};

    constructor(args: {
        options: Partial<ScannerOptions>,
        handler?: CustomHandlerFn | undefined,
        constantsFile: string,
    }) {
        this.parser = new Parser(args.options);
        this.customHandler = args.handler ?? defaultHandler;
        this.constFilePath = args.constantsFile;
    }

    async init() {
        pretty.info('Initializing translation scanner.')
        const cname = envk('componentName');
        const ctype = envk('componentType');
        const sourceFileName = `${ctype}-${cname}`;
        if (!cname || !ctype) {
            pretty.error(`Invalid source file name... '${sourceFileName}'`);
            process.exit(1);
        }
        await this.setupSourceFile(sourceFileName);
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
                    const e = Error(`Key: '${key}' is already defined in '${this.constFilePath}'\nIgnoring '${key}' from '${filePath}'`);
                    pretty.error(e.message);
                    return;
                }
                this.keyCountMap[key] = this.keyCountMap[key] ? this.keyCountMap[key] + 1 : 1;
                if (this.keyCountMap[key] > 1) {
                    pretty.warning(`Ignoring adding key - '${key}' to resource store '${key}' is already registered`);
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

        files.forEach(async (path, i) => {
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
        pretty.log(`Scanning base directory ${baseDir} for source strings.`)
        try {
            const sourceStrings = [
                ...(await this.extractMethodsStrings(baseDir)),
                ...(await this.extractSourceStringsFromConstantFile())
            ].flat();

            writeJSON(sourceStrings, path.join(tempDirPath, 'sourceStrings.json'));
            return sourceStrings;

        } catch (error: any) {
            pretty.error(error.message)
            process.exit(1);
        }
    }

    async getNewSourceStrings(scannedSourceStrings: ISourceString[]) {
        pretty.info('Extracting new source strings');
        const sourceStringsFromServer = await getAllSourceStringBySourceFileId(this.sourceFile._id);
        const newSourceStrings = filterObjectsByKey<ISourceString>(scannedSourceStrings, sourceStringsFromServer, 'key');
        pretty.info(`Found '${newSourceStrings.length}' new source strings.`)
        return newSourceStrings;
    }

    async createNewSourceStrings(newSourceStrings: ISourceString[]) {
        pretty.info(`Creating '${newSourceStrings.length}' new source strings on backend.`)
        try {
            const res = await batchCreateOrUpdateSourceString({
                fileId: this.sourceFile._id,
                content: newSourceStrings.map(a => ({
                    content: a.defaultValue as string,
                    key: a.key,
                    forceCreate: a.metadata?.forceCreate as boolean,
                    operation: 'create'
                }))
            });
            pretty.info(`Creating '${newSourceStrings.length}' new source strings on backend completed.`)
            return res;
        } catch (error: any) {
            pretty.errorJson(error.response.data);
            process.exit(1)
        }
    }

    async setupSourceFile(sourceFileName: string) {
        pretty.info(`Checking if source file '${sourceFileName}' is already present.`);
        const { data } = await getSourceFileByName(sourceFileName);
        // reset to data.success once backend send correct value
        if (data.data?._id) {
            pretty.info(`Source file '${sourceFileName}' already exists. Using same source file.`);
            this.sourceFile = data.data;
            pretty.infoJson(data.data)
        } else {
            // create source file
            pretty.info(`Source file '${sourceFileName}' does not exists. Creating new source file.`);
            try {
                const { data } = await createSourceFile({
                    name: sourceFileName,
                });
                if (data.success) {
                    pretty.success(`Source file '${sourceFileName}' successfully created.`)
                    this.sourceFile = data.data;
                    pretty.infoJson(data.data)
                } else {
                    pretty.success(`Source file '${sourceFileName}' creation failed.`)
                    pretty.error(data.error);
                    process.exit(1);
                }
            } catch (error: any) {
                pretty.success(`Source file '${sourceFileName}' creation failed.`)
                pretty.error(error?.response?.data?.error);
                process.exit(1);
            }
        }

    }

    async generateTranslations(sourceStrings: ISourceString[]) {
        try {
            const newSourceStrings = await this.getNewSourceStrings(sourceStrings);
            const res = await this.createNewSourceStrings(newSourceStrings);
            this.writeTranslationUrlToEnv();
            pretty.success('Translation pipeline completed successfully.');
            process.exit(0);
        } catch (error: any) {
            pretty.error('Something went wrong while generating translations. Aborting...')
            pretty.error(error.message);
            process.exit(1);
        }
    }

    writeTranslationUrlToEnv() {
        pretty.info(`Writing ${TRANSLATION_FILE_URL_KEY} to env with value ${this.sourceFile.fileUrl}`);
        if (!this.sourceFile.fileUrl) {
            pretty.error('Invalid source file url, aborting writing to env.');
            process.exit(1);
        }
        process.env[TRANSLATION_FILE_URL_KEY] = this.sourceFile.fileUrl;
    }

    // async generateI18nResourceStore() {
    //     try {
    //         pretty.info('Setting up I18N resource store...')
    //         pretty.info('Getting all supported locales...')
    //         const { data } = await getAllLanguages();
    //         const supportedLocales = data.data.map((lang: Record<string, any>) => lang.locale);

    //         pretty.info('Generating locale file urls...')

    //         const localeToTranslationFileUrlMap: Record<string, any> = {};
    //         supportedLocales.forEach((locale :string) => {
    //                 localeToTranslationFileUrlMap[locale] = `${this.sourceFile.fileUrl}/${locale}.json`;
    //         });

    //         pretty.info('Writing resource map to temp file...');
    //         writeJSON(localeToTranslationFileUrlMap, tempDirPath+'/resources.json')

    //         pretty.infoJson(supportedLocales);
    //         pretty.infoJson(localeToTranslationFileUrlMap);
    //     } catch (error: any) {
    //         if (error.response) {
    //             pretty.errorJson(error.response.data);
    //         } else {
    //             pretty.error(error.message)
    //         }
    //     }
    // }

    getResourceStore() {
        return this.parser.get();
    }
}