require("dotenv").config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Admin = require("./models/adminModel");

async function seedAdmin (){
    try{
        await mongoose.connect(process.env.MONGODB_URL);

        const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const password = process.env.ADMIN_PASSWORD;
        if(!email || !password){
            throw new Error(
                "Set Admin Email and Password"
            );
        }
        const existingAdmin = await Admin.findOne({email});

        if(existingAdmin){
            console.log("Admin already existed :",email);
            return;
        }
        const hashPassword = await bcrypt.hash(password,12);
        await Admin.create({
            email,
            password: hashPassword,
            role:"admin"
        });
        console.log("Admin seeded successfully:",email)
    }catch(error){
        console.error("Admin seeding failed :",error.message);
        process.exitCode = 1;
    }finally{
        await mongoose.disconnect();
    }
}
seedAdmin();