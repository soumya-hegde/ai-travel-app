const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
    const token = req.headers['authorization'];
    if(!token){
        return res.status(500).json({error:'token is not provided!'});
    }
    try{
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = tokenData.userId;
        req.role = tokenData.role;
        next();
    }catch(err){
        return res.status(401).json({error:err.message});
    }
}

module.exports = authenticateUser;