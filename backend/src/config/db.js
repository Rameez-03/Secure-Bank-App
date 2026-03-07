import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://rameezr_db_user:GovNzhmiFAM0fMpv@cluster0.itdxq2t.mongodb.net/?appName=Cluster0");
        console.log("MONGODB CONNECTED");
    } catch (error) {
        console.log("Error Mongo", error);
    }
}