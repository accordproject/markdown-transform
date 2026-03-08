export const VARIABLE_RE: RegExp;
export const OPEN_BLOCK_RE: RegExp;
export const CLOSE_BLOCK_RE: RegExp;
export const FORMULA_RE: RegExp;
/**
 * Match opening blocks
 * @param {string} text - the text
 * @param {Array<string>} stack - the block stack
 * @return {*} open tag
 */
export function matchOpenBlock(text: string, stack: Array<string>): any;
/**
 * Match closing blocks
 * @param {string} text - the text
 * @param {string} block_open - the opening block name
 * @param {Array<string>} stack - the block stack
 * @return {*} close tag
 */
export function matchCloseBlock(text: string, block_open: string, stack: Array<string>): any;
/**
 * Extract attributes from opening blocks
 * @param {string[]} match
 * @return {*[]} attributes
 */
export function getBlockAttributes(match: string[]): any[];
