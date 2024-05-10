
import  jwt  from "jsonwebtoken";
const {User} = require("../models/UserModel");

const auth = async (req:any , res:any , next:any)=>{
    try{
        const token = req.cookies.token;
       
        if (!token) {
            return res.status(401).json({ message: "No token found" });
        }
        
        // Decode token to find userId
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN!); // Directly use the secret key
        
        if (typeof decoded !== 'object' || !decoded.id) {
            return res.status(401).json({ message: "Invalid token" });
        }
       
        const userId = decoded.id; 
        
        const user = await User.findOne({_id:userId});
        
        if(!user){
           throw new Error("User Not found");
        }
         req.token = token;
         req.user = user;
         req.userId = user._id;
     next();
    }
    catch(err){
        res.status(401).send("Unauthorized : No token Provided");
    }
}

module.exports = auth;