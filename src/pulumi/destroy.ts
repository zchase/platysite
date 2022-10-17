import * as program from "./program";

export async function AWSDestroyWebsite(args: program.StaticWebsiteArgs<"aws">, handler: program.OutputHandler): Promise<void> {
    return await program.DestroyStaticWebsite<"aws">(args, handler);
}

export async function AzureDestroyWebsite(args: program.StaticWebsiteArgs<"azure">, handler: program.OutputHandler): Promise<void> {
    return await program.DestroyStaticWebsite<"azure">(args, handler);
}

export async function GoogleDestroyWebsite(args: program.StaticWebsiteArgs<"google">, handler: program.OutputHandler): Promise<void> {
    return await program.DestroyStaticWebsite<"google">(args, handler);
}
