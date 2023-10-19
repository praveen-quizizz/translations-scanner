import { ScannerOptionsBuilder } from "../builders/scanner-options";
import path from 'path';
import { TranslationScanner } from "../lib/parser";
import { batchCreateOrUpdateSourceString, getAllSourceStrings } from "../client/api";
import { DEFAULT_GET_BATCH_SIZE, SERVER_URL } from "../client/constants";
import axios from "axios";

import pretty from "../logger/pretty";


async function main() {
    // const ss =  await getAllSourceStrings({limit: DEFAULT_GET_BATCH_SIZE});
    // return

    // const startTime = performance.now();
    // let nextPage = `${SERVER_URL}/v1/sourceStrings?limit=${null}`;
    // const response = await axios.get(nextPage);
    // console.log("🚀 ~ file: test.ts:14 ~ main ~ response:", response.data.data.length)
    // const endTime = performance.now();
    // const elapsedTime = endTime - startTime;
    // console.log(`Total time elapsed: ${elapsedTime} milliseconds`);
    // return


    const scannerOptions = new ScannerOptionsBuilder()
        .setAllowDynamicKeys(true)
        .setDebug(false)
        .setFunc(['$tWrap', '$t'], ['.vue', '.js', '.ts'])
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
        constantsFile: path.resolve('./dist/e2e/constants.js'),
    });
    await tScanner.init();
    const d = await tScanner.scan('/Users/praveen/github/frontend/apps/admin/src');
    const res = await tScanner.generateTranslations(d);

    // const ns =  await tScanner.getNewSourceStrings(d);
    // const res = await tScanner.createNewSourceStrings(ns);
}

main().then();