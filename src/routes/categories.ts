import {Router} from "express";
import {z} from "zod";
import {prisma} from "../lib/prisma";
import {authenticate,requireAdmin} from "../middleware/auth";
const router=Router();
router.get("/",async(_req,res,next)=>{try{res.json(await prisma.category.findMany({include:{_count:{select:{products:true}}},orderBy:{name:"asc"}}));}catch(e){next(e);}});
router.post("/",authenticate,requireAdmin,async(req,res,next)=>{try{const {name}=z.object({name:z.string().min(2).max(80)}).parse(req.body);res.status(201).json(await prisma.category.create({data:{name}}));}catch(e){next(e);}});
export default router;