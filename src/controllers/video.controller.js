import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideosUsingId = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const video = await Video.aggregate(
       [
         {
            $match:{
                owner: mongoose.Types.ObjectId(userId),
            },
         },
        {
            $sort: {
              [sortBy]: sortOrder
            }
        },
        {
            $skip: (page - 1) * limit // Skip the videos for previous pages
        },
        {
            $limit: limit  // Limit to the number of videos per page
        },{
            $project: {
              title: 1,
              description: 1,
              tags: 1,
              createdAt: 1,
              views: 1,
              uploadedBy: 1}
        }
       ]

    )
    if(!video.length){
        throw new ApiError(400,"video not found")
    }
    return res.status(200).json(new ApiResponse(200,video,"video fetch sucessfully"));
})
const getAllVideos = asyncHandler(async(req, res) => {
    let { page = 1, limit = 10, sortBy, sortType, query } = req.query
    //TODO: get all videos based on query, sort, pagination
    
    if(sortType==="asc"){
        sortType=1;
    }
        else{
        sortType=-1;
        }   
        console.log(query); 
    const video = await Video.aggregate(
       [
         
         {
            $match:{
                title:{$regex:query , $options:'i'}
            }
         },
        {
            $sort: {
              [sortBy]: sortType,
            }
        },
        {
            $skip: (page - 1) * limit 
        },
        {
            $limit: limit  // Limit to the number of videos per page
        },{
            $project: {
              title: 1,
              description: 1,
              tags: 1,
              createdAt: 1,
              views: 1,
              uploadedBy: 1}
        }
       ]

    )
    if(video.length==0){
        throw new ApiError(400,"video not found")
    }
    return res.status(200).json(new ApiResponse(200,video,"video fetch sucessfully"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(!title){
        throw new ApiError(400,"Video must have title");
    }
    if(!description){
        throw new ApiError(400,"Description can't be emoty");
    }

    const videoLocalPath= req.files?.videoFile[0].path;
    console.log(videoLocalPath);
    if(!videoLocalPath){
        throw new ApiError(400,"Video not found locally");
    }
    const uploadVideo = await uploadOnCloudinary(videoLocalPath);
    if(!uploadVideo){
        throw new ApiError(400,"Can't upload this video, Try again laater")
    }
    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail image is not found locally")
    }
    const uploadThunbnail= await uploadOnCloudinary(thumbnailLocalPath);
    if(!uploadThunbnail){
        throw new ApiError(400,"Can't upload the thumbnail");
    }
    // console.log("uploadVideo:",uploadVideo);
    // console.log("uploadThumbnail:",uploadThunbnail);
    const createVideo = await Video.create({
      videoFile : uploadVideo.url,
      thumbnail: uploadThunbnail.url,
      title,
      description,
      views: 0 ,
      isPublished: true,
      owner: req.user._id,
      duration:uploadVideo.duration,
    })
    // TODO: get video, upload to cloudinary, create video
    return res.status(200).json(new ApiResponse(200,createVideo,"Your video has been uploaded"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = Video.findById(videoId);
    if(!video){
        throw new ApiResponse(404,"Video not found in the database");
    }
    return res.status(200).json(new ApiResponse(200,"video found successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description}= req.body;
    const thumbnailLocalPath = req.files?.path;
    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail not found locally");
    
    }
    const uploadThumbnail= await uploadOnCloudinary(thumbnailLocalPath);
    if(!uploadThumbnail){
        throw new ApiError(400,"Thumbnail can't upload");
    }
    const video = await Video.findByIdAndDelete(
        videoId,
        {
            title:title,
            description,
            thumbnail: uploadThumbnail.url,
        },{
            new:true,
        }
    )
    return res.status(200).json(new ApiResponse(200,video,"Video detail updated"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const deleteVideo = await Video.deleteOne({_id:mongoose.Types.ObjectId(videoId)});
    if(!deleteVideo){
        throw new ApiError(400,"Error in delting the file");
    }
    return res.status(200).json(new ApiResponse(200,{},"Video delted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}