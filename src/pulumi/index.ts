import { execSync } from "child_process";
import * as deploy from "./deploy";
import * as destroy from "./destroy";

export const pulumiProjectName = "platysite";

export function validateCreds(): boolean {
    try {
        execSync("pulumi whoami --non-interactive", {stdio : "pipe" });
        return true;
    } catch (e) {
        return false;
    }
}

export {
    deploy,
    destroy,
};
