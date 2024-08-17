const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    aptosAddress: {
        type: String,
        required: true
    },
    maschainAddress: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    maschainTokenNum: {
        type: Number,
        default: 0
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;