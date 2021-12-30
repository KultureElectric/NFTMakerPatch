"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldOutputTrait = exports.shouldIncludeTraitInMetadata = exports.getSingleTraitItemConfiguration = exports.getSingleTraitConfiguration = exports.resolveManifest = exports.resolveConfiguration = exports.fail = exports.dd = exports.info = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
function info(msg) {
    return console.info(msg);
}
exports.info = info;
function dd(...what) {
    console.log(...what);
    process.exit(1);
}
exports.dd = dd;
function fail(msg) {
    info(chalk_1.default.red(msg));
    process.exit(1);
}
exports.fail = fail;
function resolveConfiguration() {
    let configLocation = path_1.default.resolve('./config.js');
    return fs_1.default.existsSync(configLocation)
        ? require(configLocation)
        : fail('Could not find the project configuration.');
}
exports.resolveConfiguration = resolveConfiguration;
function resolveManifest() {
    let manifestLocation = path_1.default.resolve('./manifest.json');
    if (fs_1.default.existsSync(manifestLocation)) {
        let rawData = fs_1.default.readFileSync(manifestLocation);
        return JSON.parse(rawData.toString());
    }
    fail('Could not find the project manifest.');
}
exports.resolveManifest = resolveManifest;
function getSingleTraitConfiguration(trait) {
    const { traits } = resolveConfiguration();
    return traits.filter((t) => t.name === trait)[0];
}
exports.getSingleTraitConfiguration = getSingleTraitConfiguration;
function getSingleTraitItemConfiguration(category, itemName) {
    let itemConfig = getSingleTraitConfiguration(category);
    return itemConfig.items.filter((itemConfigItem) => {
        return itemConfigItem.name == itemName;
    })[0];
}
exports.getSingleTraitItemConfiguration = getSingleTraitItemConfiguration;
function shouldIncludeTraitInMetadata(trait) {
    const { order } = resolveConfiguration();
    if (trait == 'tokenId')
        return false;
    const foundInOrderConfig = order.includes(trait);
    const singleTrait = getSingleTraitConfiguration(trait);
    if (foundInOrderConfig) {
        if (singleTrait.options?.exclude !== undefined) {
            return !singleTrait.options.exclude;
        }
        return true;
    }
}
exports.shouldIncludeTraitInMetadata = shouldIncludeTraitInMetadata;
function shouldOutputTrait(trait) {
    if (trait == 'tokenId')
        return false;
    const { order } = resolveConfiguration();
    const foundInOrderConfig = order.includes(trait);
    const singleTrait = getSingleTraitConfiguration(trait);
    if (foundInOrderConfig) {
        if (singleTrait.options?.metadataOnly !== undefined) {
            return !singleTrait.options.metadataOnly;
        }
        return true;
    }
}
exports.shouldOutputTrait = shouldOutputTrait;
