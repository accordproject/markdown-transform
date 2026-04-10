declare namespace textRule {
    let tag: string;
    let leaf: boolean;
    let open: boolean;
    let close: boolean;
    function enter(node: any, token: any, callback: any): void;
    let skipEmpty: boolean;
}
declare namespace codeInlineRule {
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
declare namespace softbreakRule {
    let tag_2: string;
    export { tag_2 as tag };
    let leaf_2: boolean;
    export { leaf_2 as leaf };
    let open_2: boolean;
    export { open_2 as open };
    let close_2: boolean;
    export { close_2 as close };
    let skipEmpty_2: boolean;
    export { skipEmpty_2 as skipEmpty };
}
declare namespace hardbreakRule {
    let tag_3: string;
    export { tag_3 as tag };
    let leaf_3: boolean;
    export { leaf_3 as leaf };
    let open_3: boolean;
    export { open_3 as open };
    let close_3: boolean;
    export { close_3 as close };
    let skipEmpty_3: boolean;
    export { skipEmpty_3 as skipEmpty };
}
declare namespace htmlInlineRule {
    let tag_4: string;
    export { tag_4 as tag };
    let leaf_4: boolean;
    export { leaf_4 as leaf };
    let open_4: boolean;
    export { open_4 as open };
    let close_4: boolean;
    export { close_4 as close };
    export function enter_2(node: any, token: any, callback: any): void;
    export { enter_2 as enter };
    let skipEmpty_4: boolean;
    export { skipEmpty_4 as skipEmpty };
}
declare namespace strongOpenRule {
    let tag_5: string;
    export { tag_5 as tag };
    let leaf_5: boolean;
    export { leaf_5 as leaf };
    let open_5: boolean;
    export { open_5 as open };
    let close_5: boolean;
    export { close_5 as close };
    let skipEmpty_5: boolean;
    export { skipEmpty_5 as skipEmpty };
}
declare namespace strongCloseRule {
    let tag_6: string;
    export { tag_6 as tag };
    let leaf_6: boolean;
    export { leaf_6 as leaf };
    let open_6: boolean;
    export { open_6 as open };
    let close_6: boolean;
    export { close_6 as close };
    let skipEmpty_6: boolean;
    export { skipEmpty_6 as skipEmpty };
}
declare namespace emphOpenRule {
    let tag_7: string;
    export { tag_7 as tag };
    let leaf_7: boolean;
    export { leaf_7 as leaf };
    let open_7: boolean;
    export { open_7 as open };
    let close_7: boolean;
    export { close_7 as close };
    let skipEmpty_7: boolean;
    export { skipEmpty_7 as skipEmpty };
}
declare namespace emphCloseRule {
    let tag_8: string;
    export { tag_8 as tag };
    let leaf_8: boolean;
    export { leaf_8 as leaf };
    let open_8: boolean;
    export { open_8 as open };
    let close_8: boolean;
    export { close_8 as close };
    let skipEmpty_8: boolean;
    export { skipEmpty_8 as skipEmpty };
}
declare namespace linkOpenRule {
    let tag_9: string;
    export { tag_9 as tag };
    let leaf_9: boolean;
    export { leaf_9 as leaf };
    let open_9: boolean;
    export { open_9 as open };
    let close_9: boolean;
    export { close_9 as close };
    export function enter_3(node: any, token: any, callback: any): void;
    export { enter_3 as enter };
    let skipEmpty_9: boolean;
    export { skipEmpty_9 as skipEmpty };
}
declare namespace linkCloseRule {
    let tag_10: string;
    export { tag_10 as tag };
    let leaf_10: boolean;
    export { leaf_10 as leaf };
    let open_10: boolean;
    export { open_10 as open };
    let close_10: boolean;
    export { close_10 as close };
    let skipEmpty_10: boolean;
    export { skipEmpty_10 as skipEmpty };
}
declare namespace imageRule {
    let tag_11: string;
    export { tag_11 as tag };
    let leaf_11: boolean;
    export { leaf_11 as leaf };
    let open_11: boolean;
    export { open_11 as open };
    let close_11: boolean;
    export { close_11 as close };
    export function enter_4(node: any, token: any, callback: any): void;
    export { enter_4 as enter };
    let skipEmpty_11: boolean;
    export { skipEmpty_11 as skipEmpty };
}
declare namespace codeBlockRule {
    let tag_12: string;
    export { tag_12 as tag };
    let leaf_12: boolean;
    export { leaf_12 as leaf };
    let open_12: boolean;
    export { open_12 as open };
    let close_12: boolean;
    export { close_12 as close };
    export function enter_5(node: any, token: any, callback: any): void;
    export { enter_5 as enter };
}
declare namespace fenceRule { }
declare namespace htmlBlockRule {
    let tag_13: string;
    export { tag_13 as tag };
    let leaf_13: boolean;
    export { leaf_13 as leaf };
    let open_13: boolean;
    export { open_13 as open };
    let close_13: boolean;
    export { close_13 as close };
    export function enter_6(node: any, token: any, callback: any): void;
    export { enter_6 as enter };
}
declare namespace hrRule {
    let tag_14: string;
    export { tag_14 as tag };
    let leaf_14: boolean;
    export { leaf_14 as leaf };
    let open_14: boolean;
    export { open_14 as open };
    let close_14: boolean;
    export { close_14 as close };
    export function enter_7(node: any, token: any, callback: any): void;
    export { enter_7 as enter };
}
declare namespace paragraphOpenRule {
    let tag_15: string;
    export { tag_15 as tag };
    let leaf_15: boolean;
    export { leaf_15 as leaf };
    let open_15: boolean;
    export { open_15 as open };
    let close_15: boolean;
    export { close_15 as close };
    export function enter_8(node: any, token: any, callback: any): void;
    export { enter_8 as enter };
}
declare namespace paragraphCloseRule {
    let tag_16: string;
    export { tag_16 as tag };
    let leaf_16: boolean;
    export { leaf_16 as leaf };
    let open_16: boolean;
    export { open_16 as open };
    let close_16: boolean;
    export { close_16 as close };
}
declare namespace headingOpenRule {
    let tag_17: string;
    export { tag_17 as tag };
    let leaf_17: boolean;
    export { leaf_17 as leaf };
    let open_17: boolean;
    export { open_17 as open };
    let close_17: boolean;
    export { close_17 as close };
    export function enter_9(node: any, token: any, callback: any): void;
    export { enter_9 as enter };
}
declare namespace headingCloseRule {
    let tag_18: string;
    export { tag_18 as tag };
    let leaf_18: boolean;
    export { leaf_18 as leaf };
    let open_18: boolean;
    export { open_18 as open };
    let close_18: boolean;
    export { close_18 as close };
}
declare namespace blockQuoteOpenRule {
    let tag_19: string;
    export { tag_19 as tag };
    let leaf_19: boolean;
    export { leaf_19 as leaf };
    let open_19: boolean;
    export { open_19 as open };
    let close_19: boolean;
    export { close_19 as close };
    export function enter_10(node: any, token: any, callback: any): void;
    export { enter_10 as enter };
}
declare namespace blockQuoteCloseRule {
    let tag_20: string;
    export { tag_20 as tag };
    let leaf_20: boolean;
    export { leaf_20 as leaf };
    let open_20: boolean;
    export { open_20 as open };
    let close_20: boolean;
    export { close_20 as close };
}
declare namespace bulletListOpenRule {
    let tag_21: string;
    export { tag_21 as tag };
    let leaf_21: boolean;
    export { leaf_21 as leaf };
    let open_21: boolean;
    export { open_21 as open };
    let close_21: boolean;
    export { close_21 as close };
    export function enter_11(node: any, token: any, callback: any): void;
    export { enter_11 as enter };
}
declare namespace bulletListCloseRule {
    let tag_22: string;
    export { tag_22 as tag };
    let leaf_22: boolean;
    export { leaf_22 as leaf };
    let open_22: boolean;
    export { open_22 as open };
    let close_22: boolean;
    export { close_22 as close };
}
declare namespace orderedListOpenRule {
    let tag_23: string;
    export { tag_23 as tag };
    let leaf_23: boolean;
    export { leaf_23 as leaf };
    let open_23: boolean;
    export { open_23 as open };
    let close_23: boolean;
    export { close_23 as close };
    export function enter_12(node: any, token: any, callback: any): void;
    export { enter_12 as enter };
}
declare namespace orderedListCloseRule {
    let tag_24: string;
    export { tag_24 as tag };
    let leaf_24: boolean;
    export { leaf_24 as leaf };
    let open_24: boolean;
    export { open_24 as open };
    let close_24: boolean;
    export { close_24 as close };
}
declare namespace listItemOpenRule {
    let tag_25: string;
    export { tag_25 as tag };
    let leaf_25: boolean;
    export { leaf_25 as leaf };
    let open_25: boolean;
    export { open_25 as open };
    let close_25: boolean;
    export { close_25 as close };
    export function enter_13(node: any, token: any, callback: any): void;
    export { enter_13 as enter };
}
declare namespace listItemCloseRule {
    let tag_26: string;
    export { tag_26 as tag };
    let leaf_26: boolean;
    export { leaf_26 as leaf };
    let open_26: boolean;
    export { open_26 as open };
    let close_26: boolean;
    export { close_26 as close };
}
declare namespace tableOpenRule {
    let tag_27: string;
    export { tag_27 as tag };
    let leaf_27: boolean;
    export { leaf_27 as leaf };
    let open_27: boolean;
    export { open_27 as open };
    let close_27: boolean;
    export { close_27 as close };
    export function enter_14(node: any, token: any, callback: any): void;
    export { enter_14 as enter };
}
declare namespace tableCloseRule {
    let tag_28: string;
    export { tag_28 as tag };
    let leaf_28: boolean;
    export { leaf_28 as leaf };
    let open_28: boolean;
    export { open_28 as open };
    let close_28: boolean;
    export { close_28 as close };
}
declare namespace tableHeadOpenRule {
    let tag_29: string;
    export { tag_29 as tag };
    let leaf_29: boolean;
    export { leaf_29 as leaf };
    let open_29: boolean;
    export { open_29 as open };
    let close_29: boolean;
    export { close_29 as close };
    export function enter_15(node: any, token: any, callback: any): void;
    export { enter_15 as enter };
}
declare namespace tableHeadCloseRule {
    let tag_30: string;
    export { tag_30 as tag };
    let leaf_30: boolean;
    export { leaf_30 as leaf };
    let open_30: boolean;
    export { open_30 as open };
    let close_30: boolean;
    export { close_30 as close };
}
declare namespace tableBodyOpenRule {
    let tag_31: string;
    export { tag_31 as tag };
    let leaf_31: boolean;
    export { leaf_31 as leaf };
    let open_31: boolean;
    export { open_31 as open };
    let close_31: boolean;
    export { close_31 as close };
    export function enter_16(node: any, token: any, callback: any): void;
    export { enter_16 as enter };
}
declare namespace tableBodyCloseRule {
    let tag_32: string;
    export { tag_32 as tag };
    let leaf_32: boolean;
    export { leaf_32 as leaf };
    let open_32: boolean;
    export { open_32 as open };
    let close_32: boolean;
    export { close_32 as close };
}
declare namespace tableRowOpenRule {
    let tag_33: string;
    export { tag_33 as tag };
    let leaf_33: boolean;
    export { leaf_33 as leaf };
    let open_33: boolean;
    export { open_33 as open };
    let close_33: boolean;
    export { close_33 as close };
    export function enter_17(node: any, token: any, callback: any): void;
    export { enter_17 as enter };
}
declare namespace tableRowCloseRule {
    let tag_34: string;
    export { tag_34 as tag };
    let leaf_34: boolean;
    export { leaf_34 as leaf };
    let open_34: boolean;
    export { open_34 as open };
    let close_34: boolean;
    export { close_34 as close };
}
declare namespace headerCellOpenRule {
    let tag_35: string;
    export { tag_35 as tag };
    let leaf_35: boolean;
    export { leaf_35 as leaf };
    let open_35: boolean;
    export { open_35 as open };
    let close_35: boolean;
    export { close_35 as close };
    export function enter_18(node: any, token: any, callback: any): void;
    export { enter_18 as enter };
}
declare namespace headerCellCloseRule {
    let tag_36: string;
    export { tag_36 as tag };
    let leaf_36: boolean;
    export { leaf_36 as leaf };
    let open_36: boolean;
    export { open_36 as open };
    let close_36: boolean;
    export { close_36 as close };
}
declare namespace tableCellOpenRule {
    let tag_37: string;
    export { tag_37 as tag };
    let leaf_37: boolean;
    export { leaf_37 as leaf };
    let open_37: boolean;
    export { open_37 as open };
    let close_37: boolean;
    export { close_37 as close };
    export function enter_19(node: any, token: any, callback: any): void;
    export { enter_19 as enter };
}
declare namespace tableCellCloseRule {
    let tag_38: string;
    export { tag_38 as tag };
    let leaf_38: boolean;
    export { leaf_38 as leaf };
    let open_38: boolean;
    export { open_38 as open };
    let close_38: boolean;
    export { close_38 as close };
}
export namespace inlines {
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
export namespace blocks {
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
