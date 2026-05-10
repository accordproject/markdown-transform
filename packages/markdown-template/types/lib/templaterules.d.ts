declare namespace variableRule {
    export const tag: string;
    export const leaf: boolean;
    export const open: boolean;
    export const close: boolean;
    export function enter(node: any, token: any, callback: any): void;
    export const skipEmpty: boolean;
}
declare namespace formulaRule {
    const tag_1: string;
    export { tag_1 as tag };
    const leaf_1: boolean;
    export { leaf_1 as leaf };
    const open_1: boolean;
    export { open_1 as open };
    const close_1: boolean;
    export { close_1 as close };
    export function enter_1(node: any, token: any, callback: any): void;
    export { enter_1 as enter };
    const skipEmpty_1: boolean;
    export { skipEmpty_1 as skipEmpty };
}
declare namespace ifOpenRule {
    const tag_2: string;
    export { tag_2 as tag };
    const leaf_2: boolean;
    export { leaf_2 as leaf };
    const open_2: boolean;
    export { open_2 as open };
    const close_2: boolean;
    export { close_2 as close };
    export function enter_2(node: any, token: any, callback: any): void;
    export { enter_2 as enter };
    const skipEmpty_2: boolean;
    export { skipEmpty_2 as skipEmpty };
}
declare namespace ifCloseRule {
    const tag_3: string;
    export { tag_3 as tag };
    const leaf_3: boolean;
    export { leaf_3 as leaf };
    const open_3: boolean;
    export { open_3 as open };
    const close_3: boolean;
    export { close_3 as close };
    export function exit(node: any, token: any, callback: any): void;
    const skipEmpty_3: boolean;
    export { skipEmpty_3 as skipEmpty };
}
declare namespace optionalOpenRule {
    const tag_4: string;
    export { tag_4 as tag };
    const leaf_4: boolean;
    export { leaf_4 as leaf };
    const open_4: boolean;
    export { open_4 as open };
    const close_4: boolean;
    export { close_4 as close };
    export function enter_3(node: any, token: any, callback: any): void;
    export { enter_3 as enter };
    const skipEmpty_4: boolean;
    export { skipEmpty_4 as skipEmpty };
}
declare namespace optionalCloseRule {
    const tag_5: string;
    export { tag_5 as tag };
    const leaf_5: boolean;
    export { leaf_5 as leaf };
    const open_5: boolean;
    export { open_5 as open };
    const close_5: boolean;
    export { close_5 as close };
    export function exit_1(node: any, token: any, callback: any): void;
    export { exit_1 as exit };
    const skipEmpty_5: boolean;
    export { skipEmpty_5 as skipEmpty };
}
declare namespace elseRule {
    const tag_6: string;
    export { tag_6 as tag };
    const leaf_6: boolean;
    export { leaf_6 as leaf };
    const open_6: boolean;
    export { open_6 as open };
    const close_6: boolean;
    export { close_6 as close };
    export function enter_4(node: any, token: any, callback: any): void;
    export { enter_4 as enter };
    const skipEmpty_6: boolean;
    export { skipEmpty_6 as skipEmpty };
}
declare namespace withOpenRule {
    const tag_7: string;
    export { tag_7 as tag };
    const leaf_7: boolean;
    export { leaf_7 as leaf };
    const open_7: boolean;
    export { open_7 as open };
    const close_7: boolean;
    export { close_7 as close };
    export function enter_5(node: any, token: any, callback: any): void;
    export { enter_5 as enter };
    const skipEmpty_7: boolean;
    export { skipEmpty_7 as skipEmpty };
}
declare namespace withCloseRule {
    const tag_8: string;
    export { tag_8 as tag };
    const leaf_8: boolean;
    export { leaf_8 as leaf };
    const open_8: boolean;
    export { open_8 as open };
    const close_8: boolean;
    export { close_8 as close };
}
declare namespace joinOpenRule {
    const tag_9: string;
    export { tag_9 as tag };
    const leaf_9: boolean;
    export { leaf_9 as leaf };
    const open_9: boolean;
    export { open_9 as open };
    const close_9: boolean;
    export { close_9 as close };
    export function enter_6(node: any, token: any, callback: any): void;
    export { enter_6 as enter };
    const skipEmpty_8: boolean;
    export { skipEmpty_8 as skipEmpty };
}
declare namespace joinCloseRule {
    const tag_10: string;
    export { tag_10 as tag };
    const leaf_10: boolean;
    export { leaf_10 as leaf };
    const open_10: boolean;
    export { open_10 as open };
    const close_10: boolean;
    export { close_10 as close };
}
declare namespace clauseOpenRule {
    const tag_11: string;
    export { tag_11 as tag };
    const leaf_11: boolean;
    export { leaf_11 as leaf };
    const open_11: boolean;
    export { open_11 as open };
    const close_11: boolean;
    export { close_11 as close };
    export function enter_7(node: any, token: any, callback: any): void;
    export { enter_7 as enter };
}
declare namespace clauseCloseRule {
    const tag_12: string;
    export { tag_12 as tag };
    const leaf_12: boolean;
    export { leaf_12 as leaf };
    const open_12: boolean;
    export { open_12 as open };
    const close_12: boolean;
    export { close_12 as close };
}
declare namespace ulistOpenRule {
    const tag_13: string;
    export { tag_13 as tag };
    const leaf_13: boolean;
    export { leaf_13 as leaf };
    const open_13: boolean;
    export { open_13 as open };
    const close_13: boolean;
    export { close_13 as close };
    export function enter_8(node: any, token: any, callback: any): void;
    export { enter_8 as enter };
}
declare namespace ulistCloseRule {
    const tag_14: string;
    export { tag_14 as tag };
    const leaf_14: boolean;
    export { leaf_14 as leaf };
    const open_14: boolean;
    export { open_14 as open };
    const close_14: boolean;
    export { close_14 as close };
}
declare namespace olistOpenRule {
    const tag_15: string;
    export { tag_15 as tag };
    const leaf_15: boolean;
    export { leaf_15 as leaf };
    const open_15: boolean;
    export { open_15 as open };
    const close_15: boolean;
    export { close_15 as close };
    export function enter_9(node: any, token: any, callback: any): void;
    export { enter_9 as enter };
}
declare namespace olistCloseRule {
    const tag_16: string;
    export { tag_16 as tag };
    const leaf_16: boolean;
    export { leaf_16 as leaf };
    const open_16: boolean;
    export { open_16 as open };
    const close_16: boolean;
    export { close_16 as close };
}
export declare namespace inlines {
    export { variableRule as variable };
    export { formulaRule as formula };
    export { ifOpenRule as inline_block_if_open };
    export { ifCloseRule as inline_block_if_close };
    export { optionalOpenRule as inline_block_optional_open };
    export { optionalCloseRule as inline_block_optional_close };
    export { elseRule as inline_block_else };
    export { withOpenRule as inline_block_with_open };
    export { withCloseRule as inline_block_with_close };
    export { joinOpenRule as inline_block_join_open };
    export { joinCloseRule as inline_block_join_close };
}
export declare namespace blocks {
    export { clauseOpenRule as block_clause_open };
    export { clauseCloseRule as block_clause_close };
    export { ulistOpenRule as block_ulist_open };
    export { ulistCloseRule as block_ulist_close };
    export { olistOpenRule as block_olist_open };
    export { olistCloseRule as block_olist_close };
}
export {};
