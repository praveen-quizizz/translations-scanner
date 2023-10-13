import { CustomHandlerFn } from "../builders/parser-options"

export function createSourceStringObj(key: string, obj: Record<string, any>) {
    console.log("🚀 ~ file: handlers.ts:4 ~ createSourceStringObj ~ key:", key)
    let ss = {
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

    if(!obj) {
        return ss;
    }

    if(obj.defaultValue) {
        ss.defaultValue = obj.defaultValue;
    }
    
    if(typeof obj.context === 'object') {
        ss.context = {
            ...ss.context,
            ...obj.context,
        }
    }

    if(typeof obj.metadata === 'object') {
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