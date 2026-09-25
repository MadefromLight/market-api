import {Router} from "express";
import {prisma} from "../lib/prisma";
import {authenticate,AuthRequest} from "../middleware/auth";
const router=Router();router.use(authenticate);
router.post("/",async(req:AuthRequest,res,next)=>{
 try{const order=await prisma.$transaction(async tx=>{
  const cart=await tx.cart.findUnique({where:{userId:req.user!.id},include:{items:{include:{product:true}}}});
  if(!cart||!cart.items.length)throw Object.assign(new Error("Cart is empty"),{statusCode:400});
  let total=0;for(const item of cart.items){if(item.product.stock<item.quantity)throw Object.assign(new Error(`Insufficient stock for ${item.product.name}`),{statusCode:409});total+=Number(item.product.price)*item.quantity;}
  const created=await tx.order.create({data:{userId:req.user!.id,total,items:{create:cart.items.map(i=>({productId:i.productId,quantity:i.quantity,unitPrice:i.product.price}))}},include:{items:{include:{product:true}}}});
  for(const item of cart.items)await tx.product.update({where:{id:item.productId},data:{stock:{decrement:item.quantity}}});
  await tx.cartItem.deleteMany({where:{cartId:cart.id}});return created;});
  res.status(201).json(order);
 }catch(e){if(e&&typeof e==="object"&&"statusCode" in e)return res.status(Number((e as {statusCode:number}).statusCode)).json({message:(e as Error).message});next(e);}
});
router.get("/",async(req:AuthRequest,res,next)=>{try{res.json(await prisma.order.findMany({where:{userId:req.user!.id},include:{items:{include:{product:true}}},orderBy:{createdAt:"desc"}}));}catch(e){next(e);}});
export default router;