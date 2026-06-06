const {google} = require('googleapis');
const User=require("../models/User.model");
const {decrypt}=require("./crypto.service");


const oauth2Client=new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);


async function getAuthentcatedClient(userId){
    const user=await User.findById(userId);
    if(!user)
        throw new Error ('Interviewer profile not found');

    const decryptedRefreshToken=decrypt(user.googleRefreshToken);

    oauth2Client.setCredentials({
        access_token:user.googleAccessToken,
        refresh_token:user.decryptedRefreshToken
    })
    
    oauth2Client.on('token',async (token)=>{
        if(token.access_token){
            user.googleAccessToken=token.access_token;
            await user.save();
            console.log(`Auto-refreshed google access token from user:${user.email}`)
        }
    })

    return oauth2Client;
}

module.exports={getAuthentcatedClient};