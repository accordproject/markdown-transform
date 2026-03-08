export function isAllWhitespace(node: any): boolean;
/**
 * Determine if a node should be ignored by the iterator functions.
 *
 * @param {object} node  An object implementing the DOM1 |Node| interface.
 * @param {boolean} ignoreSpace override
 * @return {boolean} true if the node is:
 *                1) A |Text| node that is all whitespace
 *                2) A |Comment| node
 *             and otherwise false.
 */
export function isIgnorable(node: object, ignoreSpace: boolean): boolean;
