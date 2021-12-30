"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validUnique = exports.traitIsCompatibleWithCurrentImage = exports.getRandomWeightedTrait = exports.createNewImage = exports.createNewUniqueImage = void 0;
const fs_1 = __importDefault(require("fs"));
const util_1 = require("../util");
const lodash_1 = require("lodash");
let imageData = [];
let attempts = 0;
let maxNumberOfAttempts = 0;
async function default_1(task) {
    const { maxAttempts, uniques, editionSize } = (0, util_1.resolveConfiguration)();
    maxNumberOfAttempts = maxAttempts;
    prepareOutputFolder();
    uniques.forEach((u) => {
        if (validUnique(u)) {
            imageData.push(u);
        }
    });
    (0, lodash_1.times)(editionSize - uniques.length, () => {
        attempts++;
        if (attempts == maxNumberOfAttempts) {
            (0, util_1.fail)(`Could not find a unique image after ${attempts} attempts.`);
        }
        imageData.push(createNewUniqueImage());
        attempts = 0;
    });
    imageData = (0, lodash_1.shuffle)(imageData);
    imageData = assignTokenIds(imageData);
    fs_1.default.writeFileSync('./manifest.json', JSON.stringify(imageData, null, 2), {
        flag: 'w',
    });
}
exports.default = default_1;
function assignTokenIds(imageData) {
    return imageData.map((item, key) => {
        item['tokenId'] = key + 1;
        return item;
    });
}
function prepareOutputFolder() {
    let assetsDir = './assets';
    if (fs_1.default.existsSync(assetsDir)) {
        fs_1.default.rmdirSync(assetsDir, { recursive: true });
    }
}
function createNewUniqueImage() {
    let newImage = createNewImage();
    if (duplicateFound(imageData, newImage)) {
        return createNewUniqueImage();
    }
    attempts = 0;
    return newImage;
}
exports.createNewUniqueImage = createNewUniqueImage;
function duplicateFound(imageData, newImage) {
    return imageData.reduce((foundDuplicate, image) => {
        if (foundDuplicate) {
            return true;
        }
        foundDuplicate = (0, lodash_1.isEqual)(image, newImage);
        return foundDuplicate;
    }, false);
}
function createNewImage() {
    const { order } = (0, util_1.resolveConfiguration)();
    return order.reduce((existing, trait) => {
        return {
            ...existing,
            [trait]: getRandomWeightedTrait(trait, existing),
        };
    }, {});
}
exports.createNewImage = createNewImage;
function getRandomWeightedTrait(trait, existing) {
    const { traits } = (0, util_1.resolveConfiguration)();
    const category = (0, lodash_1.find)(traits, (t) => t.name == trait);
    // Find compatible category trait items for the existing object
    // If it's the first time to find a trait we'll just grab
    // whichever one we want since there's nothing to check.
    let items = category.items;
    items = items.filter((trait) => {
        return traitIsCompatibleWithCurrentImage(category, trait, existing);
    });
    if (items.length == 0) {
        (0, util_1.fail)(`Could not generate unique image because there are no compatible traits for ${trait}`);
    }
    (0, lodash_1.shuffle)(items);
    let choices = items.reduce((carry, item, key) => {
        return carry.concat(new Array(item.weight).fill(key));
    }, []);
    // Shuffle the choices
    (0, lodash_1.shuffle)(choices);
    // Pull a random
    let choice = Math.floor(Math.random() * (choices.length - 1));
    let index = choices[choice];
    return {
        name: items[index].name,
        image: items[index].image || items[index].name,
    };
}
exports.getRandomWeightedTrait = getRandomWeightedTrait;
function traitIsCompatibleWithCurrentImage(category, maybeTrait, existing) {
    // This is the first trait for the image, so we can pick literally anything.
    if (Object.keys(existing).length === 0) {
        return true;
    }
    // Backwards Check
    const closure = maybeTrait.conflicts;
    let backwards = true;
    if (closure) {
        backwards = Object.keys(existing).reduce((carry, val) => {
            // @ts-ignore
            let result = !closure(val, existing[val].name);
            if (!carry) {
                return false;
            }
            return result;
        }, true);
    }
    const forwards = Object.keys(existing).reduce((carry, existingVal) => {
        let singleItem = (0, util_1.getSingleTraitItemConfiguration)(existingVal, 
        // @ts-ignore
        existing[existingVal].name);
        let closure = singleItem.conflicts;
        if (closure) {
            let result = !closure(category.name, maybeTrait.name);
            if (!carry) {
                return false;
            }
            return result;
        }
        return true;
    }, true);
    return backwards && forwards;
}
exports.traitIsCompatibleWithCurrentImage = traitIsCompatibleWithCurrentImage;
function validUnique(unique) {
    const { order } = (0, util_1.resolveConfiguration)();
    Object.keys(unique).forEach(trait => {
        if (!order.includes(trait)) {
            (0, util_1.fail)(`Invalid unique: ${trait}`);
        }
    });
    return true;
}
exports.validUnique = validUnique;
