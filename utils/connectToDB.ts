import mongoose from "mongoose";

export const connectToDb = async () => {
    console.log(mongoose.connection.readyState);


    if (mongoose.connection.readyState===2 || mongoose.connection.readyState===1) {
        console.log("mangoDB Before connected");
        return;
    }else{
        mongoose.connect(process.env.MONGODB_URL ?? "")
            .then(() => {
                console.log("mangoDB Now connected")
            })
            .catch((err) => {
                console.log("Mongo Err",err)
            });

        mongoose.connection.on('error',(err)=>{
            console.log("Mongo Err",err);
        })
    }


};
