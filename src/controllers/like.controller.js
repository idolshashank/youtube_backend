import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const check = await Like.findOne({
        video:new mongoose.Types.ObjectId(videoId),
        likedBy:new mongoose.Types.ObjectId(req.user._id),
    })
    let result= "liked";
    if(check){
          const like = await Like.findOneAndDelete({
            video:new mongoose.Types.ObjectId(videoId),
            likedBy:new mongoose.Types.ObjectId(req.user._id),
          })
          
          if(!like){
            throw new ApiError(400,"can't unlike the video");
          }
          console.log("unliked");
          result="unliked sucessfully";
    }
    else{
           const like = await Like.create({
            video:new mongoose.Types.ObjectId(videoId),
            likedBy:new mongoose.Types.ObjectId(req.user._id),
           })
           if(!like){
            throw new ApiError(400,"can't like this video");
           }
           console.log("liked");
           result ="liked sucessfully";
    }
    return res.status(200).json(new ApiResponse(200,result,"done sucessfully"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const check = await Like.findOne({
        comment:new mongoose.Types.ObjectId(commentId),
        likedBy:new mongoose.Types.ObjectId(req.user._id),
    })
    let result= "comment";
    if(check){
          const like = await Like.findOneAndDelete({
            comment:new mongoose.Types.ObjectId(commentId),
            likedBy:new mongoose.Types.ObjectId(req.user._id),
          })
          if(!like){
            throw new ApiError(400,"can't unlike the comment");
          }
          result = "comment unliked";
    }
    else{
           const like = await Like.create({
            comment:new mongoose.Types.ObjectId(commentId),
            likedBy:new mongoose.Types.ObjectId(req.user._id),
           })
           if(!like){
            throw new ApiError(400,"can't like this comment");
           }
           result="comment liked";
    }
    return res.status(200).json(new ApiResponse(200,result,"done sucessfully"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on twe
    const check = await Like.findOne({
        tweet :new mongoose.Types.ObjectId(tweetId),
        likedBy:new mongoose.Types.ObjectId(req.user._id),
    })
    let result="";
    if(check){
          const like = await Like.findOneAndDelete({
            tweet :new mongoose.Types.ObjectId(tweetId),
            likedBy:new mongoose.Types.ObjectId(req.user._id),
          })
          if(!like){
            throw new ApiError(400,"can't unlike the tweet");
          }
          result= "tweet unliked";
    }
    else{
           const like = await Like.create({
            tweet :new mongoose.Types.ObjectId(tweetId),
            likedBy:new mongoose.Types.ObjectId(req.user._id),
           })
           if(!like){
            throw new ApiError(400,"can't like this tweet");
           }
           result= "tweet liked";
    }
    return res.status(200).json(new ApiResponse(200,result,"done sucessfully"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos= await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user._id),
                video:{$ne: null},
            }
            
        },{
            $sort:{createdAt:-1},
        }
    ])
    if(!likedVideos){
        throw new ApiError(400,"can't find the liked videos");
    }
    return res.status(200).json(new ApiResponse(200,likedVideos,"liked videos fetched successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}