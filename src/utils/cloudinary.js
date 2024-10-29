import { v2 as cloudinary } from "cloudinary";
import fs from "fs";  
import dotenv from 'dotenv'; 
dotenv.config(); 
cloudinary.config({ 
    cloud_name: "djoh9rph0", 
    api_key: 556753547235144, 
    api_secret: "eY8XngcEDmbibJQ70L798o_2ito",
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log("File is uploaded successfully on Cloudinary:", response.url);
        return response;
    } catch (error) {
        console.error("Error in uploading the file:", error);
        try {
            fs.unlinkSync(localFilePath); // Remove the locally saved temporary file
        } catch (fsError) {
            console.error("Error deleting the local file:", fsError);
        }
        return null;
    }
};

export { uploadOnCloudinary };
