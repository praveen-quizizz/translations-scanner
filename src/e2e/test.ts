import { ParserOptionsBuilder } from "../builders/parser-options";
import { ScannerOptionsBuilder } from "../builders/scanner-options";
import path from 'path';
import { TranslationScanner } from "../lib/parser";

async function main() {
    const scannerOptions = new ScannerOptionsBuilder()
        .setAllowDynamicKeys(true)
        .setDebug(false)
        .setFunc(['$tWrap'], ['.vue', '.js', '.ts'])
        .setInterpolation({
            prefix: '${',
            suffix: '}',
        })
        .setDefaultValue('__NO_TRANSLATION__')
        .setKeySeparator(false)
        .setNsSeparator(false)
        .build();

    const parserOptions = new ParserOptionsBuilder()
        .setOptions(scannerOptions)
        .setConstantsFilePath(path.resolve('./dist/e2e/constants.js'))
        .build();

    const tScanner = new TranslationScanner({
        options: scannerOptions,
        constantsFile: parserOptions.constantsFile ?? ''
    });
    await tScanner.init()
    const data = await tScanner.scan('/Users/praveen/github/frontend/apps/admin/src');
    // console.log("data" ,data)
}

main().then()