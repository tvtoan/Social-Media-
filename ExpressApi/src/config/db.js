import mongoose from "mongoose";

// connect to mongoDb
export const connectDb = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log('Connect Successfully');

    }catch(error) {
        console.log('Connect Failure');
        process.exit(1)
    };
}