import { Command } from "./command";
import * as config from "../config";
import { destroy, validateCreds } from "../pulumi";
import { PulumiAction } from "../tui/pulumiAction";

interface DestroyArgs {
    environment: string;
}

class Destroy implements Command<DestroyArgs> {
    public name = "destroy [environment]";
    public aliases = [];
    public description = "Destroy your static website.";
    public opts = {
        environment: {
            description: "The name of the environment to destroy.",
            default: "",
        },
    };

    public async handler(args: DestroyArgs): Promise<void> {
        const view = new PulumiAction({ msg: "configuring task" });

        let stackConfigArgs: config.StackConfig;
        try {
            stackConfigArgs = config.readConfig(args.environment);
        } catch (e) {
            throw new Error(`no config found for environment [${args.environment}]`);
        }

        const validPulumiCreds = validateCreds();
        if (!validPulumiCreds) {
            throw new Error("no valid Pulumi backend found, please run `pulumi login`");
        }

        view.updateMessage("destroying website");
        view.incrementProgressBar(10);

        const outputHandler = (msg: string) => {
            // TODO make this better.
            view.incrementProgressBar(2);
        };

        switch (stackConfigArgs.cloud) {
            case "aws":
                await destroy.AWSDestroyWebsite(stackConfigArgs, outputHandler);
                break;
            case "azure":
                await destroy.AzureDestroyWebsite(stackConfigArgs, outputHandler);
                break;
            case "google":
                await destroy.GoogleDestroyWebsite(stackConfigArgs, outputHandler);
                break;
            default:
                throw new Error(`unknown cloud provider [${stackConfigArgs.cloud}}`);
        }

        const stackConfig = new config.Config(stackConfigArgs);
        stackConfig.remove();

        await view.finishProgressBar();
        view.updateMessage("website destroyed");
    }
}

export default new Destroy();
