const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    email : {type :String, unique: true} , 
    password : String,
    firstName : String,
    lastName : String
});

const courseSchema = new Schema({
    title : String,
    description : String,
    price : Number,
    imgURL: String,
    creatorId : ObjectId 
});

const adminSchema = new Schema({
    email : {type :String, unique: true},
    password : String,
    firstName : String,
    lastName : String
});

const purchaseSchema = new Schema({
    creatorId : ObjectId,
    userId : ObjectId
});

const UserModel = mongoose.model('users',userSchema);
const AdminModel = mongoose.model('admins',adminSchema);
const CourseModel = mongoose.model('courses',courseSchema);
const PurchaseModel = mongoose.model('purchases',purchaseSchema);

module.exports = {
    UserModel: UserModel,
    AdminModel : AdminModel,
    CourseModel : CourseModel,
    PurchaseModel : PurchaseModel
};