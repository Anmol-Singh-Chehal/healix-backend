import "../../utils/injectEnv.js"

import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../lib/model/user.model.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    if(!user){
        return {
            accessToken: null,
            refreshToken: null,
        }
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    if(!accessToken || !refreshToken){
        return {
            accessToken: null,
            refreshToken: null,
        }
    }
    
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

export const signUp = asyncHandler(async (req, res) => {
    const {
        firstname, lastname,
        dateOfBirth, gender,
        email, password, confirmPassword
    } = req.body;

    if (!firstname || !lastname || !dateOfBirth || !gender || !email || !password || !confirmPassword) {
        return res.status(404).json(
            new ApiResponse(404, null, "All fields are required.")
        );
    }

    if(password !== confirmPassword){
        return res.status(404).json(
            new ApiResponse(404, null, "Entered password doesn't match with confirm password field.")
        );
    }

    const user = await User.findOne({ email });
    if(user){
        return res.status(404).json(
            new ApiResponse(404, null, "Email already exists, try to sign in instead.")
        );
    }

    const createdUser = await User.create({
        firstname: firstname,
        lastname: lastname,
        dateOfBirth: dateOfBirth,
        gender: gender,
        email: email,
        password: password,
        refreshToken: "",
    });
    const checkUser = await User.findById(createdUser._id).select("-password -refreshToken");
    if(!checkUser){
        return res.status(500).json(
            new ApiResponse(500, null, "Failed to sign up user.")
        );
    };

    return res.status(201).json(
        new ApiResponse(201, checkUser, "User successfully signed up.")
    );
});

export const signIn = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(404).json(
            new ApiResponse(404, null, "All fields are required.")
        );
    }
    
    const user = await User.findOne({ email });
    if(!user){
        return res.status(404).json(
            new ApiResponse(404, null, "User doesn't exists, try to sign up instead.")
        );
    }

    const isPasswordValid = user.isPasswordCorrect(password);
    if(!isPasswordValid){
        return res.status(404).json(
            new ApiResponse(404, null, "Invalid password.")
        );
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    if(!accessToken || !refreshToken){
        return res.status(500)
        .json(
            new ApiResponse(500, { accessToken, refreshToken }, "Token generation process failed."),
        );
    }
    
    const signedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            { user:signedInUser, accessToken, refreshToken },
            "User signed in successfully."
        )
    );
});

export const signOut = asyncHandler(async (req, res) => {
    const userDetails = req.user;
    const user = await User.findByIdAndUpdate(
        userDetails._id,
        { $set: { refreshToken: undefined } },
    );

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, null, "User signed out succesfully.")
    );
});

export const refreshTheAccessToken = asyncHandler(async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!oldRefreshToken){
        return res.status(404).json(
            new ApiResponse(404, null, "Unauthorized access.")
        );
    }

    const decodedToken = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    if(!decodedToken){
        return res.status(404).json(
            new ApiResponse(404, null, "Unauthorized access.")
        );
    }

    const user = await User.findById(decodedToken._id);

    if(oldRefreshToken !== user.refreshToken){
        return res.status(404).json(
            new ApiResponse(404, null, "Unauthorized access.")
        );
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    if(!accessToken || !refreshToken){
        return res.status(500)
        .json(
            new ApiResponse(500, { accessToken, refreshToken }, "Token refreshment process failed."),
        );
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, { accessToken, refreshToken }, "Tokens refreshed successfully."),
    );
});

export const updateUserPassword = asyncHandler(async (req, res) => {
    const {
        oldPassword,
        password,
        confirmPassword,
    } = req.body;

    if(!oldPassword || !password || !confirmPassword){
        return res.status(404).json(
            new ApiResponse(404, null, "All fields are required")
        )
    }
    if(password !== confirmPassword){
        return res.status(404).json(
            new ApiResponse(404, null, "password is not matching with confirm password field.")
        )
    }

    const user = await User.findById(req.user._id);
    if(!user){
        return res.status(404).json(
            new ApiResponse(404, null, "Unauthorized access.")
        );
    }

    const isPasswordValid = user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid){
        return res.status(404).json(
            new ApiResponse(404, null, "Password is incorrect.")
        ); 
    }
    user.password = password;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, null, "Password updated successfully.")
    );
});

export const getUserDetails = asyncHandler(async (req, res) => {
    return res.status(200)
    .json(
        new ApiResponse(200, req.user, "User details fetched successfully.")
    );
});