import { Hono } from 'hono'
import { userRouter } from './routes/user';
import { profileRouter } from './routes/profile';
import { cors } from 'hono/cors'


const app = new Hono<{
  Bindings:{
    DATABASE_URL:string;
    JWT_SECRET:string
  }
}>();

app.use('/*',cors({
  origin: ['http://localhost:5173/', 'https://sapt-janm.vercel.app'], 
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders:['content-length'],
  maxAge:600,
  credentials:true
}))

app.options('/*', (c) => {
  c.header('Access-Control-Allow-Origin', 'https://sapt-janm.vercel.app');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Allow-Credentials', 'true');
  return c.json({ message: 'Preflight OK' });
});

app.route("api/v1/user",userRouter);
app.route("api/v1/profile",profileRouter)


export default app




