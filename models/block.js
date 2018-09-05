var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BlockSchema = new Schema({
    blockhash: {
        type: String,
        unique: true,
        index: true
    },
    blockindex: {
        type: Number,
        index: true,
        default: 0
    },
    timestamp: {
        type: Number,
        default: 0
    },
    transactions: {
        type: Number,
        default: 0
    },
    minorRewardAddress: {
        type: String
    }
});

module.exports = mongoose.model('Block', BlockSchema);
