import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

/**
 * Route to redirect user to the Spotify authentication server
 * @route GET /api/spotify-proxy/login
 */
router.get("/login", (req: Request, res: Response) => {
  res.redirect("http://localhost:3000/api/login");
});

/**
 * Route to get the Spotify login URL without redirecting
 * @route GET /api/spotify-proxy/login-url
 */
router.get("/login-url", async (req: Request, res: Response) => {
  try {
    const response = await axios.get("http://localhost:3000/api/login");
    res.json({ url: response.request.res.responseUrl });
  } catch (error) {
    console.error("Error getting Spotify login URL:", error);
    res.status(500).json({ error: "Failed to get Spotify login URL" });
  }
});

export default router;