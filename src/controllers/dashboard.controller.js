import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const totalVideos = await Video.countDocuments({owner:new mongoose.Types.ObjectId(req.user._id)});
    if(!totalVideos){
        throw new ApiError(400,"error in counting views");
    }
    const views= await Video.aggregate([
         {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user._id),
            }
         },{ 
            $group: {
            _id: null, 
            totalViews: { $sum: "$views" },
        }
         }
    ]);
    if(!views){
        throw new ApiError("can't find total views");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,{
        "TotalViews": views[0].totalViews,
        "TotalVideos": totalVideos,
    },"total views and total videos fetched sucessfully"));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const totalVideos = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user._id),
            }
        },{
            $sort:{
                createdAt:-1,
            }
        }
    ])
    if(!totalVideos)
    {
        throw new ApiError(400,"can't find videos");
    }
    return res.status(200).json(new ApiResponse(200,totalVideos,"all videos fetched successfully"));
})

export {
    getChannelStats, 
    getChannelVideos
    }