const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trade = new Schema({
    traderid:{type: Schema.Types.ObjectId, ref: 'User'},
    tradeid:{type: Schema.Types.ObjectId, ref: 'Belart'},
    offerid:{type: Schema.Types.ObjectId, ref: 'Belart'}
}
);

module.exports = mongoose.model('Trade', trade);