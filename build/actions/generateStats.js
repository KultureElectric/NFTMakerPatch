"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const fs_1 = __importDefault(require("fs"));
function default_1() {
    const manifest = (0, util_1.resolveManifest)();
    let counts = {};
    manifest.forEach((item) => {
        Object.entries(item).forEach(value => {
            const traitCategory = value[0];
            const traitItem = value[1];
            if ((0, util_1.shouldIncludeTraitInMetadata)(traitCategory)) {
                // If the trait category doesn't exist create it...
                if (!(traitCategory in counts)) {
                    counts[traitCategory] = {};
                }
                // If the trait item doesn't exist create it...
                if (!(traitItem.name in counts[traitCategory])) {
                    counts[traitCategory][traitItem.name] = 0;
                }
                // Now increment the trait item...
                counts[traitCategory][traitItem.name]++;
            }
        });
    });
    fs_1.default.writeFileSync('./stats.json', JSON.stringify(counts, null, 2), {
        flag: 'w',
    });
}
exports.default = default_1;
