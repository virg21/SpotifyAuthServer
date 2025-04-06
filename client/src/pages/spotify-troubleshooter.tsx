import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function SpotifyTroubleshooter() {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<any>({});

  // Get browser and device information
  useEffect(() => {
    setBrowserInfo({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    });
  }, []);

  const formSchema = z.object({
    redirectUri: z.string().url("Please enter a valid URL"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      redirectUri: "https://workspace.vliste415.repl.co/api/auth/spotify/callback",
    },
  });

  async function testSpotifyConnectivity() {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/test-spotify-connectivity");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTestResults(data);
      toast({
        title: "Connectivity Test Completed",
        description: `${data.endpoints.filter((e: any) => e.success).length} of ${
          data.endpoints.length
        } endpoints are accessible`,
      });
    } catch (error) {
      console.error("Error testing connectivity:", error);
      toast({
        title: "Error",
        description: "Failed to test connectivity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateRedirectUri() {
    const values = form.getValues();
    setLoading(true);
    try {
      // In a real app, we'd call an API endpoint to update the redirect URI
      // For this demonstration, we'll just simulate it
      toast({
        title: "Redirect URI Updated",
        description: `Redirect URI set to: ${values.redirectUri}`,
      });

      // Re-test connectivity after updating
      await testSpotifyConnectivity();
    } catch (error) {
      console.error("Error updating redirect URI:", error);
      toast({
        title: "Error",
        description: "Failed to update redirect URI",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function openSpotifyAuth() {
    if (!testResults?.testAuthUrl) {
      toast({
        title: "Error",
        description: "Test Spotify connectivity first to get the auth URL",
        variant: "destructive",
      });
      return;
    }

    window.open(testResults.testAuthUrl, "_blank");
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Spotify Connectivity Troubleshooter</CardTitle>
          <CardDescription>
            Diagnose issues with Spotify authentication in the Replit environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testSpotifyConnectivity} disabled={loading}>
            {loading ? "Testing..." : "Test Spotify Connectivity"}
          </Button>

          {testResults && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium">Spotify Client Information</h3>
                <div className="mt-2 p-4 bg-muted rounded-md">
                  <p>
                    <strong>Client ID:</strong> {testResults.clientId}
                  </p>
                  <p>
                    <strong>Redirect URI:</strong> {testResults.redirectUri}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Make sure this exact Redirect URI is registered in your Spotify Developer
                    Dashboard.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Endpoint Connectivity</h3>
                <div className="mt-2 grid gap-2">
                  {testResults.endpoints.map((endpoint: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md ${
                        endpoint.success ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      <p className="font-medium">{endpoint.endpoint}</p>
                      <p>
                        Status: {endpoint.status} ({endpoint.time})
                      </p>
                      {endpoint.error && <p className="text-red-600">Error: {endpoint.error}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Environment Information</h3>
                <div className="mt-2 p-4 bg-muted rounded-md overflow-x-auto">
                  <pre className="text-xs">{JSON.stringify(testResults.environment, null, 2)}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Browser Information</h3>
                <div className="mt-2 p-4 bg-muted rounded-md overflow-x-auto">
                  <pre className="text-xs">{JSON.stringify(browserInfo, null, 2)}</pre>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={openSpotifyAuth} variant="outline">
                  Open Spotify Auth URL in New Tab
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  This will open the Spotify authorization URL in a new tab. You can check if it
                  loads correctly.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Update Redirect URI</CardTitle>
          <CardDescription>
            Make sure this matches exactly what is registered in your Spotify Developer Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(updateRedirectUri)} className="space-y-6">
              <FormField
                control={form.control}
                name="redirectUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spotify Redirect URI</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The full URL including http(s):// and path
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update and Test"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}