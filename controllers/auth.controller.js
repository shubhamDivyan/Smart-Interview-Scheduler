require('dotenv').config();

const {google} =require('googleapis');
const jwt=require('jsonwebtoken');
const User=require('../models/User.model');
const {encrypt}=require('../services/crypto.service');

console.log("Checking Client ID:", process.env.GOOGLE_CLIENT_ID)

const oauth2Client=new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
    // "977512153875-l712ns8htkvonsed4f92akmrsam2feot.apps.googleusercontent.com", // Direct paste
    // "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", // Direct paste
    // "http://localhost:8080/api/auth/google/callback" // Direct paste
);



exports.getAuthUrl=(req,res)=>{
    const scopes=[
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.send'
    ];

    const url=oauth2Client.generateAuthUrl({
        access_type:'offline',
        prompt:'consent',
        scope:scopes
    });
    res.redirect(url);
    // return res.status(200).send(`Generated URL is: ${url}`);
}

//Google OAuth Callback handle karein

exports.googleCallback=async(req,res)=>{
    const {code} = req.query;

    if(!code){
        return res.status(400).json({error:'Authorization code missing'});
    }
    
    try{
        const {tokens}=await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2=google.oauth2({version:'v2',auth:oauth2Client});
        const userInfo=await oauth2.userinfo.get();

        const {id:googleId,name,email}=userInfo.data;
        // const encryptedRefreshToken=encrypt(tokens.refresh_token);
        const encryptedRefreshToken = encrypt(tokens.refresh_token)

        let user=await User.findOne({googleId});

        if(user){
            user.googleAccessToken=tokens.access_token;
            if(tokens.refresh_token){
                user.googleRefreshToken=encryptedRefreshToken;
            }
            await user.save();
        }else{
            if(!tokens.refresh_token){
                return res.status(400).json({error:'Failed to acquire refresh token.Please remove app access from Google and try again.'});

            }
            user=new User({
                googleId,
                name,
                email,
                googleAccessToken:tokens.access_token,
                googleRefreshToken:encryptedRefreshToken
            });
            await user.save();

           
        }
        const appToken=jwt.sign(
            {userId:user._id,email:user.email},
            process.env.JWT_SECRET,
            {expiresIn:'7d'}
        );
        return res.status(200).json({
            message:'Authentication successful',
            token:appToken,
            user:{name:user.name,email:user.email}
        });
    }catch(error){
        console.log('OAuth CallBack Error',error);
        return res.status(500).json({error:'Internal Server Error during login'});
    }
}

