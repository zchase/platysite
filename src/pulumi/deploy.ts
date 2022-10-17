import * as program from "./program";

export async function AWSDeployWebsite(args: program.StaticWebsiteArgs<"aws">, handler: program.OutputHandler): Promise<string> {
    return await program.UpdateStaticWebsite<"aws">(args, handler);
}

export async function AzureDeployWebsite(args: program.StaticWebsiteArgs<"azure">, handler: program.OutputHandler): Promise<string> {
    return await program.UpdateStaticWebsite<"azure">(args, handler);
}

export async function GoogleDeployWebsite(args: program.StaticWebsiteArgs<"google">, handler: program.OutputHandler): Promise<string> {
    return await program.UpdateStaticWebsite<"google">(args, handler);
}
