const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true]
    },
    email: {
        type: String,
        unique: true,
        required: [true]
    },
    password: {
        type: String,
        required: [true]
    },
    img: {
        type: String
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: {
            values: ['ADMIN_ROLE', 'USER_ROLE'],
            message: '{VALUE} is not a valid role'
        }
    },
    status: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.toJSON = function() {
    let user = this;
    let userObj = user.toObject();
    delete userObj.password;
    return userObj;
};

userSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('User', userSchema);