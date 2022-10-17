import CLI from "./src/cli/command";
import * as commands from "./src/cli";

async function main(): Promise<void> {
    const cli = new CLI();

    await cli.invokeCLI(process.argv, [
        commands.Deploy,
        commands.Destroy,
    ]);
}

main().then(() => {
    process.exit(0);
}).catch((err) => {
    console.log(err);
    process.exit(1);
});
