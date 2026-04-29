export = TemplateException;
/**
 * Exception thrown for invalid templates
 * @extends BaseFileException
 * @see See  {@link BaseFileException}
 * @class
 * @memberof module:markdown-template
 * @private
 */
declare class TemplateException {
    /**
     * Create a TemplateException
     * @param {string} message - the message for the exception
     * @param {string} fileLocation - the optional file location associated with the exception
     * @param {string} fileName - the optional file name associated with the exception
     * @param {string} fullMessageOverride - the optional pre-existing full message
     * @param {string} component - the optional component which throws this error
     */
    constructor(message: string, fileLocation: string, fileName: string, fullMessageOverride: string, component: string);
}
