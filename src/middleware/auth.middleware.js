import config from "../config/config.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization.split(" ")[1];
        if (!token) {
            throw new ApiError(401, "No token provided", false);
        }
        const decoded = jwt.verify(token, config.access_token_secret);

        if (!decoded) {
            throw new ApiError(401, "Token is not valid", false);
        }

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            throw new ApiError(401, "User no longer exists", false);
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};
export { verifyJWT }