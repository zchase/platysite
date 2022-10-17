import { Command } from "./command";
import * as config from "../config";
import { deploy, pulumiProjectName } from "../pulumi";
import { PulumiAction } from "../tui/pulumiAction";

interface DeployArgs {
    cloud: string;
    sitePath: string;
    region: string;
    environment: string;
}

class Deploy implements Command<DeployArgs> {
    public name = "deploy [environment]";
    public aliases = [];
    public description = "Deploy your static website.";
    public opts = {
        environment: {
            description: "The environment you want to deploy to.",
            default: "",
        },
        cloud: {
            choices: [ "aws", "azure", "google" ],
            description: `The cloud provider you want to deploy to.`,
            default: "",
        },
        sitePath: {
            description: "The path to the directory containing your website contents.",
            default: "",
        },
        region: {
            description: "The region, location, or zone you want to deploy your website to.",
            default: "",
        },
    };

    public async handler(args: DeployArgs): Promise<void> {
        const view = new PulumiAction({ msg: "configuring website" });

        let stackConfigArgs: config.StackConfig;
        try {
            stackConfigArgs = config.readConfig(args.environment);
        } catch (e) {
            view.updateMessage("no config file found, creating new stack");

            if (!args.cloud) {
                throw new Error("required flag --cloud not provided");
            }

            if (!args.sitePath) {
                throw new Error("required flag --sitePath not provided");
            }

            if (!args.region) {
                throw new Error("required flag --region not provided");
            }

            stackConfigArgs = {
                pulumiProjectName,
                pulumiStackName: args.environment,
                cloud: args.cloud,
                region: args.region,
                sitePath: args.sitePath,
                args: {},
            }
        }

        view.updateMessage("updating website");
        view.incrementProgressBar(10);

        const handlePulumiOutput = (msg: string) => {
            // TODO make this better.
            view.incrementProgressBar(2);
        };

        let websiteUrl: string;
        switch (args.cloud) {
            case "aws":
                websiteUrl = await deploy.AWSDeployWebsite(stackConfigArgs, handlePulumiOutput);
                break;
            case "azure":
                websiteUrl = await deploy.AzureDeployWebsite(stackConfigArgs, handlePulumiOutput);
                break;
            case "google":
                websiteUrl = await deploy.GoogleDeployWebsite(stackConfigArgs, handlePulumiOutput);
                break;
            default:
                throw new Error(`unknown cloud provider [${args.cloud}}`);
        }

        const stackConfig = new config.Config(stackConfigArgs);
        stackConfig.write();
        view.updateMessage("Finalizing updated");
        await view.finishProgressBar();

        view.updateMessage("Website live at: " + websiteUrl);
    }
}

export default new Deploy();
