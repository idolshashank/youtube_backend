import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken';


export const verifyJWT= asyncHandler(async(req,res,next)=>{
 
   try {
    const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","");
    if(!token){
     throw new ApiError(401,"unautorised req");
    }
    console.log(token);
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    // console.log(decodedToken);
    const user = await User.findById(decodedToken?._id).select("-password -refreshtoken")
    console.log(user);
    if(!user){
     throw new ApiError(401,"Invalid Access Token")
    }
    req.user=user;
    next();
   } catch (error) {
    throw new ApiError(401,"invalid access token");
   }

})