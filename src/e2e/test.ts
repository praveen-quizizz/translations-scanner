import { ParserOptionsBuilder } from "../builders/parser-options";
import { ScannerOptionsBuilder } from "../builders/scanner-options";
import path from 'path';
import { TranslationScanner } from "../lib/parser";
import { defaultHandler } from "../lib/handlers";



async function main() {
    const scannerOptions = new ScannerOptionsBuilder()
        .setAllowDynamicKeys(true)
        .setDebug(false)
        .setFunc(['$t', '$$t'], ['.vue', '.js', '.ts'])
        .setInterpolation({
            prefix: '${',
            suffix: '}',
        })
        .setKeySeparator('::Q::')
        .build()

    const parserOptions = new ParserOptionsBuilder()
        .setOptions(scannerOptions)
        .setConstantsFilePath(path.resolve('./dist/e2e/constants.js'))
        .setCustomHandler(defaultHandler)
        .build();

    const tScanner = new TranslationScanner({
        options: scannerOptions,
        handler: parserOptions.handler,
        constantsFile: parserOptions.constantsFile ?? ''
    });
    await tScanner.init()
    const data = await tScanner.scan('/Users/praveen/github/frontend/apps/admin/src');
    // console.log(data)
}

main().then(console.log).catch(console.error)