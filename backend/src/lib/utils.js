import jwt from "jsonwebtoken"

export const generateToken = (userId, res)=>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
        expiresIn:"7d"
    })

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("jwt", token,{
        maxAge:  7 * 24 * 60 * 60 * 1000, //Ms
        httpOnly: true, //prevents XSS attacks cross-site scripting attacks
        sameSite: isProd ? "None" : "Lax", // ✅ FIX
        secure: isProd,

    });
    return token;
}

export const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
};