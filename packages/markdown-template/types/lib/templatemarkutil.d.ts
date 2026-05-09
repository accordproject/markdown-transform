/**
 * Returns the concept for the template
 * @param {object} introspector - the model introspector for this template
 * @param {string} templateKind - either 'clause' or 'contract'
 * @param {string} [conceptFullyQualifiedName] - the fully qualified name of the template concept
 * @throws {Error} if no template model is found, or multiple template models are found
 * @returns {object} the concept for the template
 */
export function findTemplateConcept(introspector: object, templateKind: string, conceptFullyQualifiedName?: string): object;
export var templateMarkManager: any;
/**
 * Converts a templatemark string to a token stream
 * @param {object} input the templatemark string
 * @returns {object} the token stream
 */
export function templateToTokens(input: object): object;
/**
 * Converts a template token strean string to an untyped TemplateMark DOM
 * @param {object} tokenStream the template token stream
 * @param {string} templateKind - either 'clause' or 'contract'
 * @returns {object} the TemplateMark DOM
 */
export function tokensToUntypedTemplateMarkFragment(tokenStream: object): object;
/**
 * Converts a template token strean string to an untyped TemplateMark DOM
 * @param {object} tokenStream the template token stream
 * @param {string} templateKind - either 'clause' or 'contract'
 * @returns {object} the TemplateMark DOM
 */
export function tokensToUntypedTemplateMark(tokenStream: object, templateKind: string): object;
/**
 * Decorate TemplateMark DOM with its types
 * @param {object} template the TemplateMark DOM
 * @param {object} modelManager - the modelManager for this template
 * @param {string} templateKind - either 'clause' or 'contract'
 * @param {string} [conceptFullyQualifiedName] - the fully qualified name of the template concept
 * @returns {object} the typed TemplateMark DOM
 */
export function templateMarkTyping(template: object, modelManager: object, templateKind: string, conceptFullyQualifiedName?: string): object;
/**
 * Decorate TemplateMark DOM with its types
 * @param {object} template the TemplateMark DOM
 * @param {object} modelManager - the modelManager for this template
 * @param {string} elementType - the element type
 * @returns {object} the typed TemplateMark DOM
 */
export function templateMarkTypingFromType(template: object, modelManager: object, elementType: string): object;
