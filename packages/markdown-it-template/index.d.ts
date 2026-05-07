export interface MarkdownItLike {
    inline: {
        ruler: {
            before(name: string, ruleName: string, rule: (...args: unknown[]) => unknown): void;
        };
    };
    block: {
        ruler: {
            before(
                name: string,
                ruleName: string,
                rule: (...args: unknown[]) => unknown,
                options?: Record<string, unknown>
            ): void;
        };
    };
    renderer: {
        rules: Record<string, (...args: unknown[]) => unknown>;
    };
}

declare function templatePlugin(md: MarkdownItLike): void;

export = templatePlugin;
