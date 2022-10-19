import { STSClient, GetCallerIdentityCommand, GetCallerIdentityCommandOutput } from "@aws-sdk/client-sts";

export async function verifyCreds(region: string): Promise<GetCallerIdentityCommandOutput> {
    const sts = new STSClient({ region });
    const command = new GetCallerIdentityCommand({});
    return await sts.send(command);
}
