
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:
    {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true,
        unique: true
    },
    password:
    {
        type: String,
        required: true
    },
    todo:[{
        todos:{
            type:String,
        }
    }],
    tokens:{
        type:String,
    }
});

const User = mongoose.model('User' , userSchema);

export {User};