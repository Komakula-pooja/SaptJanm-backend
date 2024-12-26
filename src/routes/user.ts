import { Hono } from "hono";
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '@prisma/client/edge'
import { sign } from 'hono/jwt'
import { signupInput,signinInput, updateUserInput } from "@komakula/saptjanam-common";

export const userRouter=new Hono<{
    Bindings:{
        DATABASE_URL:string;
        JWT_SECRET:string
      }
}>();

userRouter.post('/signup',async(c)=>{
    const body=await c.req.json();
    const {success} = signupInput.safeParse(body);
    if(!success){
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    const prisma=new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    try{
     const user= await prisma.user.create({
        data:{
          email:body.email,
          password:body.password,
        }
      })
      const jwt=await sign({
        id: user.id
      },c.env.JWT_SECRET)
  
      return c.json({
        token:jwt,
        id:user.id
      })
    }catch(e){
      c.status(411);
      return c.text('Invalid')
    }
   
  })
  
   
  userRouter.post('/signin',async(c)=>{
    const body=await c.req.json();
    const {success}=signinInput.safeParse(body);
    if(!success){
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }
    const prisma=new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    try{
     const user= await prisma.user.findFirst({
        where:{
          email:body.email,
          password:body.password
        }
      })
      if(!user){
        c.status(403);
        return c.json({
          message:"Incorrect credentials" 
        })
      }
      const jwt=await sign({
        id: user.id
      },c.env.JWT_SECRET);
  
      return c.json({
        token:jwt,
        id:user.id
      })
    }catch(e){
      c.status(411);
      return c.text('Invalid')
    }
  })
  
userRouter.put('/', async(c)=>{
  const body = await c.req.json();
  const validationResult = updateUserInput.safeParse(body);

  if(!validationResult.success){
    c.status(411);
    return c.json({
        message: "Inputs not correct",
        errors: validationResult.error.format(),
    })
  }

  const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try{
    const user= await prisma.user.update({
      where:{
        id:body.id
      },
      data:{
        ...validationResult.data
      }
    })
    const jwt=await sign({
      id: user.id
    },c.env.JWT_SECRET);

    return c.json({
      token:jwt,
      id:user.id
    })
  }catch(e){
    c.status(411);
    return c.text('Invalid')
  }
  
})