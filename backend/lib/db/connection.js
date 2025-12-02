import mongoose from "mongoose";

const connectDatabase = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    } catch(error){
        console.log("Failed to connect with database:",error);
        process.exit();
    }
};

export default connectDatabase;
