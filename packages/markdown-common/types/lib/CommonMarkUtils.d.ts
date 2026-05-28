/**
 * CommonMark Utilities
 */
/**
 * Initial block stack
 * @return {*} the block stack
 */
export function blocksInit(): any;
/**
 * Next node
 * @param {*} parameters the current parameters
 */
export function nextNode(parameters: any): void;
/**
 * Set parameters for general blocks
 * @param {*} ast - the current ast node
 * @param {*} parametersOut - the current parameters
 * @param {*} init - initial result value
 * @param {*} setFirst whether entering this block should set first
 * @return {*} the new parameters with block quote level incremented
 */
export function mkParameters(ast: any, parametersOut: any, init: any, setFirst: any): any;
/**
 * Create a single new line
 * @param {*} parameters - the parameters
 * @return {string} the prefix
 */
export function mkNewLine(parameters: any): string;
/**
 * Create a line prefix
 * @param {*} parameters - the parameters
 * @param {*} nb - number of newlines
 * @return {string} the prefix
 */
export function mkPrefix(parameters: any, nb: any): string;
/**
 * Create Setext heading
 * @param {number} level - the heading level
 * @return {string} the markup for the heading
 */
export function mkSetextHeading(level: number): string;
/**
 * Create ATX heading
 * @param {number} level - the heading level
 * @return {string} the markup for the heading
 */
export function mkATXHeading(level: number): string;
/**
 * Create table heading
 * @param {number} col - the number of columns
 * @return {string} the markup for the table heading
 */
export function mkTableHeading(col: number): string;
/**
 * Adding escapes for text nodes
 * @param {string} input - unescaped
 * @return {string} escaped
 */
export function escapeText(input: string): string;
/**
 * Adding escapes for code blocks
 * @param {string} input - unescaped
 * @return {string} escaped
 */
export function escapeCodeBlock(input: string): string;
/**
 * Removing escapes
 * @param {string} input - escaped
 * @return {string} unescaped
 */
export function unescapeCodeBlock(input: string): string;
/**
 * Parses an HTML block and extracts the attributes, tag name and tag contents.
 * Note that this will return null for strings like this: </foo>
 * @param {string} string - the HTML block to parse
 * @return {Object} - a tag object that holds the data for the html block
 */
export function parseHtmlBlock(string: string): any;
/**
 * Merge adjacent Html nodes in a list of nodes
 * @param {[*]} nodes - a list of nodes
 * @param {boolean} tagInfo - whether to extract Html tags
 * @returns {*} a new list of nodes with open/closed Html nodes merged
 */
export function mergeAdjacentHtmlNodes(nodes: [any], tagInfo: boolean): any;
/**
 * Determine the heading level
 *
 * @param {string} tag the heading tag
 * @returns {string} the heading level
 */
export function headingLevel(tag: string): string;
/**
 * Get an attribute value
 *
 * @param {*} attrs open ordered list attributes
 * @param {string} name attribute name
 * @param {*} def a default value
 * @returns {string} the initial index
 */
export function getAttr(attrs: any, name: string, def: any): string;
/**
 * Trim single ending newline
 *
 * @param {string} text the input text
 * @returns {string} the trimmed text
 */
export function trimEndline(text: string): string;
