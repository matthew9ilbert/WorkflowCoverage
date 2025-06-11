
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  MessageCircle, 
  Zap, 
  Brain, 
  Clock, 
  Users, 
  Target, 
  Mic, 
  MicOff,
  Send,
  Bot,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Workflow,
  Sparkles,
  Bell,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'user' | 'ai' | 'system' | 'prediction';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'acted_upon';
  suggestions?: string[];
  extractedTasks?: any[];
  contextId?: string;
}

interface PredictiveInsight {
  id: string;
  type: 'task_needed' | 'coverage_gap' | 'efficiency_opportunity' | 'issue_prevention';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  timeframe: string;
}

interface SmartWorkflow {
  id: string;
  name: string;
  trigger: string;
  steps: string[];
  successRate: number;
  avgCompletionTime: number;
  active: boolean;
}

export default function CommunicationHub() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState("hub");
  const [aiMode, setAiMode] = useState<'assistant' | 'predictive' | 'orchestrator'>('orchestrator');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time message stream
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/communication/messages'],
    queryFn: () => apiRequest('/api/communication/messages'),
    refetchInterval: 1000 // Real-time updates
  });

  // Predictive insights
  const { data: insights = [] } = useQuery({
    queryKey: ['/api/communication/insights'],
    queryFn: () => apiRequest('/api/communication/insights'),
    refetchInterval: 5000
  });

  // Smart workflows
  const { data: workflows = [] } = useQuery({
    queryKey: ['/api/communication/workflows'],
    queryFn: () => apiRequest('/api/communication/workflows')
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest('/api/communication/send', {
        method: 'POST',
        body: JSON.stringify(messageData)
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/communication/messages'] });
      scrollToBottom();
    }
  });

  // Execute workflow mutation
  const executeWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      return apiRequest(`/api/communication/workflows/${workflowId}/execute`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Workflow Executed",
        description: "Smart workflow has been triggered successfully"
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      content: message,
      type: 'user',
      aiMode,
      context: {
        currentTime: new Date().toISOString(),
        activeWorkflows: workflows.filter((w: SmartWorkflow) => w.active).length
      }
    });
  };

  const handleVoiceInput = () => {
    if (!isListening) {
      // Start voice recognition
      if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
        };

        recognition.start();
      }
    } else {
      setIsListening(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'ai': return <Bot className="h-4 w-4" />;
      case 'prediction': return <Brain className="h-4 w-4" />;
      case 'system': return <Radio className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Communication Hub</h1>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Intelligent Communication Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered communication orchestration with predictive insights and automated workflows
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Radio className="h-3 w-3 mr-1" />
            Live
          </Badge>
          <div className="flex items-center space-x-2">
            <Label htmlFor="ai-mode">AI Mode:</Label>
            <select 
              value={aiMode} 
              onChange={(e) => setAiMode(e.target.value as any)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="assistant">Assistant</option>
              <option value="predictive">Predictive</option>
              <option value="orchestrator">Orchestrator</option>
            </select>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hub">Communication Hub</TabsTrigger>
          <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
          <TabsTrigger value="workflows">Smart Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="hub" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chat Interface */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <span>Intelligent Communication Stream</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {messages.map((msg: Message) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : msg.type === 'ai' 
                          ? 'bg-purple-100 text-purple-900' 
                          : msg.type === 'prediction'
                          ? 'bg-green-100 text-green-900'
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          {getMessageIcon(msg.type)}
                          <span className="text-xs font-semibold">{msg.sender}</span>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(msg.priority)}`}></div>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                        {msg.suggestions && (
                          <div className="mt-2 space-y-1">
                            {msg.suggestions.map((suggestion, idx) => (
                              <Button
                                key={idx}
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6"
                                onClick={() => setMessage(suggestion)}
                              >
                                <Lightbulb className="h-3 w-3 mr-1" />
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message or describe what you need..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[60px]"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-2 right-12"
                      onClick={handleVoiceInput}
                    >
                      {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending || !message.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Status */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Create Task from Message
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Request Coverage
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Send Announcement
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Workflow className="h-4 w-4 mr-2" />
                    Trigger Workflow
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>AI Processing</span>
                        <span>98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Workflow Efficiency</span>
                        <span>94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Response Time</span>
                        <span>1.2s</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            {insights.map((insight: PredictiveInsight) => (
              <Card key={insight.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <span>{insight.title}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{insight.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Suggested Actions:</h4>
                    {insight.suggestedActions.map((action, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-xs text-gray-500">Timeframe: {insight.timeframe}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="grid gap-6">
            {workflows.map((workflow: SmartWorkflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Workflow className="h-5 w-5 text-blue-500" />
                      <span>{workflow.name}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Switch checked={workflow.active} />
                      <Button
                        size="sm"
                        onClick={() => executeWorkflowMutation.mutate(workflow.id)}
                        disabled={executeWorkflowMutation.isPending}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Execute
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium">Success Rate</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={workflow.successRate} className="flex-1 h-2" />
                        <span className="text-sm">{workflow.successRate}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Avg. Completion</span>
                      <p className="text-sm text-gray-600">{workflow.avgCompletionTime}min</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium mb-2 block">Trigger:</span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                      {workflow.trigger}
                    </code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Messages Processed</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">2,847</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-blue-500" />
                </div>
                <div className="flex items-center mt-4 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+18% from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Tasks Auto-Created</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">1,234</p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
                <div className="flex items-center mt-4 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+25% efficiency gain</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Response Time</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">1.2s</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex items-center mt-4 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>-30% faster</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
