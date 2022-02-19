const mongoose= require("mongoose");

const UserSchema = new mongoose.Schema({
    value:{
        type: String,
        required: true
    }
},
{
    timestamps:true
});



module.exports = mongoose.model("Document", UserSchema);