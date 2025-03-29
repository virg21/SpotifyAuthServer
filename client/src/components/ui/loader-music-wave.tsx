import React from "react";
import { cn } from "@/lib/utils";

interface MusicWaveLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of bars in the music wave
   * @default 5
   */
  bars?: number;
  
  /**
   * Color of the music wave bars
   * @default 'currentColor'
   */
  color?: string;
  
  /**
   * Size of the loader
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
}

/**
 * A music wave animated loading indicator
 * Each bar animates up and down like a sound wave
 */
export function MusicWaveLoader({
  bars = 5,
  color = 'currentColor',
  size = 'medium',
  className,
  ...props
}: MusicWaveLoaderProps) {
  // Determine size classes
  const sizeClasses = {
    small: {
      container: "h-8",
      bar: "w-1"
    },
    medium: {
      container: "h-16", 
      bar: "w-2"
    },
    large: {
      container: "h-24",
      bar: "w-3"
    }
  };

  // Array of delays for the animation of each bar
  // We want them to be slightly offset to create a wave effect
  const getAnimationDelay = (index: number) => {
    const baseDelays = [0, 0.2, 0.4, 0.2, 0];
    return `${baseDelays[index % baseDelays.length]}s`;
  };
  
  return (
    <div 
      className={cn(
        "flex items-end justify-center gap-1 px-2",
        sizeClasses[size].container,
        className
      )}
      aria-label="Loading"
      role="status"
      {...props}
    >
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className={cn(
            "music-wave-bar rounded-t-sm animate-music-wave bg-current",
            sizeClasses[size].bar
          )}
          style={{
            animationDelay: getAnimationDelay(i),
            backgroundColor: color,
            height: "40%", // Starting height before animation
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}