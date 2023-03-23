const express=require("express");
const app=express();
const cors=require("cors");
require("dotenv").config();
const PORT=process.env.PORT||3000;

app.set('view engine', 'ejs');

app.use(cors());

const routes=require("./routes");

app.use(routes);

app.listen(PORT,()=>{
    console.log(`server started running on ${PORT}`);
})