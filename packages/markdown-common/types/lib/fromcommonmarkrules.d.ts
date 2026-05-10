export = rules;
/** @type {Object<string, RuleFunction>} */
declare const rules: {
    [x: string]: RuleFunction;
};
type RuleFunction = Function;
