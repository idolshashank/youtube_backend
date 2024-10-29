import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Playvideo } from "../models/playlistVideo.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const playlist = await Playlist.create({
        name:name,
        description:description,
        owner: new mongoose.Types.ObjectId(req.user._id),
    })
    if(!playlist){
        throw new ApiError(400,"playlist not created");
    }
    return res.status(200).json(new ApiResponse(200,playlist,"playlist created"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    const playlist = await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
            }
        },
        {           
                $sort:{createdAt:1},
        }
    ])
    if(playlist.length==0){
        throw new ApiError(400,"playlist not found");
    }
    return res.status(200).json(new ApiResponse(200,playlist,"User playlist searched successfully"));
    
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist = await Playlist.findById(new mongoose.Types.ObjectId(playlistId));
    if(!playlist)
        throw new ApiError(400,"playlist not found");
    return res.status(200).json(new ApiResponse(200,{
        "playlist name":playlist.name,
        "playlist description": playlist.description,}
        ,"playlist found"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    const videoPlaylist= await Playvideo.create({
        videoId:new mongoose.Types.ObjectId(videoId),
        playlistId:new mongoose.Types.ObjectId(playlistId),
    })
    if(!videoPlaylist){
        throw new ApiError(400,"can't add this video to playlist");
    }
    return res.status(200).json(new ApiResponse(200,{},"successfully added"));
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const videoPlaylist = await Playvideo.findOneAndDelete({
        playlistId: new mongoose.Types.ObjectId(playlistId),
        videoId:new mongoose.Types.ObjectId(videoId),
    });
    if(!videoPlaylist){
        throw new ApiError(400,"no video found in this playlist");
    }
    return res.status(200).json(new ApiResponse(200,{},"video removed sucessfully"));
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const deletePlaylist = await Playlist.findOneAndDelete(new mongoose.Types.ObjectId(playlistId));
    if(!deletePlaylist){
        throw new ApiError(404,"can't find playlist");
    }
    const deleteVideosFromPlaylist = await Playvideo.deleteMany({
        playlistId:new mongoose.Types.ObjectId(playlistId),
        videoId:new mongoose.Types.ObjectId(videoId),
    })
    if(!deleteVideosFromPlaylist){
        throw new ApiError(400,"can't delete video from the playlist");
    }
    return res.status(200).json(new ApiResponse(200,{},"successfully deleted playlist"));

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const playlist= await Playlist.findByIdAndUpdate(
        new mongoose.Types.ObjectId(playlistId),
        {
            name:name,
            description:description,
        },{
            new:true,
        }
    )
    if(!playlist){
        throw new ApiError(400,"playlist not found");
    }
    return res.status(200).json(new ApiResponse(200,playlist,"updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}