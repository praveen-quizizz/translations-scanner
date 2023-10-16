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

    const tScanner = new TranslationScanner({
        options: scannerOptions,
        constantsFile:path.resolve('./dist/e2e/constants.js'),
    });
    await tScanner.init()
    await tScanner.scan('/Users/praveen/github/frontend/apps/admin/src');
    console.log(tScanner.getResourceStore());
}

main().then();