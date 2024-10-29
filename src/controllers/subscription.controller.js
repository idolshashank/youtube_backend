import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id; // Assuming user is logged in and req.user contains the user's info

    // Check if the user is already subscribed to the channel
    const subscription = await Subscription.findOne({ channel: channelId, subscriber: userId });

    if (subscription) {
        // If subscription exists, unsubscribe (delete it)
        await Subscription.deleteOne({ _id: subscription._id });
        res.status(200).json(new ApiResponse(200,{},"succesfully unsubscibed"));
    } else {
        // If subscription does not exist, subscribe (create new subscription)
        await Subscription.create({ channel: channelId, subscriber: userId });
        res.status(200).json(new ApiResponse(200,{},"Sucessfully subscribed"));
    }
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params;
    console.log(subscriberId);
   const find = await Subscription.find({
    channel:subscriberId,
   })
   if(find.length==0){
    throw new ApiError(400,"not found")
   }
   console.log(find.length);
   return res.status(200).json(new ApiResponse(200,{"No of subscribers":find.length},"done"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const subscribe = await Subscription.aggregate([
        {
            $match:{
                subscribe :subscriberId,
            }
        },
        {
            $count:"subscribers",
        }
    ])
    if(subscribe.length==0){
        throw new ApiError(404,"error found in finding the channel you must have at least one subscriber for a user to be a channel")
    }
    console.log(subscribe[0].subscribers);
    return res.status(200).json(new ApiResponse(200,subscribe[0].subscribers,"count done sucessfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}