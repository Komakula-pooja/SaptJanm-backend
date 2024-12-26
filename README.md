```
clone- git clone https://github.com/Komakula-pooja/SaptJanm-backend.git
cd backend 
```

```
npm install

```

```
update the DATABASE_URL in your .env file and add connection pooling link in wrangler.toml
npx prisma migrate dev --name init_schema
npx prisma generate --no-engine
npm run dev

```

```
npm run deploy
```
