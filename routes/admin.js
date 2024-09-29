const { Router } = require("express");
const adminRouter = Router();
const {AdminModel} = require("../db");
const {CourseModel} = require("../db");
require('dotenv').config();
const {z} = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {adminMiddleware} = require("../middlewares/admin")

const signupSchema = z.object({
    email : z.string().email(),
    password : z.string().min(8),
    firstName : z.string().min(1),
    lastName : z.string().min(1)
});

adminRouter.post('/signup', async function(req,res){
    const { email, password, firstName, lastName } = req.body;
    try{

        // Step:1 Validate the input data using Zod
        signupSchema.safeParse(email);

         // Step:2 Hash the password using bcrypt before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step:3 create the user in the database
        await AdminModel.create({
            email : email,
            password : hashedPassword,
            firstName : firstName,
            lastName : lastName
        });
        res.status(201).json({
            message : "Admin created successfully!"
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

adminRouter.post('/signin', async function(req,res){
    const { email , password } = req.body;

    try{
        // Step:1 check if the email exists
        const user = await AdminModel.findOne({email});

        if(!user){
            return res.json({
                message: "Admin not found!"
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
        },process.env.JWT_ADMIN_SECRET)
        
        res.json({
            message : "Admin signin successful",
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

adminRouter.post("/course", adminMiddleware, async function(req,res){
    const adminId = req.adminId;
    const {title,description,imgURL,price} = req.body;

    try{
        const course = await CourseModel.create({
            title, description, imgURL, price, creatorId : adminId
        })

        res.json({
            message : "Course created",
            courseId : course._id
        })
    }
    catch(e){
        console.log("Some error occurred: ",e);
        res.json({
            message : "Some error occurred!",
            error: error.message
        });
    }
});

// put route to update information related to the course, ensure that the right admin gets access to update the course, and another admin cannot
adminRouter.put("/course", adminMiddleware, async function(req,res){
    const adminId = req.adminId;
    const {title,description,imgURL,price, courseId} = req.body;

    const course = await CourseModel.updateOne({
        _id: courseId,
        creatorId : adminId 
    },{
        title: title,
        description: description,
        imgURL : imgURL,
        price : price
    })

    res.json({
        message : "Course updated",
        courseId : course._id
    })
});

adminRouter.get("/course/bulk", adminMiddleware, async function(req,res){
    const adminId = req.adminId;
    const courses = await courseModel.find({
        creatorId: adminId
    })
    res.json({
        message : "Course updated",
        courses
    })
});

module.exports = {
    adminRouter: adminRouter
}