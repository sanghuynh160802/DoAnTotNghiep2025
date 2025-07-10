/*
const knex = require('knex');
require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app = express();
const knexConfig = require('./knexfile');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const appRouter = require('./routes/datacrawl');

app.use(cors({ origin: '*' }));
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/app', appRouter);


const environment = 'development';
// console log .env 
console.log(process.env.HOST, process.env.USER, process.env.PASSWORD, process.env.DATABASE)
const config = knexConfig[environment];
console.log(config)
const db = knex(config);

const port = 3009;
const ip = '0.0.0.0';
app.listen(port, ip, function () {
	console.log(`Example app listening on port ${port}`)
})
*/


const knex = require('knex');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const knexConfig = require('./knexfile');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const appRouter = require('./routes/datacrawl');
const path = require("path");  // ✅ Import path module

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/app', appRouter);

// Serve static files from the "public" folder
app.use("/public", express.static(path.join(__dirname, "public")));

const environment = 'development';
const config = knexConfig[environment];
const db = knex(config);

// Debugging: Log environment variables
console.log('Environment Variables:', {
  HOST: process.env.HOST,
  USER: process.env.USER,
  PASSWORD: process.env.PASSWORD,
  DATABASE: process.env.DATABASE,
  PORT: process.env.PORT
});

console.log('Knex Configuration:', config);

// Test the database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connection successful!');
    
    // Fetch and print first 5 rows
    return db('crawl_data.job_data').select('*').limit(5);
  })
  .then((rows) => {
    console.log('🔍 First 5 rows from crawl_data.job_data:', rows);
  })
  .catch((err) => {
    console.error('❌ Database query failed:', err);
  });

const port = 3009;
const ip = '0.0.0.0';
app.listen(port, ip, function () {
  console.log(`🚀 Server running on port ${port}`);
});
