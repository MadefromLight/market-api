import {Router} from "express";
import {z} from "zod";
import {prisma} from "../lib/prisma";
import {hashPassword,verifyPassword} from "../utils/password";
import {signToken} from "../utils/jwt";
const router=Router();
const schema=z.object({email:z.string().email(),password:z.string().min(8),name:z.string().min(2).max(100).optional()});
router.post("/register",async(req,res,next)=>{
 try{const input=schema.parse(req.body);if(!input.name)return res.status(400).json({message:"Name is required"});
 const email=input.email.toLowerCase();if(await prisma.user.findUnique({where:{email}}))return res.status(409).json({message:"Email already registered"});
 const user=await prisma.user.create({data:{email,name:input.name,passwordHash:await hashPassword(input.password)}});
 res.status(201).json({user:{id:user.id,email:user.email,name:user.name,role:user.role},token:signToken(user)});
 }catch(e){next(e);}
});
router.post("/login",async(req,res,next)=>{
 try{const input=schema.pick({email:true,password:true}).parse(req.body);const user=await prisma.user.findUnique({where:{email:input.email.toLowerCase()}});
 if(!user||!(await verifyPassword(input.password,user.passwordHash)))return res.status(401).json({message:"Invalid credentials"});
 res.json({user:{id:user.id,email:user.email,name:user.name,role:user.role},token:signToken(user)});
 }catch(e){next(e);}
});
export default router;