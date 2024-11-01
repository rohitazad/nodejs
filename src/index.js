
const express = require("express");
const connectDB = require("./config/db");
const User = require("./models/user");

const bcrypt = require("bcrypt");
const saltRounds = 10;
const cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');


const app = express()
const port = 7777
app.use(express.json());
app.use(cookieParser())


connectDB().then(()=>{
    console.log("database conenct done ")
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}).catch((err) => {
    console.error("Database cannot be connected!!");
  });


// app.use("/",(req, res, next)=>{
//     //
//     console.log("root calling all ")
//     next()
// }, (req, res, next)=>{
//     console.log("second calling api ");
//     next()
// },  (req, res, next)=>{
//     next()
//     console.log("third calling api ");
// })

// app.post("/test", (req, res)=>{
//     console.log("Test port running ")
//     try {
//        // throw new Error("error show")
//         res.status(200).send({"message":"success"})
//     } catch (error) {
//         res.status(404).send({"message":"failed " +  error.message})
//     }
    
// })

app.post("/signup",  async(req, res)=>{
    try {
        const reqBody = req.body

        const hashPassword = await bcrypt.hash(reqBody.password, saltRounds)
        const userCreate = new User({
            firstName:reqBody.firstName,
            lastName:reqBody.lastName,
            email:reqBody.email,
            password:hashPassword
        })
        
        //console.log("hashPassword", hashPassword)
        const saveuser = await userCreate.save()
        res.send({"message":"user Create Successfully"})
    } catch (error) {
        res.send({message:"Error "+ error.message})
    }
})

app.post("/login",  async (req, res)=>{
    try {
        const { email, password } = req.body;
        const passwordInputByUser = password;

        const userinfo = await User.findOne({"email":email});
        if(!userinfo){
            throw new Error("Invalid credentials email");
        }
        const passwordHash = userinfo.password;

        const isPasswordValid = await bcrypt.compare(
            passwordInputByUser,
            passwordHash
        );
        if(!isPasswordValid){
            throw new Error("Invalid credentials password");
        }
        const userId = userinfo._id;
        var privateKey = "RohiT@0206";
        var tokentCreate = jwt.sign({_id:userId},privateKey,{ expiresIn: "1h" })
        res.cookie("token",tokentCreate, {
            expires: new Date(Date.now() + 8 * 3600000) // This sets the cookie to expire in 8 hours
        })
        res.status(200).json({userinfo,"message":"Login successfully."})

    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
})
app.post("/logout", async(req, res)=>{
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
          });
        res.send("Logout Successful!!");
    } catch (error) {
        res.status(400).send("ERROR :-- " + error.message);
    }
})
app.get("/feed", async (req, res)=>{
    try {
        const userListaData = await User.find({})
        const readCookies = req.cookies;
        const _token = readCookies.token;
        //console.log("___readCookies",_token);

        var privateKey = "RohiT@0206";
        const verifyTokent = jwt.verify(_token, privateKey);
        const {_id} = verifyTokent
        console.log("___read tokcent", _id)
        const user = await User.findById(_id)
        if(user){
            res.status(200).json({userListaData})
        }else{
            throw new Error("user not valid")
        }
    } catch (error) {
        res.status(400).send("ERROR :-- " + error.message);
    }
})

app.get("/profile", async(req,res)=>{
    try {
        const readCookies = req.cookies;
        const token = readCookies.token;
        if(!token){
            throw new Error("Please provide token")
        }
        var privateKey = "RohiT@0206";
        const verifyTokent = jwt.verify(token, privateKey);
        if(!verifyTokent){
            throw new Error("Not a valid token")
        }
        const {_id} = verifyTokent
        const user = await User.findById(_id)
        if(user){
            res.status(200).json({user})
        }else{
            throw new Error("user not valid")
        }
    }  catch (error) {
        res.status(400).send("Profile ERROR :-- " + error.message);
    }
})
app.patch("/profile", async(req, res)=>{
    
    try {
        const updates = {
            firstName:req.body.firstName,
            lastName:req.body.lastName
        };
        const readCookies = req.cookies;
        const token = readCookies.token;
        if(!token){
            throw new Error("Please provide token")
        }
        var privateKey = "RohiT@0206";
        const verifyTokent = jwt.verify(token, privateKey);
        if(!verifyTokent){
            throw new Error("Not a valid token")
        }
        const {_id} = verifyTokent
        const user = await User.findByIdAndUpdate(_id, updates, {new:true});

        
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.send({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).send({ message: "Error updating profile", error: error.message });
    }
})
  
