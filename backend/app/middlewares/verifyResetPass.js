const jwt = require('jsonwebtoken');

const verifyResetPass = async (req, res, next) => {
    const resetToken = req.headers['authorization'];
    if(!resetToken){
        return res.status(401).json({ message: "Reset token missing" });
    }
    try{
        const tokenData = jwt.verify(resetToken, process.env.RESET_SECRET);
        req.userId = tokenData.userId;
        next();
    }catch(err){
        return res.status(401).json({message: "Invalid or expired reset token"});
    }
}

module.exports = verifyResetPass;