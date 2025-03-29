import { FC } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const Sidebar: FC = () => {
  const [location] = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/", icon: "home" },
    { name: "Authentication", href: "/auth", icon: "key" },
    { name: "API Routes", href: "/api-routes", icon: "code" },
    { 
      name: "Events", 
      href: "/events", 
      icon: "calendar", 
      badge: "Future" 
    },
    { 
      name: "Users", 
      href: "/users", 
      icon: "users", 
      badge: "Future" 
    },
    { name: "Settings", href: "/settings", icon: "cog" },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg fixed inset-y-0 left-0 z-10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex-shrink-0" id="sidebar">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary text-2xl mr-3">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="21.17" y1="8" x2="12" y2="8" />
              <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
              <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
            </svg>
            <h1 className="text-lg font-semibold">Spotify Auth Server</h1>
          </div>
        </div>
        
        <nav className="flex-grow py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className={cn(
                    "flex items-center px-6 py-3 border-l-4",
                    location === item.href
                      ? "text-primary bg-blue-50 border-primary"
                      : "hover:bg-neutral-100 border-transparent hover:border-neutral-300"
                  )}>
                    <span className="w-5 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {item.icon === "home" && (
                          <>
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </>
                        )}
                        {item.icon === "key" && (
                          <>
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                          </>
                        )}
                        {item.icon === "code" && (
                          <>
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                          </>
                        )}
                        {item.icon === "calendar" && (
                          <>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </>
                        )}
                        {item.icon === "users" && (
                          <>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </>
                        )}
                        {item.icon === "cog" && (
                          <>
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </>
                        )}
                      </svg>
                    </span>
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs bg-neutral-200 rounded-full px-2 py-1">
                        {item.badge}
                      </span>
                    )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
              <span className="text-sm">Server Online</span>
            </div>
            <span className="text-xs bg-neutral-200 px-2 py-1 rounded">Port 8888</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
