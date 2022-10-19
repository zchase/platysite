import { Command } from "./command";
import * as config from "../config";
import { deploy, pulumiProjectName, validateCreds } from "../pulumi";
import { PulumiAction } from "../tui/pulumiAction";
import { aws } from "../utils";

interface DeployArgs {
    cloud: string;
    sitePath: string;
    region: string;
    environment: string;
    googleCloudProjectId?: string;
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
        googleCloudProjectId: {
            description: "The id of your Google Cloud Project.",
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

            if (args.cloud === "google" && !args.googleCloudProjectId) {
                throw new Error("required flat --googleCloudProjectName not provided");
            }

            stackConfigArgs = {
                pulumiProjectName,
                pulumiStackName: args.environment,
                cloud: args.cloud,
                region: args.region,
                sitePath: args.sitePath,
                googleCloudProjectId: args.googleCloudProjectId ?? "",
                args: {},
            }
        }

        const validPulumiCreds = validateCreds();
        if (!validPulumiCreds) {
            throw new Error("no valid Pulumi backend found, please run `pulumi login`");
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
                try {
                    const creds = await aws.verifyCreds(stackConfigArgs.region);
                    view.updateMessage(`Deploying into AWS Account: ${creds.Account}`);
                } catch (e) {
                    throw new Error(`verifying AWS credentials: ${e}`);
                }

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
