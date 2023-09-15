import { ScannerOptions } from "./scanner-options";

export type CustomHandlerFn = (key: string, opts: any) => void;

export class ParserOptionsBuilder {
    private scannerOptions: Partial<ScannerOptions> | undefined;
    private constantsFilePath: string | undefined;
    private customHandler: CustomHandlerFn | undefined;

    constructor() {}

    setOptions(opts: Partial<ScannerOptions>) {
        this.scannerOptions = opts;
        return this;
    }

    setConstantsFilePath(filePath: string) {
        this.constantsFilePath = filePath;
        return this;
    }

    setCustomHandler(fn: CustomHandlerFn) {
        this.customHandler = fn
        return this;
    }

    build() {
        return {
            options: this.scannerOptions,
            constantsFile: this.constantsFilePath,
            handler: this.customHandler
        }
    }

}