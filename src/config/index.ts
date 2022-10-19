import * as fs from "fs";
import * as path from "path";
import * as aws from "@pulumi/aws-static-website";
import * as azure from "@pulumi/azure-static-website";
import * as google from "@pulumi/google-cloud-static-website";

// TODO: add regions for azure and gcp.
import { Region as awsRegion } from "@pulumi/aws";

const configDir = ".platysite";

type AwsCloud = "aws";
type AzureCloud = "azure";
type GoogleCloud = "google";

export type Cloud = AwsCloud | AzureCloud | GoogleCloud;

type WebsiteArgs<T extends Cloud = any> = T extends AwsCloud ? Omit<aws.WebsiteArgs, "sitePath"> :
    T extends AzureCloud ? Omit<azure.WebsiteArgs, "sitePath"> :
    T extends GoogleCloud ? Omit<google.WebsiteArgs, "sitePath"> : unknown;

export interface StackConfig<C extends Cloud = any> {
    pulumiProjectName: string;
    pulumiStackName: string;
    cloud: C;
    region: C extends AwsCloud ? awsRegion : string;
    sitePath: string;
    args: WebsiteArgs<C>;
    googleCloudProjectId: string;
}

export class Config<C extends Cloud> {
    public pulumiProjectName: string;
    public pulumiStackName: string;
    public cloud: C;
    public region: C extends AwsCloud ? awsRegion : string;
    public sitePath: string;
    public googleCloudProjectId: string;
    public args: WebsiteArgs<C>;

    constructor(
        args: StackConfig<C>,
    ) {
        this.pulumiProjectName = args.pulumiProjectName;
        this.pulumiStackName = args.pulumiStackName;
        this.cloud = args.cloud;
        this.region = args.region;
        this.sitePath = args.sitePath;
        this.googleCloudProjectId = args.googleCloudProjectId;
        this.args = args.args;
    }

    public write() {
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir);
        }

        const config: StackConfig<C> = {
            pulumiProjectName: this.pulumiProjectName,
            pulumiStackName: this.pulumiStackName,
            cloud: this.cloud,
            region: this.region,
            sitePath: this.sitePath,
            googleCloudProjectId: this.googleCloudProjectId,
            args: this.args,
        };

        const configPath = path.join(configDir, `${this.pulumiStackName}.json`);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
    }

    public remove() {
        const configPath = path.join(configDir, `${this.pulumiStackName}.json`);
        fs.rmSync(configPath);
    }
}

export function readConfig(name: string) {
    const configPath = path.join(configDir, `${name}.json`);
    const configContents = fs.readFileSync(configPath).toString();
    const unknownConfig: StackConfig = JSON.parse(configContents);

    switch (unknownConfig.cloud) {
        case "aws":
            return new Config<AwsCloud>(unknownConfig);
        case "azure":
            return new Config<AzureCloud>(unknownConfig);
        case "google":
            return new Config<GoogleCloud>(unknownConfig);
        default:
            throw new Error(`unknown cloud found in config [${unknownConfig.cloud}]`)
    }
}
