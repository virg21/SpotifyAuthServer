import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Import all route modules
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import musicRoutes from "./routes/musicRoutes";
import verificationRoutes from "./routes/verificationRoutes";
import emailVerificationRoutes from "./routes/emailVerificationRoutes";
import eventRoutes from "./routes/eventRoutes";
import recommendationRoutes from "./routes/recommendationRoutes";
import testRoutes from "./routes/testRoutes";

// Import additional middleware if needed
import { errorHandler, notFound } from "./middleware/errorHandler";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register API routes with appropriate prefixes
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/music', musicRoutes);
  app.use('/api/verify', verificationRoutes);
  app.use('/api/email', emailVerificationRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/test', testRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      message: 'Server is running',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    });
  });

  // API endpoints for server information (useful for dashboard)
  app.get('/api/server/stats', (req, res) => {
    const memoryUsage = process.memoryUsage();
    
    res.status(200).json({
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100, // RSS in MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // Heap total in MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // Heap used in MB
        external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100, // External in MB
      },
      uptime: process.uptime(), // Server uptime in seconds
      nodeVersion: process.version,
      platform: process.platform
    });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // 404 handler for API routes only
  app.use('/api/*', notFound);

  // Global error handler
  app.use(errorHandler);

  return httpServer;
}
