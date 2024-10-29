import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;
    const comments= await Comment.aggregate([
        {
            $match:{
                  video:new mongoose.Types.ObjectId(videoId),
            }
        },{
                $sort:{
                    createdAt:-1,
                }
            },{
                $skip: (page-1)*limit,
            },{
                $limit: limit,
            }
        ,
    ])
    if(!comments){
        throw new ApiError(400,"can't find comment");
    }
    console.log(comments);
    return res.status(200).json(new ApiResponse(200,{comments},"sucessfully done"));
    
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}= req.params;
    const {comment} = req.body;
    const addComment = await Comment.create({
       content: comment,
       video: videoId,
       owner: req.user._id,
    })
    if(!addComment){
        throw new ApiError(400,"Can't add comment");
    }
    return res.status(200).json(new ApiResponse(200,{addComment},"sucessfull added comment"))
      
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.params;
    const {newComment} = req.body;
    const updateComment = await Comment.findByIdAndUpdate(
        new mongoose.Types.ObjectId(commentId),
        {
          content:newComment,
        },{
            new:true,
        }
    )
    if(!updateComment){
        throw new ApiError(400,"Can't find comment");
    }
    return res.status(200).json(new ApiResponse(200,{},"comment updated"));
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}= req.params;
    const comment = await Comment.findByIdAndDelete(new mongoose.Types.ObjectId(commentId));
    if(!comment){
        throw new ApiError(400,"can't find the comment");
    }
    return res.status(200).json(new ApiResponse(200,{},"sucessfully deleted"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }