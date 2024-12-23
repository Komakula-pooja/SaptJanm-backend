
import { Hono } from "hono";
import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '@prisma/client/edge'
import { verify } from "hono/jwt";
import { createProfile,updateProfile } from "@komakula/saptjanam-common";

export const profileRouter=new Hono<{
    Bindings:{
        DATABASE_URL:string;
        JWT_SECRET:string
      },
      Variables:{
        userId:string;
    }
}>();


profileRouter.use("/*", async(c, next)=>{
    const authHeader=c.req.header("authorization") || "";
    try{
      const user= await verify(authHeader, c.env.JWT_SECRET);

      if(user){
          c.set("userId",String(user.id));
          await next();
      }else{
          c.status(403);
          return c.json({
              message:"You are not logged in"
          })
      }
    }catch(e){
        c.status(403);
            return c.json({
                message:"You are not logged in"
            })
    }
})

profileRouter.post("/", async(c)=>{
  try{
    const body=await c.req.json();

    const validationResult = createProfile.safeParse(body);

    if(!validationResult.success){
      c.status(411);
      return c.json({
          message: "Inputs not correct",
          errors: validationResult.error.format(),
      })
    }
    const authorId=c.get("userId")

    const prisma=new PrismaClient({
      datasourceUrl:c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const profile = await prisma.profile.create({
      data:{
        ...validationResult.data,
        userId:Number(authorId)
      }
    })
    return c.json({
      id:profile.id
    })
  } catch(err){
    return c.json({err},500)
  }
})

profileRouter.put("/",async(c)=>{
  try{
    const body = await c.req.json();
    const validationResult = updateProfile.safeParse(body);

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

    const profile = await prisma.profile.update({
        where:{
          id:body.id
        },
        data:{
          ...validationResult.data
        }
    })
    return c.json({
      id:profile.id
    })

  }catch(err){
    return c.json({err},500)
  }

})

profileRouter.get("/bulk", async(c)=>{

  const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const userId = c.get("userId");
  const userProfile = await prisma.profile.findUnique({
    where: { userId: Number(userId) },
  });

  if (!userProfile) {
    return c.json({ message: "User profile not found" }, 404);
  }

  const filters: any = {};
  filters.gender = userProfile.gender === "Male" ? "Female" : "Male";
  filters.religion = userProfile.religion;
  filters.maritalStatus = userProfile.maritalStatus;

  const profiles= await prisma.profile.findMany({
    where:filters,
    select:{
      id:true,
      name:true,
      age:true,
      gender:true,
      religion:true,
      location:true,
      maritalStatus:true,
      familyStatus:true,
      familyType:true,
      education:true,
      employedIn:true,
      occupation:true,
      createdAt:true
    }
  });

  return c.json({
    profiles
  })

})

profileRouter.get("/:id", async(c)=>{
  const id=c.req.param("id")
  const prisma=new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const profiles= await prisma.profile.findFirst({

    where:{
      id:Number(id)
    },
    select:{
      name:true,
      age:true,
      gender:true,
      religion:true,
      location:true,
      maritalStatus:true,
      familyStatus:true,
      familyType:true,
      education:true,
      employedIn:true,
      occupation:true,
      createdAt:true
    }
  });

  return c.json({
    profiles
  })

})


