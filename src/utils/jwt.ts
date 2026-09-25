import jwt from "jsonwebtoken";
import { env } from "../config/env";
export function signToken(user:{id:string;role:"CUSTOMER"|"ADMIN"}) {
  return jwt.sign(user,env.JWT_SECRET,{expiresIn:env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]});
}