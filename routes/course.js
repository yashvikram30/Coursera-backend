const { Router } = require("express");
const courseRouter = Router();
const {CourseModel} = require("../db");
const {PurchaseModel} = require("../db");
const {userMiddleware} = require("../middlewares/user")

courseRouter.post('/purchase',async function(req,res){
    const userId = req.userId;
    const courseId = req.body.courseId; 

    // insert a check if the user has indeed paid the price of the course
    await PurchaseModel.create({
        userId,
        courseId
    })
    res.json({
        message: "You have successfully bought this course!"
    })
});

courseRouter.get('/preview',async function(req,res){
    const courses = await CourseModel.find({});
    res.json({
        courses
    })
});

module.exports = {
    courseRouter : courseRouter
}