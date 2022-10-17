import yargs from "yargs";

//@ts-ignore
import { hideBin } from "yargs/helpers";

export interface CommandOptions {
    [key: string]: yargs.Options;
}

export abstract class Command<T = {}> {
    public name!: string;
    public aliases!: string[];
    public description!: string;
    public opts!: CommandOptions;

    abstract handler(argv: T): Promise<void>;
}

class HelpCommand implements Command {
    public name = "help";
    public aliases = [ "$0" ];
    public description = "Information about using the CLI."
    public opts = {};
    public handler: (argv: any) => Promise<void>;

    constructor(helpFunction: () => Promise<string>) {
        this.handler = async (_argv: any) => {
            const result = await helpFunction();
            console.log(result);
        };
    }
}

export default class CLI {
    private argv: yargs.Argv = Object.create({});

    public addCLICommands(commands: Command[]) {
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            this.argv.command([ command.name, ...command.aliases ], command.description, command.opts, command.handler);
        }
    }

    public async helpText(): Promise<string> {
        return await this.argv.getHelp();
    }

    async invokeCLI(cliArgs: string[], commands: Command[]) {
        this.argv = yargs(hideBin(cliArgs));

        this.argv
            .usage("Usage: $0 <command> [options]")
            .strict();

        commands.push(new HelpCommand(this.helpText.bind(this)));

        this.addCLICommands(commands);

        await this.argv.argv;
    }
}
