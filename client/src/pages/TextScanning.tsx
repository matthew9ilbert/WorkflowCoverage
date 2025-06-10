import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Scan, FileText, Mail, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TextScanning() {
  const [textContent, setTextContent] = useState("");
  const [source, setSource] = useState("");
  const [extractedTasks, setExtractedTasks] = useState<any[]>([]);
  
  const { toast } = useToast();

  const scanTextMutation = useMutation({
    mutationFn: async (data: { content: string; source: string }) => {
      const response = await apiRequest("POST", "/api/text-scan", data);
      return response.json();
    },
    onSuccess: (data) => {
      setExtractedTasks(data.extractedTasks || []);
      toast({
        title: "Text processed successfully",
        description: "Tasks have been extracted from the text.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process text. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleScanText = () => {
    if (!textContent.trim() || !source) {
      toast({
        title: "Validation Error",
        description: "Please provide both text content and source.",
        variant: "destructive",
      });
      return;
    }

    scanTextMutation.mutate({ content: textContent, source });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Text Scanning & Extraction</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scan className="w-5 h-5 mr-2" />
              Text Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select communication source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS/Text Message</SelectItem>
                  <SelectItem value="voice">Voice/Voicemail</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="form">Web Form</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Content
              </label>
              <Textarea
                placeholder="Paste communication text here for task extraction..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={10}
                className="resize-none"
              />
            </div>
            
            <Button 
              onClick={handleScanText}
              disabled={scanTextMutation.isPending || !textContent.trim() || !source}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {scanTextMutation.isPending ? "Processing..." : "Extract Tasks"}
            </Button>
          </CardContent>
        </Card>
        
        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Extracted Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {extractedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Scan className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="mb-2">No tasks extracted yet</p>
                <p className="text-sm">Process some text to see extracted tasks here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {extractedTasks.map((task, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <Badge className="bg-blue-100 text-blue-800">
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Location: {task.location || "Not specified"}</span>
                      <span>Deadline: {task.deadline || "Not specified"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>How Text Scanning Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Multi-Source Input</h3>
              <p className="text-sm text-gray-600">
                Process text from emails, SMS, voice messages, Teams, and forms
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Scan className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">AI-Powered Extraction</h3>
              <p className="text-sm text-gray-600">
                Uses NLP to identify tasks, locations, deadlines, and priorities
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Smart Processing</h3>
              <p className="text-sm text-gray-600">
                Automatically creates structured tasks ready for assignment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
