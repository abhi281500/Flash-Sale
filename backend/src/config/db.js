import mongoose from "mongoose"

const connectDB = async() =>{
    try {
       const conn = await mongoose.connect(process.env.MONGODB_URI)
       console.log(" Mongoose Connected Successfully");
       
    } 
    catch (error) {
        console.log("Mongoose Connection Error : " ,error);
        process.exit(1); 
    }
}

export  default connectDB