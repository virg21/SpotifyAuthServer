import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/authRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add API prefix to all routes
  app.use('/api/auth', authRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
