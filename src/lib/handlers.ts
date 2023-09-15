import { CustomHandlerFn } from "../builders/parser-options"

export const defaultHandler: CustomHandlerFn = (key: string, args: any) => {
    console.log(key, args)
}