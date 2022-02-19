const router= require("express").Router();
const User = require('../models/user');
const Document = require("../models/document")
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser')

//Register
router.post('/register', async (req, res) =>{
   
    try{
        // GENRATE NEW PASSWORD
        const salt= await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(req.body.password, salt);


        // CREATE NEW USER
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        })

        // SAVE USER AND RETURN RESPOSNE...
        const user = await newUser.save();
        res.status(200).redirect("/login",);
    }catch(error){
        res.status(500).json(error);
    }
});


//Login
router.post("/login", async (req, res) =>{
    try{
        res.clearCookie("currentUser");
        const user = await User.findOne({email: req.body.email});
        !user && res.status(404).json("user not found!!!!!!")

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(404).json("wrong Password!!!!")
        res.cookie("currentUser", user._id)

        res.status(200).redirect("/");

    }
    catch(error){
            res.status(500).json(error);
    }
})
router.get("/logout",async(req, res)=>{
    try {
        res.clearCookie("currentUser");
        res.redirect("/login");
    } catch (error) {
        
    }
})
router.get("/dashboard",async(req, res)=>{
    if(req.cookies.currentUser != null || req.cookies.currentUser!= undefined){
        const user = await User.findById(req.cookies.currentUser);
        const docList = user.documents
        console.log(docList)
        res.render("dashboard", {user, docList})
    }
    else{
        res.redirect("/login");
    }
})
router.get("/getuser", (req, res)=>{
    res.send(req.cookies);
})

//Get a user


router.get("/:id", async (req, res) =>{
    try{
        const user = await User.findById(req.params.id)

        // This is how we can filter data to be viwed form mongodb document.
        const {password, updatedAt, createdAt, isAdmin, ...other}= user._doc;
        res.status(200).json(other);

    }catch(error){
        res.status(500).json(error)
    }
})

// get all the documents
router.get("/documents/:userId", async (req, res) =>{
    try{
        const user = await User.findById(req.params.userId);
        const documents = await Promise.all(
            user.documents.map(doc =>{
                return Document.findById(doc);
            })
        )

        let docList = [];
        documents.map((doc)=>{
            const {_id, value} = doc;
            docList.push({_id, value});
        });
        res.status(200).json(docList);
    }catch(error){
        res.status(500).json(error);
    }
})

module.exports= router;