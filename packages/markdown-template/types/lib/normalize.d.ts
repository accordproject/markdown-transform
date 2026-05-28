/**
 * Prepare the text for parsing (normalizes new lines, etc)
 * @param {string} input - the text
 * @return {string} - the normalized text
 */
export function normalizeNLs(input: string): string;
/**
 * Normalize to markdown cicero text
 * @param {*} input - the CiceroMark DOM
 * @return {string} - the normalized markdown cicero text
 */
export function normalizeToMarkdownCicero(input: any): string;
/**
 * Normalize from markdown cicero text
 * @param {string} input - the markdown cicero text
 * @return {object} - the normalized CiceroMark DOM
 */
export function normalizeFromMarkdownCicero(input: string): object;
