import { Router } from "express";
import {changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateCoverImage, updateUserAvtar } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

// loginUser,
// logoutUser,
// refreshAccessToken,
// changeCurrentPassword,
// getCurrentUser,
// updateAccountDetails,

const router = Router()

router.route("/register").post(

    upload.fields([
        {
            name: "avtar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ]),
    registerUser
) 
router.route("/login").post(loginUser);

//sequred routes
router.route("/logout").post(verifyJWT,logoutUser);

router.route("/generate-acess-token").post(verifyJWT,refreshAccessToken);

router.route("/change-current-password").post(verifyJWT,changeCurrentPassword);

router.route("/get-current-user").post(verifyJWT,getCurrentUser);

router.route("/update-account-detail").post(verifyJWT,updateAccountDetails);

router.route("/update-user-avtar").post(verifyJWT, upload.single("avtar"),updateUserAvtar);

router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"),updateCoverImage);

router.route("/c/:username").get(verifyJWT,getUserChannelProfile);

router.route("/history").get(verifyJWT,getWatchHistory);

export default router

// updateUserAvtar,
// updateCoverImage 