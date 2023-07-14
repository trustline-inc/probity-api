import cors from "cors";
import express from  "express";
import { expressjwt as jwt } from "express-jwt";
import ExpressPinoLogger from 'express-pino-logger';
import accountsRouter from "./routes/accounts";
import eventsRouter from "./routes/events";
import usersRouter from "./routes/users";
import healthRouter from "./routes/health";
import infoRouter from "./routes/info";
import errorHandler from "./errorHandler"

/**
 * Pino Logger
 */
const pino = ExpressPinoLogger({
  serializers: {
    req: (req: any) => ({
      method: req.method,
      url: req.url
    }),
  },
  prettyPrint: { colorize: true },
  autoLogging: {
    ignorePaths: ["/"] // Ignore LB health checks
  }
})

/**
 * JWT Authentication
 */
 const checkJwt = jwt({
  secret: "secret",
  algorithms: ["HS256"]
}).unless({
  path: [
    { url: "/", methods: ['GET'] },
    { url: "/v1/health", methods: ['GET'] },
    { url: "/v1/users/login", methods: ['POST', 'OPTIONS'] },
    { url: "/v1/users/register", methods: ['POST', 'OPTIONS'] },
  ]
});

/**
 * CORS
 */
const corsCheck = cors({
  origin: (origin, callback) => {
    const allowlist = [];
    const message = "The CORS policy for this site does not allow access from the specified origin.";
    // Allow requests with no origin (mobile, curl)
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === "development") {
      // Probity runs on port 8000
      allowlist.push("http://localhost:8000");
    }
    if (process.env.NODE_ENV === "production") {
      allowlist.push("https://probity.finance");
    }
    if (!allowlist.includes(origin)) return callback(new Error(message), false);
    return callback(null, true);
  }
})

const app = express();
app.use(checkJwt);
app.use(pino);
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(corsCheck)

/**
 * Routes
 */
app.use('/v1/info', infoRouter);
app.use('/v1/health', healthRouter);
app.use('/v1/users', usersRouter);
app.use('/v1/accounts', accountsRouter);
app.use('/v1/events', eventsRouter);

/**
 * Error Handler
 */
app.use(errorHandler)

export default app;