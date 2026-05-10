declare namespace textRule {
    export const tag: string;
    export const leaf: boolean;
    export const open: boolean;
    export const close: boolean;
    export function enter(node: any, token: any, callback: any): void;
    export const skipEmpty: boolean;
}
declare namespace codeInlineRule {
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
declare namespace softbreakRule {
    const tag_2: string;
    export { tag_2 as tag };
    const leaf_2: boolean;
    export { leaf_2 as leaf };
    const open_2: boolean;
    export { open_2 as open };
    const close_2: boolean;
    export { close_2 as close };
    const skipEmpty_2: boolean;
    export { skipEmpty_2 as skipEmpty };
}
declare namespace hardbreakRule {
    const tag_3: string;
    export { tag_3 as tag };
    const leaf_3: boolean;
    export { leaf_3 as leaf };
    const open_3: boolean;
    export { open_3 as open };
    const close_3: boolean;
    export { close_3 as close };
    const skipEmpty_3: boolean;
    export { skipEmpty_3 as skipEmpty };
}
declare namespace htmlInlineRule {
    const tag_4: string;
    export { tag_4 as tag };
    const leaf_4: boolean;
    export { leaf_4 as leaf };
    const open_4: boolean;
    export { open_4 as open };
    const close_4: boolean;
    export { close_4 as close };
    export function enter_2(node: any, token: any, callback: any): void;
    export { enter_2 as enter };
    const skipEmpty_4: boolean;
    export { skipEmpty_4 as skipEmpty };
}
declare namespace strongOpenRule {
    const tag_5: string;
    export { tag_5 as tag };
    const leaf_5: boolean;
    export { leaf_5 as leaf };
    const open_5: boolean;
    export { open_5 as open };
    const close_5: boolean;
    export { close_5 as close };
    const skipEmpty_5: boolean;
    export { skipEmpty_5 as skipEmpty };
}
declare namespace strongCloseRule {
    const tag_6: string;
    export { tag_6 as tag };
    const leaf_6: boolean;
    export { leaf_6 as leaf };
    const open_6: boolean;
    export { open_6 as open };
    const close_6: boolean;
    export { close_6 as close };
    const skipEmpty_6: boolean;
    export { skipEmpty_6 as skipEmpty };
}
declare namespace emphOpenRule {
    const tag_7: string;
    export { tag_7 as tag };
    const leaf_7: boolean;
    export { leaf_7 as leaf };
    const open_7: boolean;
    export { open_7 as open };
    const close_7: boolean;
    export { close_7 as close };
    const skipEmpty_7: boolean;
    export { skipEmpty_7 as skipEmpty };
}
declare namespace emphCloseRule {
    const tag_8: string;
    export { tag_8 as tag };
    const leaf_8: boolean;
    export { leaf_8 as leaf };
    const open_8: boolean;
    export { open_8 as open };
    const close_8: boolean;
    export { close_8 as close };
    const skipEmpty_8: boolean;
    export { skipEmpty_8 as skipEmpty };
}
declare namespace linkOpenRule {
    const tag_9: string;
    export { tag_9 as tag };
    const leaf_9: boolean;
    export { leaf_9 as leaf };
    const open_9: boolean;
    export { open_9 as open };
    const close_9: boolean;
    export { close_9 as close };
    export function enter_3(node: any, token: any, callback: any): void;
    export { enter_3 as enter };
    const skipEmpty_9: boolean;
    export { skipEmpty_9 as skipEmpty };
}
declare namespace linkCloseRule {
    const tag_10: string;
    export { tag_10 as tag };
    const leaf_10: boolean;
    export { leaf_10 as leaf };
    const open_10: boolean;
    export { open_10 as open };
    const close_10: boolean;
    export { close_10 as close };
    const skipEmpty_10: boolean;
    export { skipEmpty_10 as skipEmpty };
}
declare namespace imageRule {
    const tag_11: string;
    export { tag_11 as tag };
    const leaf_11: boolean;
    export { leaf_11 as leaf };
    const open_11: boolean;
    export { open_11 as open };
    const close_11: boolean;
    export { close_11 as close };
    export function enter_4(node: any, token: any, callback: any): void;
    export { enter_4 as enter };
    const skipEmpty_11: boolean;
    export { skipEmpty_11 as skipEmpty };
}
declare namespace codeBlockRule {
    const tag_12: string;
    export { tag_12 as tag };
    const leaf_12: boolean;
    export { leaf_12 as leaf };
    const open_12: boolean;
    export { open_12 as open };
    const close_12: boolean;
    export { close_12 as close };
    export function enter_5(node: any, token: any, callback: any): void;
    export { enter_5 as enter };
}
declare namespace fenceRule { }
declare namespace htmlBlockRule {
    const tag_13: string;
    export { tag_13 as tag };
    const leaf_13: boolean;
    export { leaf_13 as leaf };
    const open_13: boolean;
    export { open_13 as open };
    const close_13: boolean;
    export { close_13 as close };
    export function enter_6(node: any, token: any, callback: any): void;
    export { enter_6 as enter };
}
declare namespace hrRule {
    const tag_14: string;
    export { tag_14 as tag };
    const leaf_14: boolean;
    export { leaf_14 as leaf };
    const open_14: boolean;
    export { open_14 as open };
    const close_14: boolean;
    export { close_14 as close };
    export function enter_7(node: any, token: any, callback: any): void;
    export { enter_7 as enter };
}
declare namespace paragraphOpenRule {
    const tag_15: string;
    export { tag_15 as tag };
    const leaf_15: boolean;
    export { leaf_15 as leaf };
    const open_15: boolean;
    export { open_15 as open };
    const close_15: boolean;
    export { close_15 as close };
    export function enter_8(node: any, token: any, callback: any): void;
    export { enter_8 as enter };
}
declare namespace paragraphCloseRule {
    const tag_16: string;
    export { tag_16 as tag };
    const leaf_16: boolean;
    export { leaf_16 as leaf };
    const open_16: boolean;
    export { open_16 as open };
    const close_16: boolean;
    export { close_16 as close };
}
declare namespace headingOpenRule {
    const tag_17: string;
    export { tag_17 as tag };
    const leaf_17: boolean;
    export { leaf_17 as leaf };
    const open_17: boolean;
    export { open_17 as open };
    const close_17: boolean;
    export { close_17 as close };
    export function enter_9(node: any, token: any, callback: any): void;
    export { enter_9 as enter };
}
declare namespace headingCloseRule {
    const tag_18: string;
    export { tag_18 as tag };
    const leaf_18: boolean;
    export { leaf_18 as leaf };
    const open_18: boolean;
    export { open_18 as open };
    const close_18: boolean;
    export { close_18 as close };
}
declare namespace blockQuoteOpenRule {
    const tag_19: string;
    export { tag_19 as tag };
    const leaf_19: boolean;
    export { leaf_19 as leaf };
    const open_19: boolean;
    export { open_19 as open };
    const close_19: boolean;
    export { close_19 as close };
    export function enter_10(node: any, token: any, callback: any): void;
    export { enter_10 as enter };
}
declare namespace blockQuoteCloseRule {
    const tag_20: string;
    export { tag_20 as tag };
    const leaf_20: boolean;
    export { leaf_20 as leaf };
    const open_20: boolean;
    export { open_20 as open };
    const close_20: boolean;
    export { close_20 as close };
}
declare namespace bulletListOpenRule {
    const tag_21: string;
    export { tag_21 as tag };
    const leaf_21: boolean;
    export { leaf_21 as leaf };
    const open_21: boolean;
    export { open_21 as open };
    const close_21: boolean;
    export { close_21 as close };
    export function enter_11(node: any, token: any, callback: any): void;
    export { enter_11 as enter };
}
declare namespace bulletListCloseRule {
    const tag_22: string;
    export { tag_22 as tag };
    const leaf_22: boolean;
    export { leaf_22 as leaf };
    const open_22: boolean;
    export { open_22 as open };
    const close_22: boolean;
    export { close_22 as close };
}
declare namespace orderedListOpenRule {
    const tag_23: string;
    export { tag_23 as tag };
    const leaf_23: boolean;
    export { leaf_23 as leaf };
    const open_23: boolean;
    export { open_23 as open };
    const close_23: boolean;
    export { close_23 as close };
    export function enter_12(node: any, token: any, callback: any): void;
    export { enter_12 as enter };
}
declare namespace orderedListCloseRule {
    const tag_24: string;
    export { tag_24 as tag };
    const leaf_24: boolean;
    export { leaf_24 as leaf };
    const open_24: boolean;
    export { open_24 as open };
    const close_24: boolean;
    export { close_24 as close };
}
declare namespace listItemOpenRule {
    const tag_25: string;
    export { tag_25 as tag };
    const leaf_25: boolean;
    export { leaf_25 as leaf };
    const open_25: boolean;
    export { open_25 as open };
    const close_25: boolean;
    export { close_25 as close };
    export function enter_13(node: any, token: any, callback: any): void;
    export { enter_13 as enter };
}
declare namespace listItemCloseRule {
    const tag_26: string;
    export { tag_26 as tag };
    const leaf_26: boolean;
    export { leaf_26 as leaf };
    const open_26: boolean;
    export { open_26 as open };
    const close_26: boolean;
    export { close_26 as close };
}
declare namespace tableOpenRule {
    const tag_27: string;
    export { tag_27 as tag };
    const leaf_27: boolean;
    export { leaf_27 as leaf };
    const open_27: boolean;
    export { open_27 as open };
    const close_27: boolean;
    export { close_27 as close };
    export function enter_14(node: any, token: any, callback: any): void;
    export { enter_14 as enter };
}
declare namespace tableCloseRule {
    const tag_28: string;
    export { tag_28 as tag };
    const leaf_28: boolean;
    export { leaf_28 as leaf };
    const open_28: boolean;
    export { open_28 as open };
    const close_28: boolean;
    export { close_28 as close };
}
declare namespace tableHeadOpenRule {
    const tag_29: string;
    export { tag_29 as tag };
    const leaf_29: boolean;
    export { leaf_29 as leaf };
    const open_29: boolean;
    export { open_29 as open };
    const close_29: boolean;
    export { close_29 as close };
    export function enter_15(node: any, token: any, callback: any): void;
    export { enter_15 as enter };
}
declare namespace tableHeadCloseRule {
    const tag_30: string;
    export { tag_30 as tag };
    const leaf_30: boolean;
    export { leaf_30 as leaf };
    const open_30: boolean;
    export { open_30 as open };
    const close_30: boolean;
    export { close_30 as close };
}
declare namespace tableBodyOpenRule {
    const tag_31: string;
    export { tag_31 as tag };
    const leaf_31: boolean;
    export { leaf_31 as leaf };
    const open_31: boolean;
    export { open_31 as open };
    const close_31: boolean;
    export { close_31 as close };
    export function enter_16(node: any, token: any, callback: any): void;
    export { enter_16 as enter };
}
declare namespace tableBodyCloseRule {
    const tag_32: string;
    export { tag_32 as tag };
    const leaf_32: boolean;
    export { leaf_32 as leaf };
    const open_32: boolean;
    export { open_32 as open };
    const close_32: boolean;
    export { close_32 as close };
}
declare namespace tableRowOpenRule {
    const tag_33: string;
    export { tag_33 as tag };
    const leaf_33: boolean;
    export { leaf_33 as leaf };
    const open_33: boolean;
    export { open_33 as open };
    const close_33: boolean;
    export { close_33 as close };
    export function enter_17(node: any, token: any, callback: any): void;
    export { enter_17 as enter };
}
declare namespace tableRowCloseRule {
    const tag_34: string;
    export { tag_34 as tag };
    const leaf_34: boolean;
    export { leaf_34 as leaf };
    const open_34: boolean;
    export { open_34 as open };
    const close_34: boolean;
    export { close_34 as close };
}
declare namespace headerCellOpenRule {
    const tag_35: string;
    export { tag_35 as tag };
    const leaf_35: boolean;
    export { leaf_35 as leaf };
    const open_35: boolean;
    export { open_35 as open };
    const close_35: boolean;
    export { close_35 as close };
    export function enter_18(node: any, token: any, callback: any): void;
    export { enter_18 as enter };
}
declare namespace headerCellCloseRule {
    const tag_36: string;
    export { tag_36 as tag };
    const leaf_36: boolean;
    export { leaf_36 as leaf };
    const open_36: boolean;
    export { open_36 as open };
    const close_36: boolean;
    export { close_36 as close };
}
declare namespace tableCellOpenRule {
    const tag_37: string;
    export { tag_37 as tag };
    const leaf_37: boolean;
    export { leaf_37 as leaf };
    const open_37: boolean;
    export { open_37 as open };
    const close_37: boolean;
    export { close_37 as close };
    export function enter_19(node: any, token: any, callback: any): void;
    export { enter_19 as enter };
}
declare namespace tableCellCloseRule {
    const tag_38: string;
    export { tag_38 as tag };
    const leaf_38: boolean;
    export { leaf_38 as leaf };
    const open_38: boolean;
    export { open_38 as open };
    const close_38: boolean;
    export { close_38 as close };
}
export declare namespace inlines {
    export { textRule as text };
    export { codeInlineRule as code_inline };
    export { softbreakRule as softbreak };
    export { hardbreakRule as hardbreak };
    export { htmlInlineRule as html_inline };
    export { strongOpenRule as strong_open };
    export { strongCloseRule as strong_close };
    export { emphOpenRule as em_open };
    export { emphCloseRule as em_close };
    export { linkOpenRule as link_open };
    export { linkCloseRule as link_close };
    export { imageRule as image };
}
export declare namespace blocks {
    export { codeBlockRule as code_block };
    export { fenceRule as fence };
    export { htmlBlockRule as html_block };
    export { hrRule as hr };
    export { paragraphOpenRule as paragraph_open };
    export { paragraphCloseRule as paragraph_close };
    export { headingOpenRule as heading_open };
    export { headingCloseRule as heading_close };
    export { blockQuoteOpenRule as blockquote_open };
    export { blockQuoteCloseRule as blockquote_close };
    export { bulletListOpenRule as bullet_list_open };
    export { bulletListCloseRule as bullet_list_close };
    export { orderedListOpenRule as ordered_list_open };
    export { orderedListCloseRule as ordered_list_close };
    export { listItemOpenRule as list_item_open };
    export { listItemCloseRule as list_item_close };
    export { tableOpenRule as table_open };
    export { tableCloseRule as table_close };
    export { tableHeadOpenRule as thead_open };
    export { tableHeadCloseRule as thead_close };
    export { tableBodyOpenRule as tbody_open };
    export { tableBodyCloseRule as tbody_close };
    export { tableRowOpenRule as tr_open };
    export { tableRowCloseRule as tr_close };
    export { headerCellOpenRule as th_open };
    export { headerCellCloseRule as th_close };
    export { tableCellOpenRule as td_open };
    export { tableCellCloseRule as td_close };
}
export {};
