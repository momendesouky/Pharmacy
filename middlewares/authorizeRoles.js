require("dotenv").config();
const authorizeRole= function(...roles) {
  return(req,res,next)=>{
    const role=req.user.role;
    if(!roles.includes(role)){
      res.status(403).json({status:"Error",massage:"YOU Are Not Authorized"})
    }
    else{
      next();
    }
  }
}
module.exports=authorizeRole;
