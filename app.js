const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const passport = require('passport');

const app = express();

// Set up PostgreSQL connection pool
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL, // This uses the DATABASE_URL from your .env file
});

// Configure session management
app.use(
  session({
    store: new pgSession({
      pool: pgPool, // Connection pool
      tableName: 'session', // Default is 'session'
    }),
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true in production with HTTPS
  })
);

passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) return done(null, false);
      
      const isValid = await bcrypt.compare(password, user.password);
      return isValid ? done(null, user) : done(null, false);
    })
  );
  
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  });
  
  app.use(passport.initialize());
  app.use(passport.session());