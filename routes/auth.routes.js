const express=require("express");
const router=express.Router();
const authController=require('../controllers/auth.controller');
const authGuard=require('../middleware/auth.middleware');

router.get('/auth/google',authController.getAuthUrl);
router.get('/auth/google/callback',authController.googleCallback);

router.get('/dashboard/profile',authGuard,(req,res)=>{
    res.json({message:'Welcome to your secure dashboard!',user:req.user});
})

module.exports=router;