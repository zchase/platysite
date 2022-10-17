import stringWidth from "string-width";

export abstract class TuiView<T = {}> {
    public abstract state: T;

    public abstract beforeViewMounts(): void;
    public abstract afterViewMounts(): void;
    public abstract render(): string;
    public abstract error(msg: string): void;
}

export class View<T = {}> implements TuiView<T> {
    public state: T;

    private mounted = false;
    private previousLines = 0;
    private lock = false;

    constructor(
        initialState: T,
        private noRender?: boolean,
    ) {
        this.state = initialState;
        this.beforeViewMounts();
        this.print();
        this.mounted = true;
        this.afterViewMounts();
    }

    protected updateState(state: T) {
        this.state = state;
        if (!this.lock && this.mounted) {
            this.print();
            return;
        }
    }

    protected getState(): T {
        return this.state;
    }

    public beforeViewMounts(): void {

    }

    public afterViewMounts(): void {

    }

    public render(): string {
        return "";
    }

    public print(): void {
        if (this.noRender) {
            return;
        }

        this.lock = true;
        const msg = this.render();
        const eraser = this.createEraser();
        process.stdout.write(eraser + msg + "\n");
        this.setPreviousLines(msg + "foo\n");
        this.lock = false;
    }

    public error(msg: string): void {
        process.stderr.write(msg);
        process.exit(1);
    }

    private setPreviousLines(msg: string) {
        let lines = 0;
        const msgParts = msg.split("\n");
        for (const part of msgParts) {
            lines += Math.ceil(stringWidth(part) / process.stdout.columns);
        }
        this.previousLines = lines
    }

    private createEraser(): string {
        let eraser = "";
        for (let i = 0; i <= this.previousLines; i++) {
            eraser += '\u001b[2K\u001b[K';
            if (i < this.previousLines) {
                eraser += '\u001b[1A';
            }
        }
        return eraser;
    }
}
