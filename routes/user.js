const { Router } = require("express");
const userRouter = Router();
const {UserModel, CourseModel} = require("../db");
const {PurchaseModel} = require("../db");
const {z} = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {userMiddleware} = require("../middlewares/user")
require('dotenv').config();

const signupSchema = z.object({
    email : z.string().email(),
    password : z.string().min(8),
    firstName : z.string().min(1),
    lastName : z.string().min(1)
});

userRouter.post('/signup', async function(req,res){

    const { email, password, firstName, lastName } = req.body;
    try{

        // Step:1 Validate the input data using Zod
        signupSchema.safeParse(email);

         // Step:2 Hash the password using bcrypt before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step: 3 create the user in the database
        await UserModel.create({
            email : email,
            password : hashedPassword,
            firstName : firstName,
            lastName : lastName
        });
        res.status(201).json({
            message : "User created successfully!"
        })
    }
    catch(e){
        // Handle Zod validation errors
        if (e instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: e.errors// Send the validation errors
            });
        }

        console.log("Error occurred: ",e);
        res.status(501).json({
            message : "Error creating user",
            error: e.message
        })
    }
});

userRouter.post('/signin', async function(req,res){
    const { email , password } = req.body;

    try{
        // Step:1 check if the email exists
        const user = await UserModel.findOne({email});

        if(!user){
            return res.json({
                message: "User not found!"
            })
        }

        // Step:2 check if the password matches
        const isPasswordValid = bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.json({
                message: "Password is incorrect!"
            })
        }

        // Step:3 if everything is alright, return a jwt to the user
        const token = jwt.sign({
            id : user._id
        },process.env.JWT_USER_SECRET)
        
        res.json({
            message : "User signin successful",
            token : token
        });
    }
    catch(e){
        console.error("Error during sign-in:", e);
        res.status(500).json({
            message: "Error during sign-in",
            error: e.message,
        });
    }
});

userRouter.post('/purchases',async function(req,res){
    const userId = req.userId;
    const purchases = await PurchaseModel.find({
        userId
    })
    const courseData = await CourseModel.find({
        _id : {$in : purchases.map(x => x.courseId)}
    })
    res.json({
        purchases 
    })
});

module.exports = {
    userRouter : userRouter
}