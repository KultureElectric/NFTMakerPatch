// TODO!
const _ = require('lodash');
const stats = require('./stats');

function calculateRarities() {
    const attributeCount = Object.keys(stats).length;

    const numberNFTs = 20;
    const percentagesList = []
    const rarityList = []
    const stockList = []

    _.forEach(stats, attribute => {
        itemCount = Object.keys(attribute).length;
        _.forEach(attribute, item => {
            console.log(item.key);
        })
    })
}

calculateRarities();