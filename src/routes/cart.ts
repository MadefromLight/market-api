import {Router} from "express";
import {z} from "zod";
import {prisma} from "../lib/prisma";
import {AuthRequest,authenticate} from "../middleware/auth";
const router=Router();router.use(authenticate);
router.get("/",async(req:AuthRequest,res,next)=>{try{res.json(await prisma.cart.findUnique({where:{userId:req.user!.id},include:{items:{include:{product:true}}}})??{items:[]});}catch(e){next(e);}});
router.post("/items",async(req:AuthRequest,res,next)=>{
 try{const input=z.object({productId:z.string(),quantity:z.coerce.number().int().min(1).max(100)}).parse(req.body);
 const p=await prisma.product.findUnique({where:{id:input.productId}});if(!p)return res.status(404).json({message:"Product not found"});if(p.stock<input.quantity)return res.status(409).json({message:"Insufficient stock"});
 const cart=await prisma.cart.upsert({where:{userId:req.user!.id},create:{userId:req.user!.id},update:{}});
 const item=await prisma.cartItem.upsert({where:{cartId_productId:{cartId:cart.id,productId:input.productId}},create:{cartId:cart.id,productId:input.productId,quantity:input.quantity},update:{quantity:{increment:input.quantity}},include:{product:true}});
 res.status(201).json(item);}catch(e){next(e);}
});
router.delete("/items/:productId",async(req:AuthRequest,res,next)=>{try{const cart=await prisma.cart.findUnique({where:{userId:req.user!.id}});if(!cart)return res.status(404).json({message:"Cart not found"});await prisma.cartItem.delete({where:{cartId_productId:{cartId:cart.id,productId:req.params.productId}}});res.status(204).send();}catch(e){next(e);}});
export default router;