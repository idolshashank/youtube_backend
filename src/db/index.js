import mongoose from "mongoose";

import { DB_NAME } from "../constants.js"

const connectDB = async()=>{
    try {
        const connectInstance= await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(`\n Mongo connected !! DB HOST: ${connectInstance}`);
    } catch (error) {
        console.log("MONGO connection error ", error);
        process.exit(1)
    }
}

export default connectDB
