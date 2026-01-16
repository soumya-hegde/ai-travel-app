const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const userSchema = new mongoose.Schema({
    username: String,
    email: {
    type: String,
    unique: true,
    },
    password: String,
    role:{
        type:String,
        default:'user',
        enum:['admin','agent','user']
    },
    agencyName: String,
    phone:String ,
    address:String ,
},{timestamps:true});
const User = model('User',userSchema);

module.exports = User;