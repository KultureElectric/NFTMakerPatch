"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const util_1 = require("../util");
const path_1 = __importDefault(require("path"));
async function createImage() {
    const { size } = (0, util_1.resolveConfiguration)();
    return await (0, sharp_1.default)({
        create: {
            width: size.width,
            height: size.height,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 0 },
        },
    })
        .png()
        .toBuffer();
}
async function compositeImage(image, item) {
    return await (0, sharp_1.default)(image)
        .composite(Object.keys(item)
        .filter((key) => (0, util_1.shouldOutputTrait)(key))
        .map((key) => {
        const fileName = item[key].image || item[key].name;
        const pathSegments = `./traits/${key}/${fileName}.png`;
        return { input: path_1.default.resolve(pathSegments), gravity: 'center' };
    }))
        .toBuffer();
}
async function default_1(task) {
    const manifest = (0, util_1.resolveManifest)();
    for (const item of manifest) {
        const key = manifest.indexOf(item);
        const filePath = path_1.default.resolve(`./assets/${key}.png`);
        if (task)
            task.output = `Creating image at '${filePath}'`;
        let image = await createImage();
        image = await compositeImage(image, item);
        const { imageOptions } = (0, util_1.resolveConfiguration)();
        if (imageOptions) {
            image = await Object.keys(imageOptions).reduce(async (carry, option) => {
                // @ts-ignore
                return await (0, sharp_1.default)(image)[option](imageOptions[option]).toBuffer();
            }, []);
        }
        try {
            await (0, sharp_1.default)(image).toFile(filePath);
        }
        catch (err) {
            (0, util_1.fail)(`Failed to generate image: ${err.toString()}`);
        }
    }
}
exports.default = default_1;
