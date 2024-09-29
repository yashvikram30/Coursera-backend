const express = require('express');
const mongoose = require('mongoose')
require('dotenv').config();
const {userRouter} = require("./routes/user");
const {courseRouter} = require("./routes/course");
const {adminRouter} = require("./routes/admin");
const app = express();
const port = 3000;
app.use(express.json());

app.use('/user',userRouter);
app.use('/course',courseRouter);
app.use('/admin',adminRouter);


async function main(){
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(port, ()=>{
        console.log("Backend is live!");
    })
}

main();
