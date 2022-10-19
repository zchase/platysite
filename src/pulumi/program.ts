import * as pulumi from "@pulumi/pulumi";
import * as auto from "@pulumi/pulumi/automation";
import * as aws from "@pulumi/aws-static-website";
import * as azure from "@pulumi/azure-static-website";
import * as google from "@pulumi/google-cloud-static-website";
import * as config from "../config";

export type StaticWebsiteArgs<T extends config.Cloud> = config.StackConfig<T>;

export interface StaticWebsiteResult {
    url: string;
}

export interface OutputHandler {
    (msg: string): void;
}

export async function UpdateStaticWebsite<T extends config.Cloud>(args: StaticWebsiteArgs<T>, handler: OutputHandler): Promise<string> {
    const stack = await createStaticWebsiteProgram<T>(args);

    const upRes = await stack.up({ onOutput: handler });
    return upRes.outputs.url.value;
}

export async function DestroyStaticWebsite<T extends config.Cloud>(args: StaticWebsiteArgs<T>, handler: OutputHandler): Promise<void> {
    const stack = await createStaticWebsiteProgram<T>(args);

    await stack.destroy({ onOutput: handler });
    await stack.workspace.removeStack(stack.name);
}

async function createStaticWebsiteProgram<T extends config.Cloud>(args: StaticWebsiteArgs<T>) {
    const stackArgs: auto.InlineProgramArgs = {
        projectName: args.pulumiProjectName,
        stackName: args.pulumiStackName,
        program: createStaticWebsiteInfra<T>(args),
    };

    const stack = await auto.LocalWorkspace.createOrSelectStack(stackArgs);

    const whoAmI = await stack.workspace.whoAmI();
    let orgName = whoAmI.user;
    const stackNameParts = args.pulumiStackName.split("/");
    if (stackNameParts.length > 1) {
        orgName = stackNameParts[0];
    }

    // Install plugins
    switch (args.cloud) {
        case "aws":
            // TODO figure out what to do about plugin stuff
            //await stack.workspace.installPlugin("aws-static-website", "v0.2.0");
            await stack.setConfig("aws:region", { value: args.region });
            await stack.setConfig("pulumiOrganizationName", { value: orgName });
            break;
        case "azure":
            //await stack.workspace.installPlugin("azure-static-website", "v0.0.3");
            await stack.setConfig("azure-native:location", { value: args.region });
            break;
        case "google":
            //await stack.workspace.installPlugin("google-static-website", "v0.0.3");
            await stack.setConfig("gcp:zone", { value: args.region });
            await stack.setConfig("gcp:project", { value: args.googleCloudProjectId });
            break;
        default:
            throw new Error(`unsupported cloud provided [${args.cloud}]`);
    }

    return stack;
}

function createStaticWebsiteInfra<T extends config.Cloud>(args: StaticWebsiteArgs<T>) {
    return async () => {
        let url: pulumi.Output<string>;
        switch (args.cloud) {
            case "aws":
                url = createAWSInfra(args as StaticWebsiteArgs<"aws">);
                break;
            case "azure":
                url = createAzureInfra(args as StaticWebsiteArgs<"azure">);
                break;
            case "google":
                url = createGoogleInfra(args as StaticWebsiteArgs<"google">);
                break;
            default:
                throw new Error(`unsupported cloud provided [${args.cloud}]`);
        }

        return { url };
    };
}

function createAWSInfra(args: StaticWebsiteArgs<"aws">) {
    const webArgs: aws.WebsiteArgs = Object.assign({}, {
        sitePath: args.sitePath,
        atomicDeployments: true,
    }, args);

    const webInfra = new aws.Website(args.pulumiProjectName, webArgs);

    return webInfra.websiteURL;
}

function createAzureInfra(args: StaticWebsiteArgs<"azure">) {
    const webArgs: azure.WebsiteArgs = Object.assign({}, {
        sitePath: args.sitePath,
    }, args);

    const webInfra = new azure.Website(args.pulumiProjectName, webArgs);

    return webInfra.originURL;
}

function createGoogleInfra(args: StaticWebsiteArgs<"google">) {
    const webArgs: google.WebsiteArgs = Object.assign({}, {
        sitePath: args.sitePath,
    }, args);

    const webInfra = new google.Website(args.pulumiProjectName, webArgs);

    return webInfra.originURL;
}
