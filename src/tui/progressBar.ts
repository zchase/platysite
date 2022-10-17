import { View } from "./index";
import { time } from "../utils";

export interface ProgressBarState {
    progressLimit?: number;
    currentProgress: number;
}

export class ProgressBar extends View<ProgressBarState> {
    constructor(initialState: ProgressBarState) {
        super(initialState, true);
    }

    public async beforeViewMounts(): Promise<void> {
        if (!this.state.progressLimit) {
            this.state.progressLimit = 100;
            this.updateState(this.state);
        }
    }

    public incrementProgressBar(incrementSize: number) {
        this.state.currentProgress += incrementSize;
        this.updateState(this.state);
    }

    private async completeProgressBar(incrementSize: number): Promise<void> {
        if (this.state.currentProgress >= this.state.progressLimit!) {
            return;
        }

        this.state.currentProgress += incrementSize;
        if (this.state.currentProgress > this.state.progressLimit!) {
            this.state.currentProgress = this.state.progressLimit!;
        }

        this.updateState(this.state);
        await time.sleep(500/incrementSize);
        return await this.completeProgressBar(incrementSize);
    }

    public async finishProgressBar(): Promise<void> {
        const progressRemaining = this.state.progressLimit! - this.state.currentProgress;
        const incrementSize = Math.ceil(progressRemaining/5);
        return await this.completeProgressBar(incrementSize);
    }

    public render(): string {
        let pbParts = "";
        const columns = process.stdout.columns/2;
        const progressLimit = Math.ceil(columns * (this.state.currentProgress/this.state.progressLimit!));
        for (let i = 0; i < columns; i++) {
            if (i < progressLimit) {
                pbParts += "=";
                continue;
            }

            pbParts += "-";
        }
        return `[${pbParts}] ${this.state.currentProgress}%`;
    }
}
