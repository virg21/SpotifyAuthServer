import React from "react";
import { MusicWaveLoader } from "@/components/ui/loader-music-wave";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoadersDemo() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Animated Loaders</h1>
      <p className="text-muted-foreground text-lg">
        The following loaders can be used throughout the application when content is loading or processing.
      </p>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Music Wave Loaders */}
        <Card>
          <CardHeader>
            <CardTitle>Music Wave - Small</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <MusicWaveLoader size="small" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Music Wave - Medium</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <MusicWaveLoader size="medium" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Music Wave - Large</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <MusicWaveLoader size="large" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Music Wave - Primary Color</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <MusicWaveLoader color="hsl(var(--primary))" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Music Wave - Custom Bars (7)</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <MusicWaveLoader bars={7} color="hsl(var(--accent))" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Music Wave - Destructive</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <MusicWaveLoader color="hsl(var(--destructive))" />
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Usage Example</h2>
        <Card className="p-6">
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`// Import the component
import { MusicWaveLoader } from "@/components/ui/loader-music-wave";

// Use in a loading state
{isLoading ? (
  <MusicWaveLoader size="medium" color="hsl(var(--primary))" />
) : (
  <YourContent />
)}`}</code>
          </pre>
        </Card>
      </div>
    </div>
  );
}