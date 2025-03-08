import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    
    if(!token) {
        return res.status(401).json({message: "No token, authorization denied"})
    }
    
    const newToken = token.startsWith('Bearer') ? token.slice(7).trim() : token ;
    
    try {
        const decoded = jwt.verify(newToken, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    }catch (error) {
        res.status(401).json({message: "Token is not valid"});
    }
}

export default authMiddleware;