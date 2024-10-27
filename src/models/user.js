const mongoose = require("mongoose");
const validator = require('validator');


const userSchema = new mongoose.Schema({
    firstName:{
        type : String,
        required:true,
        minLength:2,
        maxLength:45
    },
    lastName :{
        type:String
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowerCase:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email address: " + value);
            }
        }
    },
    password:{
        type:String,
        require:true,
        minLength:3,
        maxLength:220
    }
},{
    timestamps:true
})

module.exports = mongoose.model("User", userSchema)