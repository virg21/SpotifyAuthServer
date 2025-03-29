import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// Status card component
interface StatusCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  subValue?: string;
  progress?: number;
}

const StatusCard: FC<StatusCardProps> = ({ title, icon, value, subValue, progress }) => {
  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-muted-foreground text-sm uppercase tracking-wider">{title}</h3>
          <span className="text-primary">{icon}</span>
        </div>
        <div className="flex items-center">
          {title === "Status" && (
            <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
          )}
          <span className="text-xl font-semibold">{value}</span>
        </div>
        {subValue && <p className="text-sm text-muted-foreground mt-2">{subValue}</p>}
        {progress !== undefined && (
          <>
            <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{progress}% of allocated memory</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard: FC = () => {
  return (
    <div className="p-6 lg:ml-64">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-semibold text-neutral-600">Server Dashboard</h1>
          <Button className="bg-primary hover:bg-primary/90">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Restart Server
          </Button>
        </div>
        <p className="text-muted-foreground">Manage your Node.js Spotify authentication server</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatusCard 
          title="Status" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
          } 
          value="Running" 
          subValue="Uptime: 2d 5h 43m" 
        />
        
        <StatusCard 
          title="Environment" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            </svg>
          } 
          value="Development" 
          subValue="NODE_ENV=development" 
        />
        
        <StatusCard 
          title="Auth Requests" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
          } 
          value="152" 
          subValue="Today: 24 requests" 
        />
        
        <StatusCard 
          title="Memory Usage" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <path d="M1 10h22"></path>
            </svg>
          } 
          value="64.2 MB" 
          progress={28} 
        />
      </div>

      {/* Server Structure */}
      <Card className="mb-8">
        <div className="border-b border-neutral-200 p-6">
          <h2 className="text-xl font-semibold">Server Structure</h2>
          <p className="text-muted-foreground mt-2">Overview of your modular Node.js Spotify authentication server</p>
        </div>
        
        <CardContent className="p-6">
          <div className="bg-neutral-100 p-4 rounded-lg mb-6">
            <pre className="text-sm text-neutral-600 whitespace-pre-wrap font-mono">
{`project/
├── .env                  # Environment variables configuration
├── server/
│   ├── index.ts          # Main Express server setup
│   ├── routes.ts         # Route registration
│   ├── routes/
│   │   └── authRoutes.ts # Authentication route definitions
│   ├── controllers/
│   │   └── authController.ts # Authentication controller logic
│   ├── config/
│   │   └── env.ts        # Environment configuration
│   ├── middleware/
│   │   └── errorHandler.ts # Error handling middleware
│   └── utils/
│       └── spotifyApi.ts # Spotify API utilities`}
            </pre>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mr-2">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                  <line x1="6" y1="6" x2="6.01" y2="6"></line>
                  <line x1="6" y1="18" x2="6.01" y2="18"></line>
                </svg>
                <h3 className="font-semibold">index.ts</h3>
              </div>
              <div className="p-4">
                <pre className="text-xs text-neutral-600 overflow-x-auto font-mono">
{`// Main server setup
import express from 'express';
import { validateEnv } from './config/env';
import { errorHandler, notFound } from './middleware/errorHandler';
import { registerRoutes } from './routes';

// Validate environment variables
validateEnv();

const app = express();
const PORT = process.env.PORT || 8888;

app.use(express.json());

// Register API routes
registerRoutes(app);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`}
                </pre>
              </div>
            </div>
            
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mr-2">
                  <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
                <h3 className="font-semibold">authRoutes.ts</h3>
              </div>
              <div className="p-4">
                <pre className="text-xs text-neutral-600 overflow-x-auto font-mono">
{`// Authentication routes
import express from 'express';
import { login, callback, refreshToken } from '../controllers/authController';

const router = express.Router();

// Route for initiating Spotify login
router.get('/login', login);

// Callback route for Spotify auth
router.get('/callback', callback);

// Refresh token route
router.post('/refresh', refreshToken);

export default router;`}
                </pre>
              </div>
            </div>
            
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mr-2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3 className="font-semibold">authController.ts</h3>
              </div>
              <div className="p-4">
                <pre className="text-xs text-neutral-600 overflow-x-auto font-mono">
{`// Authentication controller logic
import { Request, Response } from "express";
import axios from "axios";
import querystring from "querystring";
import { getEnv } from "../config/env";

export const login = (req: Request, res: Response) => {
  try {
    // Get configuration from environment
    const clientId = getEnv("SPOTIFY_CLIENT_ID");
    const redirectUri = getEnv("SPOTIFY_REDIRECT_URI");
    
    // Define scopes for Spotify permissions
    const scopes = 'user-read-private user-read-email';
    
    // Redirect to Spotify auth page
    res.redirect(
      'https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + clientId +
      '&scope=' + encodeURIComponent(scopes) +
      '&redirect_uri=' + encodeURIComponent(redirectUri)
    );
  } catch (error) {
    console.error('Error in login controller:', error);
    res.status(500).json({ error: 'Failed to initiate auth' });
  }
};

// Handle callback from Spotify
export const callback = async (req: Request, res: Response) => {
  // Token exchange implementation
  // ...
};`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card className="mb-8">
        <div className="border-b border-neutral-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Environment Variables</h2>
            <p className="text-muted-foreground mt-2">Configured in .env file using dotenv package</p>
          </div>
          <Button variant="outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
            Edit Variables
          </Button>
        </div>
        
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-neutral-100 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Variable</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="px-6 py-4 font-mono text-sm text-muted-foreground">PORT</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-500 text-white">Set</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">8888</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">Server port number</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-sm text-muted-foreground">SPOTIFY_CLIENT_ID</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-500 text-white">Set</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">
                    <div className="flex items-center">
                      <span>•••••••••••••••••••••</span>
                      <button className="ml-2 text-primary hover:text-primary/80">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">Spotify API client ID</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-sm text-muted-foreground">SPOTIFY_CLIENT_SECRET</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-500 text-white">Set</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">
                    <div className="flex items-center">
                      <span>•••••••••••••••••••••</span>
                      <button className="ml-2 text-primary hover:text-primary/80">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">Spotify API client secret</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-sm text-muted-foreground">SPOTIFY_REDIRECT_URI</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-500 text-white">Set</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm truncate">http://localhost:5000/api/auth/callback</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">OAuth callback URL</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-sm text-muted-foreground">NODE_ENV</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-500 text-white">Set</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">development</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">Environment mode</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card className="mb-8">
        <div className="border-b border-neutral-200 p-6">
          <h2 className="text-xl font-semibold">API Endpoints</h2>
          <p className="text-muted-foreground mt-2">Available routes with descriptions and usage examples</p>
        </div>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="px-2 py-1 text-xs bg-primary text-white rounded mr-3">GET</span>
                  <h3 className="font-mono font-semibold">/api/auth/login</h3>
                </div>
                <span className="text-xs bg-green-500 bg-opacity-10 text-green-600 px-2 py-1 rounded">Active</span>
              </div>
              <div className="p-4">
                <p className="text-sm mb-4">Initiates Spotify authentication flow by redirecting to Spotify's authorization page.</p>
                <div className="bg-neutral-100 p-3 rounded mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Example Usage:</p>
                  <code className="text-xs font-mono">http://localhost:5000/api/auth/login</code>
                </div>
                <p className="text-xs text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1 text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Redirects user to Spotify for login with scopes defined in controller
                </p>
              </div>
            </div>
            
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="px-2 py-1 text-xs bg-primary text-white rounded mr-3">GET</span>
                  <h3 className="font-mono font-semibold">/api/auth/callback</h3>
                </div>
                <span className="text-xs bg-green-500 bg-opacity-10 text-green-600 px-2 py-1 rounded">Active</span>
              </div>
              <div className="p-4">
                <p className="text-sm mb-4">Callback endpoint that Spotify redirects to after user authentication.</p>
                <div className="bg-neutral-100 p-3 rounded mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Example Response:</p>
                  <pre className="text-xs font-mono overflow-x-auto">
{`{
  "access_token": "BQD...[token]",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "AQA...[token]"
}`}
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1 text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Exchanges authorization code for access and refresh tokens
                </p>
              </div>
            </div>
            
            <div className="border border-neutral-200 rounded-lg overflow-hidden border-dashed opacity-60">
              <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="px-2 py-1 text-xs bg-neutral-300 text-neutral-600 rounded mr-3">GET</span>
                  <h3 className="font-mono font-semibold">/api/events</h3>
                </div>
                <span className="text-xs bg-neutral-300 bg-opacity-30 text-neutral-500 px-2 py-1 rounded">Future</span>
              </div>
              <div className="p-4">
                <p className="text-sm mb-4">Future endpoint for retrieving Spotify events or user activity.</p>
                <div className="bg-neutral-100 p-3 rounded opacity-50">
                  <p className="text-xs text-muted-foreground">Ready for implementation</p>
                </div>
              </div>
            </div>
            
            <div className="border border-neutral-200 rounded-lg overflow-hidden border-dashed opacity-60">
              <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="px-2 py-1 text-xs bg-neutral-300 text-neutral-600 rounded mr-3">GET</span>
                  <h3 className="font-mono font-semibold">/api/users</h3>
                </div>
                <span className="text-xs bg-neutral-300 bg-opacity-30 text-neutral-500 px-2 py-1 rounded">Future</span>
              </div>
              <div className="p-4">
                <p className="text-sm mb-4">Future endpoint for user management and profile information.</p>
                <div className="bg-neutral-100 p-3 rounded opacity-50">
                  <p className="text-xs text-muted-foreground">Ready for implementation</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
