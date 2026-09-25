import {Router} from "express";
import {z} from "zod";
import {prisma} from "../lib/prisma";
import {authenticate,requireAdmin} from "../middleware/auth";
const router=Router();
const product=z.object({name:z.string().min(2),description:z.string().max(2000).optional(),sku:z.string().min(2).max(50),price:z.coerce.number().positive(),stock:z.coerce.number().int().min(0),categoryId:z.string().min(1)});
router.get("/",async(req,res,next)=>{
 try{const q=z.object({search:z.string().optional(),categoryId:z.string().optional(),page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(100).default(20)}).parse(req.query);
 const where={...(q.categoryId?{categoryId:q.categoryId}:{}),...(q.search?{name:{contains:q.search,mode:"insensitive" as const}}:{})};
 const [items,total]=await Promise.all([prisma.product.findMany({where,include:{category:true},skip:(q.page-1)*q.limit,take:q.limit,orderBy:{createdAt:"desc"}}),prisma.product.count({where})]);
 res.json({items,pagination:{page:q.page,limit:q.limit,total,pages:Math.ceil(total/q.limit)}});}catch(e){next(e);}
});
router.post("/",authenticate,requireAdmin,async(req,res,next)=>{try{res.status(201).json(await prisma.product.create({data:product.parse(req.body)}));}catch(e){next(e);}});
router.patch("/:id",authenticate,requireAdmin,async(req,res,next)=>{try{res.json(await prisma.product.update({where:{id:req.params.id},data:product.partial().parse(req.body)}));}catch(e){next(e);}});
router.delete("/:id",authenticate,requireAdmin,async(req,res,next)=>{try{await prisma.product.delete({where:{id:req.params.id}});res.status(204).send();}catch(e){next(e);}});
export default router;