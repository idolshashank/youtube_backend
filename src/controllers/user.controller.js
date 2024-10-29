import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose"


const generateRefreshAndAccessToken = async(userid)=>{
      try {
        const user = await User.findById(userid); 
        const refreshToken= user.generateRefreshToken();
        const accessToken = user.generateAccessToken();
         
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});

        return {refreshToken,accessToken};
      } catch (error) {
        // throw new ApiError(500,"something went wrong while generating refresh and access token")
        console.error(error);
      }

}
  //get user detail from frontend
  //validation -not empty
  // check if user already exist
  // username and email check 
  // check for images and avtar
  //upload to cloudinary
const registerUser = asyncHandler(async(req,res)=>{

  const{username,email,password,fullname}=req.body
  console.log("email:",email);

  if(
     [fullname,email,username,password].some((field)=>field?.trim()==="")
  ){
    throw new ApiError(400,"all fields is required")
  }
  const existedUser= await User.findOne({
    $or: [{username},{email}],
  })
  if(existedUser){
    throw new ApiError(409,"already exist");
  }
  const avtarLocalPath= req.files?.avtar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  
  if(!avtarLocalPath){
    throw new ApiError(400,"req avtar");
  }
  const avtar = await uploadOnCloudinary(avtarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!avtar){
    throw new ApiError(400,"avtaar is req")
  }
  const user = await User.create({
    fullname,
    avtar: avtar.url,
    coverImage: coverImage?.url||"",
    email,
    password,
    username: username.toLowerCase(),
  })
 const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
 )
 if(!createdUser){
    throw new ApiError(404,"something went wrong while registering user")
 }
 
 return res.status(201).json(
    new ApiResponse(200,createdUser,"user registered sucessfully"),
 )
}) 

const loginUser = asyncHandler(async(req,res)=>{

const {email,username,password} = req.body;

// console.log(req);
if(!(username||email)){
  throw new ApiError(400,"username or email is req")
}
const user = await User.findOne({
  $or: [{username},{email}]
})
if(!user){
  throw new ApiError(404,"user not exist");
}
const isPasswordVaild = await user.isPasswordCorrect(password);

if(!isPasswordVaild){
  throw new ApiError(401,"invalid password");
 }

const {refreshToken,accessToken}= await generateRefreshAndAccessToken(user._id);

const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

const options={
  httpOnly: true,
  secure: true,
}
return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
  new ApiResponse(
    200,
    {
      user: loggedInUser,accessToken,refreshToken
    },
    "user logged in successfully"
  )
)
})
const logoutUser = asyncHandler(async(req,res)=>{
  try {
    const temp= await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken: undefined
        }
      },
      {
        new: true
      }
    );
    console.log(temp);
    const options= {
      httpOnly: true,
      secure: true,
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out"));
  } catch (error) {
    console.error(error);
  }
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
   const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
   if(!incomingRefreshToken){
    throw new ApiError(404,"No refresh token")
   }
   const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
   if(!decodedToken){
    throw new ApiError(400,"no decoded token");
   }
   const user= await User.findById(decodedToken?._id);
   const newAcesssToken= user.generateAccessToken();
   return newAcesssToken;

})
const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const {oldpassword , newpassword}= req.body;
  if(!oldpassword){
    throw new ApiError(400,"require old password")
  }
  if(!newpassword){
    throw new ApiError(400,"require the new password");
  }
  const user = await User.findById(req.user._id);
  const isPasswordCorrect= await user.isPasswordCorrect(oldpassword);
  if(!isPasswordCorrect){
    throw new ApiError(4000,"invalid old password");
  }
  const samePassword= await user.isPasswordCorrect(newpassword);

  if(samePassword){
    throw new ApiError(400, "new password is same as old password")
  }
  user.password = newpassword;
  await user.save({validateBeforeSave:false})

  return res.status(200)
  .json(new ApiResponse(200,{},"password changed sucessfully"));
})

const getCurrentUser = asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(new ApiResponse(200,req.user,"current user fetched sucessfully"))
})
const updateAccountDetails = asyncHandler(async(req,res)=>{
 const{fullname,email,username}= req.body;
 const user= User.findByIdAndUpdate(
  res.user._id,{
    $set:{
      fullname:fullname,
      email:email,
      username:username
    }
  },{
    new:true,
  }

 );
 
 return res.status(200)
 .json(new ApiResponse(200,{user:user},"updated"));
})
const updateUserAvtar = asyncHandler(async(req,res)=>{
  const avtarLocalPath = res.file?.path;
 if(!avtarLocalPath){
  throw new ApiError(403,"can't find avtar on local");
 }
  const avtar = await uploadOnCloudinary(avtarLocalPath);
  if(!avtar){
    throw new ApiError(402,"Avtar is not uploaded");
  }
   const user= await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
             avtar: avtar.url
      }
    },{
      new: true
    }
   ).select("-password");
   return res.status(200).json(new ApiResponse(200,user,"Avtar image changes Successfully"));
})
const updateCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath = res.file?.path;
  if(!coverImageLocalPath){
    throw new ApiError(400,"local coverimage not found")
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if(!coverImage){
    throw new ApiResponse(400,"cover image not uploded");
  }
  const user= await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        coverImage: coverImage.url
      }
    },{
      new:true,
    }
  )

  return res.json(200).json(new ApiResponse(200,"cover image changes sucessfully"));
})
const getUserChannelProfile= asyncHandler(async(req,res)=>{
  const {username}= req.params;
  if(!username){
   throw new ApiError(400,"no user")
  }
  console.log(username);
  const channel = await User.aggregate([
    {
      $match:{
        username: username?.toLowerCase()
      }
    },{
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
      }
    },{
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"
      }
    },{
      $addFields:{
        subscribersCount : {
          $size : "$subscribers"
        },
        channelsSubscribedToCount:{
          $size:"$subscribedTo"
        },
        isSubscribed : {
          $cond:{
            if:{$in:[req.user?._id,"$subscribers.subscribe"]},
            then: true,
            else: false,
          }
        }
      }
    },{
      $project:{
        fullname: 1,
        username: 1,
        email : 1,
        avtar : 1, 
        coverImage: 1,
        subscribersCount :1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1
      }
    }
  ])
  console.log(channel);
  if(!channel?.length){
    throw new ApiError(400,"channel not found")
  }
  return res.status(200).json(new ApiResponse(200,channel[0],"Done sucessfully"))
})
const getWatchHistory = asyncHandler(async(req,res)=>{
  const user = await User.aggregate([
    {
      $match : {
        _id: req.user._id,
    }
    },{
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField: "_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from: "users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullname:1,
                    username:1,
                    avtar:1
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ])

  return res.status(200).json(new ApiError(200,user[0].watchHistory,"succesfully watch history fetched"))
})

export {registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvtar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
