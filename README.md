## 🚀 Next.js Admin Dashboard

An admin dashboard built using Next.js framework and Tailwind CSS

## 🛠️ How to Run This Project

### 📋 Prerequisites

- Ensure you have [Node.js](https://nodejs.org/) installed.
- Ensure you have [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) installed.

### 🌐 Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

```js
// Postgress Database
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

// Auth
AUTH_SECRET=
AUTH_URL=http://localhost:3000

```

### 🗄️ Setting up your vercel Postgres database

1. Deploy your project to vercel or visit [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for step by step guide
2. Navigate to the `Storage` tab once your project is deployed
3. Select Create Database and choose Postgres and click Continue.
4. Choose your region and storage plan, if required
5. Once connected, navigate to the `.env.local` tab, click Show secret and Copy Snippet. Make sure you reveal the secrets before copying them.
6. Navigate to your code editor and rename the `.env.example` file to `.env.` Paste in the copied contents from Vercel.

### 🌱 Seeding the database

Now that your database has been created, let's seed it with some initial data.

To seed your database, run the following command

```js
 npm run seed
```

### 🚀 Start your local server

To start your local server, run the following command:

```js
npm run dev
```

### 💡 Pro Tip

"Great dashboards are built with great attention to detail. Keep iterating and improving!"

### 🤝 Contributing

I welcome all kinds of contributions! Feel free to open issues or submit pull requests.
