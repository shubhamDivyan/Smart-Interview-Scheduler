const express=require('express');
const authRoutes=require('./routes/auth.routes');


const app=express();


app.use(express.json());

app.use('/api',authRoutes);


app.get('/',(req,res)=>{
    res.send('Interview Scheduler System API is running...');

})

module.exports=app;