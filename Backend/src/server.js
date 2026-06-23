require("dotenv").config();
const app=require("./app");
const connectDB=require("./config/database");
connectDB();
const PORT=3000;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})
