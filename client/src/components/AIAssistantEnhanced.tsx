import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CustomEntrySection } from "@/components/ui/custom-entry-section";
import { 
  Bot, 
  Send, 
  Lightbulb, 
  TrendingUp, 
  FileText, 
  MessageCircle, 
  Zap,
  Brain,
  Target,
  Sparkles,
  Code,
  Database,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'insight' | 'recommendation' | 'analysis' | 'code';
}

interface User {
  id: string;
  name?: string;
  roles?: string[];
}

interface AIAssistantProps {
  user?: User;
}

export function AIAssistantEnhanced({ user }: AIAssistantProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeContext, setActiveContext] = useState<string>("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [customEntries, setCustomEntries] = useState<any[]>([]);

  const { data: insights } = useQuery({
    queryKey: ['/api/ai/insights'],
    queryFn: () => apiRequest('/api/ai/insights', {
      headers: { 'Content-Type': 'application/json' }
    })
  });

  const assistMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          context: activeContext,
          userId: user?.id 
        })
      });
    },
    onSuccess: (response) => {
      const assistantMessage: AIMessage = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: response.response || 'I can help you with that.',
        timestamp: new Date(),
        type: response.type || 'analysis'
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: () => {
      toast({
        title: "AI Assistant",
        description: "Unable to process request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    assistMutation.mutate(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const contextOptions = [
    { value: 'general', label: 'General Assistant', icon: Bot },
    { value: 'workflow', label: 'Workflow Analysis', icon: TrendingUp },
    { value: 'code', label: 'Code Review', icon: Code },
    { value: 'data', label: 'Data Insights', icon: Database },
    { value: 'strategy', label: 'Strategic Planning', icon: Target }
  ];

  const predefinedPrompts = [
    { text: "Analyze current workflow efficiency", context: "workflow" },
    { text: "Suggest task optimization strategies", context: "strategy" },
    { text: "Review recent performance metrics", context: "data" },
    { text: "Generate productivity insights", context: "general" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCustomEntryAdd = (entry: any) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setCustomEntries(prev => [...prev, newEntry]);
  };

  const handleCustomEntryEdit = (id: string, updates: any) => {
    setCustomEntries(prev => 
      prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry)
    );
  };

  const handleCustomEntryDelete = (id: string) => {
    setCustomEntries(prev => prev.filter(entry => entry.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <div className="card-executive p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h2 className="heading-professional">AI Assistant</h2>
              <p className="text-slate-600 dark:text-slate-300">
                Intelligent workflow analysis and recommendations
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="status-success">
              <Sparkles className="h-3 w-3 mr-1" />
              Enhanced
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hover-lift"
            >
              {isExpanded ? "Minimize" : "Expand"}
            </Button>
          </div>
        </div>

        {/* Context Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {contextOptions.map((context) => {
            const Icon = context.icon;
            return (
              <Button
                key={context.value}
                variant={activeContext === context.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveContext(context.value)}
                className={`${activeContext === context.value ? 'btn-primary-gradient' : ''} hover-glow`}
              >
                <Icon className="h-4 w-4 mr-1" />
                {context.label}
              </Button>
            );
          })}
        </div>

        {/* Quick Action Prompts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {predefinedPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="text-left justify-start h-auto p-3 hover-lift border border-slate-200 dark:border-slate-700"
              onClick={() => {
                setActiveContext(prompt.context);
                setInput(prompt.text);
              }}
            >
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500" />
                <span className="text-xs">{prompt.text}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <Card className={`card-professional transition-all duration-500 ${isExpanded ? 'h-96' : 'h-48'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>AI Conversation</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className={`px-6 ${isExpanded ? 'h-64' : 'h-32'}`}>
            <div className="space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">AI Assistant Ready</p>
                  <p className="text-sm">Ask me anything about your workflow</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'assistant' && (
                          <Bot className="h-4 w-4 mt-0.5 text-blue-600" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 opacity-70`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Message Input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask me about ${contextOptions.find(c => c.value === activeContext)?.label.toLowerCase()}...`}
                rows={2}
                className="input-professional resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || assistMutation.isPending}
                className="btn-primary-gradient px-4"
              >
                {assistMutation.isPending ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Dashboard */}
      {insights && (
        <Card className="card-professional animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span>AI Insights</span>
            </CardTitle>
            <CardDescription>
              Automated analysis and recommendations for your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-emerald-800 dark:text-emerald-300">Efficiency Score</span>
                </div>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">87%</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">+5% from last week</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-300">Task Completion</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">92%</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Above target</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800 dark:text-purple-300">AI Suggestions</span>
                </div>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">12</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Ready to implement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom AI Entries */}
      <CustomEntrySection
        title="Custom AI Prompts"
        description="Create and manage custom AI prompts and automation rules"
        category="ai-prompt"
        allowedCategories={['ai-prompt', 'automation', 'workflow', 'analysis']}
        onSave={handleCustomEntryAdd}
        onEdit={handleCustomEntryEdit}
        onDelete={handleCustomEntryDelete}
        existingEntries={customEntries}
      />

      {/* AI Configuration */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>AI Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure AI assistance preferences and automation settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Response Settings</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Enable proactive suggestions</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Auto-analyze workflow patterns</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Send daily insights email</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Automation Rules</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Auto-create tasks from messages</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Smart priority assignment</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Predictive scheduling</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}