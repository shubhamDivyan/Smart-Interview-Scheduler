const app=require('./app');
const connectDB=require("./config/db")
require("dotenv").config();

const PORT=process.env.PORT || 8080;
//Connect mongoDB;

connectDB()



app.listen(8080,()=>{
    console.log("Server is Running on port 8080");
})