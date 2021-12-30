"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.desc = exports.command = void 0;
const actions_1 = require("../actions");
exports.command = 'stats';
exports.desc = 'Generate the statistics for the NFTs';
const handler = () => {
    (0, actions_1.generateStats)();
    process.exit(0);
};
exports.handler = handler;
