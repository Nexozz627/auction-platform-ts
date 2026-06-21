import { Request, Response } from "express";
import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async(req: Request, res: Response) => {
    const { idToken } = req.body;

    if(!idToken){
        return res.status(400).json({message: "Token is required"});
    }

    try{
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload() as any;
        const { email, sub: googleId, given_name, family_name } = payload;

        let user = await prisma.user.findUnique({
            where: {email: email},
        });


        if(!user){

            //username
            const rawName = `${given_name || ""} ${family_name || ""}`.trim();
            const newUsername = rawName !== "" ? rawName : `user_${googleId.substring(0, 8)}`;

            user = await prisma.user.create({
                data:{
                    email: email,
                    username: newUsername,
                    firstName: given_name || "",
                    lastName: family_name || "",
                    password: null, 
                },
            });
        }

        const token = generateToken(user.id, res);

        return res.status(200).json({
            message: "Google authentication successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("❌ Error during Google OAuth2 validation:", error);
        return res.status(401).json({ message: "Invalid or expired Google token." });
    }
};

const register = async (req: Request, res: Response) => {
    try {
        const {username, firstName, lastName, email, password} = req.body;

        
        console.log("=== DEBUG REGISTER ===");
        console.log("complete body received :", req.body);

        //checking the zod + middleware
        if (!username || !email || !password) {
            return res.status(400).json({ 
                error: "missing something", 
                bodyRecu: req.body 
            });
        }

        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: {email: email },
        });

        // Check if username is unique
        const usernameExists = await prisma.user.findUnique({
            where: {username : username},
        })

        // Password required
        if (!password || password.trim() === "") {
            return res.status(400).json({ message: "Password is required" });
        }
        

        if (userExists){
            return res
                .status(400)
                .json({error : "User already exists with this email"});
        }

        if (usernameExists){
            return res
                .status(409)
                .json({error : "Username already taken"});
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); 

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                firstName,
                lastName,
                email,
                password: hashedPassword,
            },
        });

        // Generate JWT token
        const token = generateToken(user.id, res);

        res.status(201).json({
            status: "success",
            user:{
                id: user.id,
                name: username,
                email: email,
            }
        })
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
};

const login = async (req: Request,res: Response) => {
    try {
        const {identifier, password} = req.body;

        // Check if user exists (with unique email/username)
        const user = await prisma.user.findFirst({
            where: {
                OR:[
                    {email: identifier},
                    {username: identifier}
                ]
            },
        });
        
        if (!user){
            return res
                .status(401)
                .json({error: "Invalid email/username or password"});    
        }

        // Block login attempt if user registered with Google
        if (!user.password) {
            return res.status(400).json({
                error: "Please sign in with Google"
            });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid){
            return res
                .status(401)
                .json({error: "Invalid email/username or password"});    
        }

        // Generate JWT token
        const token = generateToken(user.id, res);

        res.status(200).json({
            status: "success",
            user:{
                id: user.id,
                email: user.email,
                username: user.username,
            }
        })
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
}; 

const logout = async (req: Request, res: Response) => {
    try {

        //empty the token from the browser 
        res.cookie("jwt", "", {
            httpOnly : true,
            expires: new Date(0),
        })
        res.status(200).json({
            status: "sucess",
            message: "Logged out successfully",
        })
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Server error during logout" });
    }
}


export {register, login, logout, googleAuth};