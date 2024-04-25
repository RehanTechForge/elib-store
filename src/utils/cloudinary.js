import { v2 as cloudinary } from 'cloudinary';
import config from '../config/config.js';
import fs from "fs";
cloudinary.config({
    cloud_name: config.cloudinary_cloud_name,
    api_key: config.cloudinary_api_key,
    api_secret: config.cloudinary_api_secret,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "elib-store",
        });
        fs.unlinkSync(localFilePath);
        return result;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log(error);
    }
}

const deleteOnCloudinary = async (deleteFilePath) => {
    try {
        const result = await cloudinary.uploader.destroy(deleteFilePath);
        return result;
    } catch (error) {
        console.log(error);
    }
}

export { uploadOnCloudinary, deleteOnCloudinary };