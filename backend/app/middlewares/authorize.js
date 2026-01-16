//HOF
const authorizeUser = (permittedRoles) =>{
    return(req,res,next) => { //middleware
        if(permittedRoles.includes(req.role)){
            next();
        }else{
            res.status(403).json({error:'Access Denied.'});
        }
    }
}

module.exports = authorizeUser;