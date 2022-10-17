import { View } from "./index";
import { ProgressBar } from "./progressBar";

interface PulumiActionState {
    msg: string;
}

export class PulumiAction extends View<PulumiActionState> {
    private currentMsg = "";
    private progressBar: ProgressBar = new ProgressBar({ currentProgress: 0, progressLimit: 100 });

    constructor(initialState: PulumiActionState) {
        super(initialState);
    }

    public incrementProgressBar(value: number) {
        this.progressBar.incrementProgressBar(value);
        this.updateState({ msg: this.currentMsg });
    }

    public async finishProgressBar() {
        return await this.progressBar.finishProgressBar();
    }

    public updateMessage(msg: string) {
        this.currentMsg = msg;
        this.updateState({ msg: this.currentMsg });
    }

    public render(): string {
        const pad = "  ";
        const pb = this.progressBar?.render ? this.progressBar.render() : "";

        return "Website Deploy Command:\n" +
            pad + "Current Progress: " + pb + "\n" +
            pad + (this.state.msg || "Initializing");
    }
}
