export type ScannerOptions = {
    compatibilityJSON: string;
    debug: boolean;
    sort: boolean;
    attr: {
        list: string[];
        extensions: string[];
    };
    func: {
        list: string[];
        extensions: string[];
    };
    trans: {
        component: string;
        i18nKey: string;
        defaultsKey: string;
        extensions: string[];
        fallbackKey: boolean;
        supportBasicHtmlNodes: boolean;
        keepBasicHtmlNodesFor: string[];
        acorn: {
            ecmaVersion: number;
            sourceType: string;
        };
    };
    lngs: string[];
    fallbackLng: string;
    ns: string[];
    defaultLng: string;
    defaultNs: string;
    defaultValue: string;
    resource: {
        loadPath: string;
        savePath: string;
        jsonIndent: number;
        lineEnding: string;
    };
    keySeparator: string;
    nsSeparator: string;
    context: boolean;
    contextFallback: boolean;
    contextSeparator: string;
    contextDefaultValues: string[];
    plural: boolean;
    pluralFallback: boolean;
    pluralSeparator: string;
    interpolation: {
        prefix: string;
        suffix: string;
    };
    metadata: Record<string, any>;
    allowDynamicKeys: boolean;
};

export type TransOptions = {
    component: string;
    i18nKey: string;
    defaultsKey: string;
    extensions: string[];
    fallbackKey: boolean;
    supportBasicHtmlNodes: boolean;
    keepBasicHtmlNodesFor: string[];
    acorn: {
        ecmaVersion: number;
        sourceType: string;
    };
};

export type ResourceOptions = {
    loadPath: string;
    savePath: string;
    jsonIndent: number;
    lineEnding: string;
};

export type InterpolationOptions = {
    prefix: string;
    suffix: string;
};

export class ScannerOptionsBuilder {
    private options: ScannerOptions;
    constructor() {
        this.options = {
            compatibilityJSON: 'v3',
            debug: false,
            sort: false,
            attr: {
                list: ['data-i18n'],
                extensions: ['.html', '.htm'],
            },
            func: {
                list: ['i18next.t', 'i18n.t'],
                extensions: ['.js', '.jsx'],
            },
            trans: {
                component: 'Trans',
                i18nKey: 'i18nKey',
                defaultsKey: 'defaults',
                extensions: ['.js', '.jsx'],
                fallbackKey: false,
                supportBasicHtmlNodes: true,
                keepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
                acorn: {
                    ecmaVersion: 2020,
                    sourceType: 'module',
                },
            },
            lngs: ['en'],
            fallbackLng: 'en',
            ns: [],
            defaultLng: 'en',
            defaultNs: 'translation',
            defaultValue: '',
            resource: {
                loadPath: 'i18n/{{lng}}/{{ns}}.json',
                savePath: 'i18n/{{lng}}/{{ns}}.json',
                jsonIndent: 2,
                lineEnding: '\n',
            },
            keySeparator: '.',
            nsSeparator: ':',
            context: true,
            contextFallback: true,
            contextSeparator: '_',
            contextDefaultValues: [],
            plural: true,
            pluralFallback: true,
            pluralSeparator: '_',
            interpolation: {
                prefix: '{{',
                suffix: '}}',
            },
            metadata: {},
            allowDynamicKeys: false,
        };
    }

    setCompatibilityJSON(version: string): this {
        this.options.compatibilityJSON = version;
        return this;
    }

    setDebug(debug: boolean): this {
        this.options.debug = debug;
        return this;
    }

    setSort(sort: boolean): this {
        this.options.sort = sort;
        return this;
    }

    setAttr(list: string[], extensions: string[]): this {
        this.options.attr = { list, extensions };
        return this;
    }

    setFunc(list: string[], extensions: string[]): this {
        this.options.func = { list, extensions };
        return this;
    }

    setTrans(trans: Partial<TransOptions>): this {
        this.options.trans = { ...this.options.trans, ...trans };
        return this;
    }

    setLngs(lngs: string[]): this {
        this.options.lngs = lngs;
        return this;
    }

    setFallbackLng(fallbackLng: string): this {
        this.options.fallbackLng = fallbackLng;
        return this;
    }

    setNs(ns: string | string[]): this {
        this.options.ns = Array.isArray(ns) ? ns : [ns];
        return this;
    }

    setDefaultLng(defaultLng: string): this {
        this.options.defaultLng = defaultLng;
        return this;
    }

    setDefaultNs(defaultNs: string): this {
        this.options.defaultNs = defaultNs;
        return this;
    }

    setDefaultValue(defaultValue: string): this {
        this.options.defaultValue = defaultValue;
        return this;
    }

    setResource(resource: Partial<ResourceOptions>): this {
        this.options.resource = { ...this.options.resource, ...resource };
        return this;
    }

    setKeySeparator(keySeparator: string): this {
        this.options.keySeparator = keySeparator;
        return this;
    }

    setNsSeparator(nsSeparator: string): this {
        this.options.nsSeparator = nsSeparator;
        return this;
    }

    setContext(context: boolean, contextFallback: boolean, contextSeparator: string, contextDefaultValues: string[]): this {
        this.options.context = context;
        this.options.contextFallback = contextFallback;
        this.options.contextSeparator = contextSeparator;
        this.options.contextDefaultValues = contextDefaultValues;
        return this;
    }

    setPlural(plural: boolean, pluralFallback: boolean, pluralSeparator: string): this {
        this.options.plural = plural;
        this.options.pluralFallback = pluralFallback;
        this.options.pluralSeparator = pluralSeparator;
        return this;
    }

    setInterpolation(interpolation: Partial<InterpolationOptions>): this {
        this.options.interpolation = { ...this.options.interpolation, ...interpolation };
        return this;
    }

    setMetadata(metadata: Record<string, any>): this {
        this.options.metadata = metadata;
        return this;
    }

    setAllowDynamicKeys(allowDynamicKeys: boolean): this {
        this.options.allowDynamicKeys = allowDynamicKeys;
        return this;
    }

    build(): ScannerOptions {
        return this.options;
    }
}
