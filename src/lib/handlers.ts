import { CustomHandlerFn } from "../builders/parser-options"

export function createSourceStringObj(key: string, obj: Record<string, any>) {
    let ss = {
        defaultValue: key,
         context: {
            description: '',
            url: `${key}_url`,
            screenshotUrl: `${key}_screenshotUrl`,
            lexicalCategory: `${key}_lexicalCategory`,
        }
    };

    if(!obj) {
        return ss;
    }

    if(obj.defaultValue) {
        ss.defaultValue = obj.defaultValue;
    } else {
        ss.defaultValue = "__NO_TRANSLATION__";
    }

    if(typeof obj.context !== 'object') {
        return ss;
    }

    if (obj.context) {
        ss.context = {
            ...ss.context,
            ...obj.context
        }
    } 

    return ss;
}

export const defaultHandler: CustomHandlerFn = (parser: any, key: string, args: any) => {
    const sourceString = createSourceStringObj(key, args)
    parser.set(key, sourceString.defaultValue);
    return sourceString;
}