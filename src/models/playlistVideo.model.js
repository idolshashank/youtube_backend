import mongoose,{model, Schema} from "mongoose";

const playlistVideo = new Schema({
    playlistId:{
        type: Schema.Types.ObjectId,
        ref:"Playlist",
        required: true,
    },
    videoId:{
        type: Schema.Types.ObjectId,
        ref:"Video",
        required:true,
    }
},{
    timestamps: true,
})
export const Playvideo = mongoose.model("Playvideo",playlistVideo);