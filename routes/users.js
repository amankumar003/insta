//setting up the database mongoose
const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb+srv://amankumar003:aman1234@instaclone.lzysxd2.mongodb.net/?retryWrites=true&w=majority");

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  bio: String,
  userImage: String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"post"
  }],
})
userSchema.plugin(plm); //providing deserailise and serialise methods to the schema

module.exports= mongoose.model("user",userSchema); 

