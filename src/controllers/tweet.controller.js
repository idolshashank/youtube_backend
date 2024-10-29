import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { match } from "assert"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
      const {content}= req.body;
      const tweet = await Tweet.create({
        owner:req.user._id,
        content,
      })
      if(!tweet){
        throw new ApiError(404,"Error in publishing the tweet");
      }
      return res.status(200).json(new ApiResponse(200,tweet,"Tweet posted Sucessfully"));

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const tweets = await Tweet.aggregate([
        {
           $match:{owner:req.user._id},
        },
    ])
    if(!tweets){
        throw new ApiError(404,"can't find tweet with this id");
    }
    return res.status(200).json(new ApiResponse(200,tweets,"Your tweets fetched sucessfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}= req.params;
    const {content}= req.body;
    if(!content){
        throw new content(400,"need content to update");
    }
    if(!tweetId){
        throw new ApiError(400,"can't get tweetid");
    }
    const tweet= await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content:content,
        },{
            new:true,
        }
    )
    return res.status(200).json(new ApiResponse(200,{},"done successfully"));

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}  