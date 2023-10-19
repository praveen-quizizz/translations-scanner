import axios from "axios";
import { DEFAULT_GET_BATCH_SIZE, DEFAULT_POST_BATCH_SIZE, SERVER_URL } from "./constants";
import { create2DArray, paginateApiOnLastKey } from "./utils";
import pretty from "../logger/pretty";

interface ISourceStringContext {
    url: string,
    screenshotUrl: string,
    lexicalCategory: string,
    description: string,

}
interface ISourceStringForApi {
    key: string,
    content: string,
    fileId: string,
    forceCreate: boolean,
    context?: Partial<ISourceStringContext>
}

interface ISourceStringFromApi {
    masterStringId: string;
    fileId: string;
    updatedAt: string;
    _id: string;
    createdAt: string;
    key: string;
}

export async function createSourceFile(args: { name: string, fileUrl?: string }) {
    return axios({
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        url: `${SERVER_URL}/v1/sourceFile`,
        data: JSON.stringify(args),
    });
}

export async function getAllSourceFiles({ limit = 20 }) {
    return axios({
        url: `${SERVER_URL}/v1/sourceFiles?limit${limit}`
    });
}

export async function getSourceFileByName(sourceFileName: string) {
    return axios({
        url: `${SERVER_URL}/v1/sourceFile/${sourceFileName}`
    });
}

export async function getAllLanguages() {
    return axios({
        url: `${SERVER_URL}/v1/languages?limit=${null}`
    });
}

export async function getLanguageByLocale({ locale }: {
    locale: string
}) {
    return axios({
        url: `${SERVER_URL}/v1/sourceFiles/${locale}`
    });
}

export async function createSourceString(args: ISourceStringForApi) {
    return axios({
        method: 'POST',
        url: `${SERVER_URL}/v1/sourceString`,
        data: JSON.stringify(args),
    });
}

export async function getAllSourceStringBySourceFileId(sourceFileId: string) {
    return paginateApiOnLastKey({
        method: 'GET',
        endpoint: `/v1/sourceString/${sourceFileId}`,
    })
}

export async function getAllSourceStrings(): Promise<ISourceStringFromApi[]> {

    return paginateApiOnLastKey({ 
        method: 'GET', 
        endpoint: '/v1/sourceStrings'
    })
}

export async function batchCreateOrUpdateSourceString(args: { fileId: string, content: { key: string, content: string, forceCreate: boolean, operation: 'create' }[] }) {
    const batches = create2DArray(args.content, DEFAULT_POST_BATCH_SIZE);

    const promises = batches.map((slice) => {
        return  axios({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            url: `${SERVER_URL}/v1/sourceString/batch`,
            data: JSON.stringify({
                fileId: args.fileId,
                content: slice,
            }),
        });
    });

    const result = await Promise.all(promises);

    return result.map(res => res.data);
}