import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Settings, Smartphone, Mail, MessageSquare, Phone, Calendar, FileText, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageSource {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  pollInterval?: number;
  webhookUrl?: string;
}

export default function MessageMonitoring() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSource, setSelectedSource] = useState<MessageSource | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>("");

  const { data: sourcesData, isLoading } = useQuery({
    queryKey: ['/api/shortcuts/sources'],
    queryFn: () => apiRequest('/api/shortcuts/sources')
  });

  const toggleSourceMutation = useMutation({
    mutationFn: async ({ sourceId, enabled }: { sourceId: string; enabled: boolean }) => {
      return apiRequest(`/api/shortcuts/sources/${sourceId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ enabled })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shortcuts/sources'] });
      toast({
        title: "Source updated",
        description: "Message source status updated successfully"
      });
    }
  });

  const getWebhookUrlMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      return apiRequest(`/api/shortcuts/sources/${sourceId}/webhook-url`);
    },
    onSuccess: (data) => {
      setWebhookUrl(data.webhookUrl);
    }
  });

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'sms': return <Smartphone className="h-5 w-5" />;
      case 'email': case 'outlook': return <Mail className="h-5 w-5" />;
      case 'teams': return <MessageSquare className="h-5 w-5" />;
      case 'voicemail': return <Phone className="h-5 w-5" />;
      case 'calendar': return <Calendar className="h-5 w-5" />;
      case 'notes': return <FileText className="h-5 w-5" />;
      case 'reminders': return <CheckSquare className="h-5 w-5" />;
      default: return <MessageSquare className="h-5 w-5" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Webhook URL copied to clipboard"
    });
  };

  const sources = sourcesData?.sources || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Message Monitoring</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Message Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure automatic monitoring of text messages, emails, and other communication channels
          </p>
        </div>
      </div>

      <Alert>
        <Smartphone className="h-4 w-4" />
        <AlertDescription>
          Enable message sources below and use the webhook URLs in your Apple Shortcuts to automatically process incoming messages.
          Each source can extract tasks, schedule reminders, and update your workplace management system.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {sources.map((source: MessageSource) => (
          <Card key={source.id} className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    {getSourceIcon(source.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <CardDescription className="capitalize">{source.type} monitoring</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={source.enabled ? "default" : "secondary"}>
                    {source.enabled ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={source.enabled}
                    onCheckedChange={(enabled) => 
                      toggleSourceMutation.mutate({ sourceId: source.id, enabled })
                    }
                    disabled={toggleSourceMutation.isPending}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {source.enabled ? (
                    <span>Monitoring enabled - processing incoming {source.type} messages</span>
                  ) : (
                    <span>Enable to start monitoring {source.type} messages</span>
                  )}
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSource(source);
                        if (source.enabled) {
                          getWebhookUrlMutation.mutate(source.id);
                        }
                      }}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Setup
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        {getSourceIcon(source.type)}
                        <span>Configure {source.name}</span>
                      </DialogTitle>
                      <DialogDescription>
                        Set up Apple Shortcuts integration for {source.name}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Webhook URL</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={webhookUrl}
                            readOnly
                            placeholder={source.enabled ? "Generating..." : "Enable source to get URL"}
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(webhookUrl)}
                            disabled={!webhookUrl}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Apple Shortcuts Instructions</Label>
                        <Textarea
                          readOnly
                          value={`1. Create a new Apple Shortcut
2. Add "Get Contents of URL" action
3. Set Method to POST
4. Set URL to the webhook URL above
5. In Request Body, add:
   {
     "content": "[Message Content]",
     "sender": "[Sender Name]",
     "id": "[Unique ID]"
   }
6. Trigger this shortcut when receiving ${source.type} messages`}
                          rows={8}
                          className="text-xs font-mono"
                        />
                      </div>
                      
                      <Alert>
                        <AlertDescription className="text-xs">
                          This webhook will automatically extract tasks and insights from incoming messages.
                          High-priority tasks will be created automatically in your system.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">Background Processing</CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-200">
            This system can run in the background on your computer or mobile device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Supported Platforms</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-200">
                <li>• macOS (native app support)</li>
                <li>• iOS (Apple Shortcuts integration)</li>
                <li>• Windows (background service)</li>
                <li>• Linux (systemd service)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Deployment Options</h4>
              <ul className="space-y-1 text-blue-700 dark:text-blue-200">
                <li>• Docker container</li>
                <li>• Cloud hosting (AWS, Azure, GCP)</li>
                <li>• Local server</li>
                <li>• Raspberry Pi</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}