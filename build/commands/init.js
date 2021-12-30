"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
const listr2_1 = require("listr2");
const delay_1 = __importDefault(require("delay"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.command = 'init';
exports.desc = 'Initialize a configuration file based on the traits folder';
const builder = yargs => yargs.option('force', {
    alias: 'f',
    demandOption: true,
    default: false,
    type: 'boolean',
    describe: 'Force creation of the configuration file',
});
exports.builder = builder;
function getTasks(force) {
    return new listr2_1.Listr([
        {
            title: 'Checking for existing configuration file...',
            task: async (ctx, task) => {
                await (0, delay_1.default)(500);
                let configPath = path_1.default.resolve('./config.js');
                let configPathExists = fs_1.default.existsSync(configPath);
                if (configPathExists && force) {
                    task.title = 'Forcing overwrite of configuration file.';
                }
                if (configPathExists && !force) {
                    task.title =
                        'Configuration file already configPathExists. Skipping!';
                    ctx.skip = true;
                }
                if (!configPathExists) {
                    task.title = 'No configuration file found. Creating one...';
                }
            },
        },
        {
            title: 'Writing configuration file...',
            skip: (ctx) => ctx.skip,
            task: async (ctx, task) => {
                await (0, delay_1.default)(500);
                const traitsPath = path_1.default.resolve('./traits');
                const traitsPathExists = fs_1.default.existsSync(traitsPath);
                let stub = require('../../config.stub');
                // If we're here it's because we're either forcing the creation of the configuration file or we're creating a new one. The only concern is if we have a traits folder or not.
                if (traitsPathExists) {
                    task.title = 'Traits folder exists...writing configuration.';
                    let traits = fs_1.default.readdirSync(traitsPath);
                    stub.traits = traits
                        .filter(t => t !== '.DS_Store')
                        .map(trait => {
                        let itemsPath = path_1.default.resolve(`./traits/${trait}`);
                        let items = fs_1.default
                            .readdirSync(itemsPath)
                            .filter(item => !/(^|\/)\.[^\/\.]/g.test(item));
                        return {
                            name: trait,
                            items: items.map(item => {
                                return { name: item.replace('.png', ''), weight: 10 };
                            }),
                        };
                    });
                }
                else {
                    task.title =
                        "Traits folder doesn't exist. Generated a default configuration file.";
                    stub.uniques = [
                        {
                            Background: { name: 'Black' },
                            Foreground: { name: 'White' },
                        },
                    ];
                    stub.traits = [
                        {
                            name: 'Background',
                            items: [
                                { name: 'Black', weight: 20 },
                                { name: 'White', weight: 20 },
                            ],
                        },
                        {
                            name: 'Foreground',
                            items: [
                                { name: 'Black', weight: 20 },
                                { name: 'White', weight: 20 },
                            ],
                        },
                    ];
                }
                fs_1.default.writeFileSync('./config.js', 'module.exports = ' + JSON.stringify(stub, null, 2), {
                    flag: 'w',
                });
            },
        },
    ], { concurrent: false });
}
const handler = (argv) => {
    getTasks(argv.force)
        .run()
        .catch(err => {
        console.error(err);
    })
        .finally(() => {
        process.exit(0);
    });
};
exports.handler = handler;
