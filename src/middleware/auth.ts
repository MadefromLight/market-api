import {NextFunction,Request,Response} from "express";
import jwt from "jsonwebtoken";
import {env} from "../config/env";
export type AuthUser={id:string;role:"CUSTOMER"|"ADMIN"};
export type AuthRequest=Request&{user?:AuthUser};
export function authenticate(req:AuthRequest,res:Response,next:NextFunction){
 const header=req.header("authorization");
 if(!header?.startsWith("Bearer ")) return res.status(401).json({message:"Authentication required"});
 try{const p=jwt.verify(header.slice(7),env.JWT_SECRET) as AuthUser;req.user={id:p.id,role:p.role};next();}
 catch{return res.status(401).json({message:"Invalid or expired token"});}
}
export function requireAdmin(req:AuthRequest,res:Response,next:NextFunction){
 if(req.user?.role!=="ADMIN") return res.status(403).json({message:"Admin access required"});
 next();
}