export var util: typeof import("./lib/util");
export var templatemarkutil: typeof import("./lib/templatemarkutil");
export var datetimeutil: {
    setCurrentTime: (currentTime: string) => any;
};
export var normalizeNLs: (input: string) => string;
export var TemplateException: typeof import("./lib/templateexception");
export var TemplateMarkTransformer: typeof import("./lib/TemplateMarkTransformer");
