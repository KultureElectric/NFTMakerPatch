"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = void 0;
const util_1 = require("../util");
const fs_1 = __importDefault(require("fs"));
const delay_1 = __importDefault(require("delay"));
const lodash_1 = require("lodash");
const { take } = require("lodash");
async function default_1(task) {
    const manifest = (0, util_1.resolveManifest)();
    const config = (0, util_1.resolveConfiguration)();
    // Generate assets folder...
    if (task) {
        task.output = 'Generating assets folder...';
    }
    if (!fs_1.default.existsSync('./assets')) {
        fs_1.default.mkdirSync('./assets');
    }

    let dynamicAttributes = [];

    // Generate asset metadata...
    for (const item of manifest) {
        const { tokenId } = item;
        const fileNumber = tokenId - 1;
        let filePath = `./assets/${fileNumber}.json`;
        (0, lodash_1.tap)(createToken(tokenId, item, config), (arg) => {
            if (task) {
                task.output = `Generating asset metadata '${filePath}'`;
            }
            fs_1.default.writeFileSync(filePath, JSON.stringify(arg.token, null, 2), { flag: 'w' });
            dynamicAttributes.push(arg.dynamicData)
        });
        await (0, delay_1.default)(10);
    }
    fs_1.default.writeFileSync('./dynamicAttributes.json', JSON.stringify(dynamicAttributes));
}
exports.default = default_1;
function createToken(number, item, config) {
    const token = {
        name: `${config.name} #${number}`,
        symbol: config.symbol ?? 'OG',
        description: config.description,
        seller_fee_basis_points: config.sellerFeeBasisPoints,
        image: 'text.html',
        animation_url: 'text.html',
        external_url: 'OceanGuardians.sol',
        attributes: [],
        collection: {
            name: config.collection.name,
            family: config.collection.family,
        },
        properties: {
            files: [
                {
                    uri: 'text.html',
                    type: 'text/html',
                },
            ],
            category: 'html',
            creators: config.creators,
        },
    };

    const dynamicData = {
        name: `${config.name} #${number}`,
        dynamic_attributes: []
    }
    Object.keys(item).forEach((k) => {
        if ((0, util_1.shouldIncludeTraitInMetadata)(k)) {
            if (item[k].name != 'Notrait') {
                if (k == 'Location' || k == 'Wave' || k == 'Board') {
                    dynamicData['dynamic_attributes'].push({ trait_type: k, value: item[k].name })
                } else if (k == 'Face') {
                    const face = item[k].name.split('-'.replace('_', ' '))
                    token['attributes'].push({ trait_type: k, value: face[0] });
                    if (face[1]) {
                        token['attributes'].push({ trait_type: 'Beard', value: face[1] });
                    }
                } else {
                    token['attributes'].push({ trait_type: k, value: item[k].name });
                }
            }
        }
    });
    return {token, dynamicData};
}
exports.createToken = createToken;
