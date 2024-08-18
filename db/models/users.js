const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userInfo: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    // blockchain: {
    //     type: String,
    //     required: true
    // },
    maschainAddress: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true
    },
    maschainTokenNum: {
        type: Number,
        default: 0
    },
});

const User = mongoose.model('User', userSchema);
module.exports = User;