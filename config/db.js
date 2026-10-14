const mongoose = require("mongoose")
const MONGODB_URL = process.env.MONGODB_URL

mongoose.connect(MONGODB_URL).then(()=>{
    console.log("MongoDB Connected Successfully");
}).catch((error)=>{
    console.log("MongoDB Connection Failed", error);
})