import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";

const UserSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
        trim: true,
    },
    gender: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    }
}, { timestamps: true });

UserSchema.pre("save", function (next){
    if(this.isModified("password")){
        this.password = CryptoJS.AES.encrypt(this.password, process.env.PASSWORD_SECRET_KEY);
    }
    next();
});

UserSchema.methods.isPasswordCorrect = function(password){
    const bytes = CryptoJS.AES.decrypt(this.password, process.env.PASSWORD_SECRET_KEY);
    const savedPassword = bytes.toString(CryptoJS.enc.Utf8);
    return (savedPassword === password);
}

UserSchema.methods.generateAccessToken = function(){
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiry = process.env.
    ACCESS_TOKEN_EXPIRY;

    const payload = {
        _id: this._id,
        email: this.email,
        firstname: this.firstname,
        lastname: this.lastname,
    };

    return jwt.sign(payload, secret, { expiresIn: expiry });
}

UserSchema.methods.generateRefreshToken = function(){
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const expiry = process.env.REFRESH_TOKEN_EXPIRY;

    const payload = { _id: this._id };
    return jwt.sign(payload, secret, { expiresIn: expiry });
}

export const User = mongoose.model("User", UserSchema);