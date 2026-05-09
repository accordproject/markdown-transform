declare namespace variableRule {
    let tag: string;
    let leaf: boolean;
    let open: boolean;
    let close: boolean;
    function enter(node: any, token: any, callback: any): void;
    let skipEmpty: boolean;
}
declare namespace thisRule {
    let tag_1: string;
    export { tag_1 as tag };
    let leaf_1: boolean;
    export { leaf_1 as leaf };
    let open_1: boolean;
    export { open_1 as open };
    let close_1: boolean;
    export { close_1 as close };
    export function enter_1(node: any, token: any, callback: any): void;
    export { enter_1 as enter };
    let skipEmpty_1: boolean;
    export { skipEmpty_1 as skipEmpty };
}
declare namespace formulaRule {
    let tag_2: string;
    export { tag_2 as tag };
    let leaf_2: boolean;
    export { leaf_2 as leaf };
    let open_2: boolean;
    export { open_2 as open };
    let close_2: boolean;
    export { close_2 as close };
    export function enter_2(node: any, token: any, callback: any): void;
    export { enter_2 as enter };
    let skipEmpty_2: boolean;
    export { skipEmpty_2 as skipEmpty };
}
declare namespace ifOpenRule {
    let tag_3: string;
    export { tag_3 as tag };
    let leaf_3: boolean;
    export { leaf_3 as leaf };
    let open_3: boolean;
    export { open_3 as open };
    let close_3: boolean;
    export { close_3 as close };
    export function enter_3(node: any, token: any, callback: any): void;
    export { enter_3 as enter };
    let skipEmpty_3: boolean;
    export { skipEmpty_3 as skipEmpty };
}
declare namespace ifCloseRule {
    let tag_4: string;
    export { tag_4 as tag };
    let leaf_4: boolean;
    export { leaf_4 as leaf };
    let open_4: boolean;
    export { open_4 as open };
    let close_4: boolean;
    export { close_4 as close };
    export function exit(node: any, token: any, callback: any): void;
    let skipEmpty_4: boolean;
    export { skipEmpty_4 as skipEmpty };
}
declare namespace optionalOpenRule {
    let tag_5: string;
    export { tag_5 as tag };
    let leaf_5: boolean;
    export { leaf_5 as leaf };
    let open_5: boolean;
    export { open_5 as open };
    let close_5: boolean;
    export { close_5 as close };
    export function enter_4(node: any, token: any, callback: any): void;
    export { enter_4 as enter };
    let skipEmpty_5: boolean;
    export { skipEmpty_5 as skipEmpty };
}
declare namespace optionalCloseRule {
    let tag_6: string;
    export { tag_6 as tag };
    let leaf_6: boolean;
    export { leaf_6 as leaf };
    let open_6: boolean;
    export { open_6 as open };
    let close_6: boolean;
    export { close_6 as close };
    export function exit_1(node: any, token: any, callback: any): void;
    export { exit_1 as exit };
    let skipEmpty_6: boolean;
    export { skipEmpty_6 as skipEmpty };
}
declare namespace elseRule {
    let tag_7: string;
    export { tag_7 as tag };
    let leaf_7: boolean;
    export { leaf_7 as leaf };
    let open_7: boolean;
    export { open_7 as open };
    let close_7: boolean;
    export { close_7 as close };
    export function enter_5(node: any, token: any, callback: any): void;
    export { enter_5 as enter };
    let skipEmpty_7: boolean;
    export { skipEmpty_7 as skipEmpty };
}
declare namespace withOpenRule {
    let tag_8: string;
    export { tag_8 as tag };
    let leaf_8: boolean;
    export { leaf_8 as leaf };
    let open_8: boolean;
    export { open_8 as open };
    let close_8: boolean;
    export { close_8 as close };
    export function enter_6(node: any, token: any, callback: any): void;
    export { enter_6 as enter };
    let skipEmpty_8: boolean;
    export { skipEmpty_8 as skipEmpty };
}
declare namespace withCloseRule {
    let tag_9: string;
    export { tag_9 as tag };
    let leaf_9: boolean;
    export { leaf_9 as leaf };
    let open_9: boolean;
    export { open_9 as open };
    let close_9: boolean;
    export { close_9 as close };
}
declare namespace joinOpenRule {
    let tag_10: string;
    export { tag_10 as tag };
    let leaf_10: boolean;
    export { leaf_10 as leaf };
    let open_10: boolean;
    export { open_10 as open };
    let close_10: boolean;
    export { close_10 as close };
    export function enter_7(node: any, token: any, callback: any): void;
    export { enter_7 as enter };
    let skipEmpty_9: boolean;
    export { skipEmpty_9 as skipEmpty };
}
declare namespace joinCloseRule {
    let tag_11: string;
    export { tag_11 as tag };
    let leaf_11: boolean;
    export { leaf_11 as leaf };
    let open_11: boolean;
    export { open_11 as open };
    let close_11: boolean;
    export { close_11 as close };
}
declare namespace clauseOpenRule {
    let tag_12: string;
    export { tag_12 as tag };
    let leaf_12: boolean;
    export { leaf_12 as leaf };
    let open_12: boolean;
    export { open_12 as open };
    let close_12: boolean;
    export { close_12 as close };
    export function enter_8(node: any, token: any, callback: any): void;
    export { enter_8 as enter };
}
declare namespace clauseCloseRule {
    let tag_13: string;
    export { tag_13 as tag };
    let leaf_13: boolean;
    export { leaf_13 as leaf };
    let open_13: boolean;
    export { open_13 as open };
    let close_13: boolean;
    export { close_13 as close };
}
declare namespace ulistOpenRule {
    let tag_14: string;
    export { tag_14 as tag };
    let leaf_14: boolean;
    export { leaf_14 as leaf };
    let open_14: boolean;
    export { open_14 as open };
    let close_14: boolean;
    export { close_14 as close };
    export function enter_9(node: any, token: any, callback: any): void;
    export { enter_9 as enter };
}
declare namespace ulistCloseRule {
    let tag_15: string;
    export { tag_15 as tag };
    let leaf_15: boolean;
    export { leaf_15 as leaf };
    let open_15: boolean;
    export { open_15 as open };
    let close_15: boolean;
    export { close_15 as close };
}
declare namespace olistOpenRule {
    let tag_16: string;
    export { tag_16 as tag };
    let leaf_16: boolean;
    export { leaf_16 as leaf };
    let open_16: boolean;
    export { open_16 as open };
    let close_16: boolean;
    export { close_16 as close };
    export function enter_10(node: any, token: any, callback: any): void;
    export { enter_10 as enter };
}
declare namespace olistCloseRule {
    let tag_17: string;
    export { tag_17 as tag };
    let leaf_17: boolean;
    export { leaf_17 as leaf };
    let open_17: boolean;
    export { open_17 as open };
    let close_17: boolean;
    export { close_17 as close };
}
export namespace inlines {
    export { variableRule as variable };
    export { thisRule as this };
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
export namespace blocks {
    export { clauseOpenRule as block_clause_open };
    export { clauseCloseRule as block_clause_close };
    export { ulistOpenRule as block_ulist_open };
    export { ulistCloseRule as block_ulist_close };
    export { olistOpenRule as block_olist_open };
    export { olistCloseRule as block_olist_close };
}
export {};
