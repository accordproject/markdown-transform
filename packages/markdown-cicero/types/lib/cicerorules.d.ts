declare namespace formulaRule {
    let tag: string;
    let leaf: boolean;
    let open: boolean;
    let close: boolean;
    function enter(node: any, token: any, callback: any): void;
    let skipEmpty: boolean;
}
declare namespace clauseOpenRule {
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
}
declare namespace clauseCloseRule {
    let tag_2: string;
    export { tag_2 as tag };
    let leaf_2: boolean;
    export { leaf_2 as leaf };
    let open_2: boolean;
    export { open_2 as open };
    let close_2: boolean;
    export { close_2 as close };
}
export namespace inlines {
    export { formulaRule as formula };
}
export namespace blocks {
    export { clauseOpenRule as block_clause_open };
    export { clauseCloseRule as block_clause_close };
}
export {};
