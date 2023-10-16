import { CustomHandlerFn } from "../builders/parser-options"

export interface ISourceString {
    key: string,
    defaultValue?: string;
    context: {
        description?: string | null;
        screenshotUrl?: string | null;
        lexicalCategory?: string | null;
    };
    metadata?: {
        forceCreate?: boolean;
    };
}''

export function createSourceStringObj(key: string, obj: Record<string, any>) {
    let ss = {
        key: key,
        defaultValue: key,
        context: {
            description: null,
            screenshotUrl: null,
            lexicalCategory: null,
        },
        metadata: {
            forceCreate: false
        },
    };

    if (!obj) {
        return ss;
    }

    if (obj.defaultValue) {
        ss.defaultValue = obj.defaultValue;
    }

    if (typeof obj.context === 'object') {
        ss.context = {
            ...ss.context,
            ...obj.context,
        }
    }

    if (typeof obj.metadata === 'object') {
        ss.metadata = {
            ...ss.metadata,
            ...obj.metadata,
        }
    }

    return ss;
}

export const defaultHandler: CustomHandlerFn = (parser: any, key: string, args: any) => {
    const sourceString = createSourceStringObj(key, args)
    parser.set(key, sourceString.defaultValue);
    return sourceString;
}