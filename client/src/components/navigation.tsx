import { FC } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Navigation: FC = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary">Spotify Auth Server</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link href="/">
                <Button 
                  variant={isActive("/") ? "default" : "ghost"}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    isActive("/") ? "bg-primary text-white" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Home
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button 
                  variant={isActive("/dashboard") ? "default" : "ghost"}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    isActive("/dashboard") ? "bg-primary text-white" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/events">
                <Button 
                  variant={isActive("/events") ? "default" : "ghost"}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    isActive("/events") ? "bg-primary text-white" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Events
                </Button>
              </Link>
              <Link href="/loaders">
                <Button 
                  variant={isActive("/loaders") ? "default" : "ghost"}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    isActive("/loaders") ? "bg-primary text-white" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Loaders
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
            <Link href="/connect-spotify">
              <Button 
                variant="default" 
                size="sm"
                className="bg-[#1DB954] hover:bg-[#1AA84A] text-white"
              >
                Connect Spotify
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              Documentation
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/">
            <Button 
              variant={isActive("/") ? "default" : "ghost"}
              className={cn(
                "w-full justify-start rounded-md px-3 py-2 text-base font-medium",
                isActive("/") ? "bg-primary text-white" : "text-gray-600 hover:text-gray-900"
              )}
            >
              Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button 
              variant={isActive("/dashboard") ? "default" : "ghost"}
              className={cn(
                "w-full justify-start rounded-md px-3 py-2 text-base font-medium",
                isActive("/dashboard") ? "bg-primary text-white" : "text-gray-600 hover:text-gray-900"
              )}
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/events">
            <Button 
              variant={isActive("/events") ? "default" : "ghost"}
              className={cn(
                "w-full justify-start rounded-md px-3 py-2 text-base font-medium",
                isActive("/events") ? "bg-primary text-white" : "text-gray-600 hover:text-gray-900"
              )}
            >
              Events
            </Button>
          </Link>
          <Link href="/loaders">
            <Button 
              variant={isActive("/loaders") ? "default" : "ghost"}
              className={cn(
                "w-full justify-start rounded-md px-3 py-2 text-base font-medium",
                isActive("/loaders") ? "bg-primary text-white" : "text-gray-600 hover:text-gray-900"
              )}
            >
              Loaders
            </Button>
          </Link>
          <Link href="/connect-spotify">
            <Button 
              variant="default"
              className="w-full justify-start rounded-md px-3 py-2 text-base font-medium bg-[#1DB954] hover:bg-[#1AA84A] text-white"
            >
              Connect Spotify
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;