import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { OPTIONS } from "../constant.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(
            401,
            "User not found",
            false,
        )
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (
        [name, email, password].some((field) => field.trim() === "")
    ) {
        throw new ApiError(
            401,
            "All fields are required Please fill in all fields",
            false,
        )
    }

    const user = await User.findOne({ email });

    if (user) {
        throw new ApiError(
            401,
            "User already exists",
            false,
        )
    }

    const newUser = await User.create({
        name,
        email,
        password,
    });

    const createdUser = await User.findById(newUser._id).select("-password");

    return res.status(200).json(
        new ApiResponse(
            201,
            createdUser,
            "User created successfully",
            false,
        )
    )



});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(
            401,
            "User does not exist",
            false,
        )
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(
            401,
            "Incorrect password",
            false,
        )
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");

    return res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", refreshToken)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, refreshToken, accessToken, },
                "User logged in successfully",
                true,
            ),
        )

});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user.id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken", OPTIONS)
        .clearCookie("refreshToken", OPTIONS)
        .json(
            new ApiResponse(
                200,
                null,
                "User logged out successfully",
                false
            ),
        )

});

const refreshAccessToken = asyncHandler(async (req,res) => {
    
})

export { registerUser, loginUser, logoutUser }
