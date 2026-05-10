declare namespace formulaRule {
    export const tag: string;
    export const leaf: boolean;
    export const open: boolean;
    export const close: boolean;
    export function enter(node: any, token: any, callback: any): void;
    export const skipEmpty: boolean;
}
declare namespace clauseOpenRule {
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
}
declare namespace clauseCloseRule {
    const tag_2: string;
    export { tag_2 as tag };
    const leaf_2: boolean;
    export { leaf_2 as leaf };
    const open_2: boolean;
    export { open_2 as open };
    const close_2: boolean;
    export { close_2 as close };
}
export declare namespace inlines {
    export { formulaRule as formula };
}
export declare namespace blocks {
    export { clauseOpenRule as block_clause_open };
    export { clauseCloseRule as block_clause_close };
}
export {};
