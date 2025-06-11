import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { 
  Activity, 
  Users, 
  Clock, 
  CheckSquare, 
  FileText, 
  Megaphone, 
  Scan, 
  BarChart2,
  Home,
  ChevronDown,
  Plus,
  Edit,
  X,
  Check,
  Monitor,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultNavigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Communication Hub", href: "/communication-hub", icon: MessageCircle, badge: 'NEW' },
  { name: "Contact Directory", href: "/contacts", icon: Users },
  { name: "Shift Coverage", href: "/coverage", icon: Clock },
  { name: "Task Management", href: "/tasks", icon: CheckSquare },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
  { name: "Text Scanning", href: "/scanning", icon: Scan },
  { name: "Message Monitoring", href: "/monitoring", icon: Monitor },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
];

const iconOptions = [
  { name: "Home", component: Home },
  { name: "Users", component: Users },
  { name: "Clock", component: Clock },
  { name: "CheckSquare", component: CheckSquare },
  { name: "FileText", component: FileText },
  { name: "Megaphone", component: Megaphone },
  { name: "Scan", component: Scan },
  { name: "BarChart2", component: BarChart2 },
  { name: "Activity", component: Activity },
  { name: "Monitor", component: Monitor },
  { name: "MessageCircle", component: MessageCircle },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [navigation, setNavigation] = useState(defaultNavigation);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: "", href: "", icon: "Home" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addCustomEntry = () => {
    if (newEntry.name && newEntry.href) {
      const selectedIcon = iconOptions.find(opt => opt.name === newEntry.icon)?.component || Home;
      setNavigation([...navigation, { ...newEntry, icon: selectedIcon }]);
      setNewEntry({ name: "", href: "", icon: "Home" });
      setShowAddDialog(false);
    }
  };

  const removeCustomEntry = (index: number) => {
    setNavigation(navigation.filter((_, i) => i !== index));
  };

  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-900 shadow-lg w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out lg:translate-x-0 fixed lg:relative z-30 h-full",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">EVS Workflow</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="space-y-1">
            {navigation && navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              const isCustom = index >= defaultNavigation.length;

              return (
                <div key={item.name} className="relative group">
                  <Link href={item.href}>
                    <a 
                      className={cn(
                        "nav-item",
                        isActive 
                          ? "active bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium" 
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                      onClick={() => onClose()}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs bg-blue-100 text-blue-700">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </Link>
                  {isCustom && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                      onClick={() => removeCustomEntry(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })}

            {/* Add Custom Entry Button */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 mt-2"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Custom Page
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Custom Navigation Entry</DialogTitle>
                  <DialogDescription>
                    Create a custom navigation link for your workflow
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Page Name</Label>
                    <Input
                      id="name"
                      value={newEntry.name}
                      onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                      placeholder="e.g., Custom Reports"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="href">URL Path</Label>
                    <Input
                      id="href"
                      value={newEntry.href}
                      onChange={(e) => setNewEntry({ ...newEntry, href: e.target.value })}
                      placeholder="e.g., /custom-reports"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <Select value={newEntry.icon} onValueChange={(value) => setNewEntry({ ...newEntry, icon: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon.name} value={icon.name}>
                            {icon.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addCustomEntry} disabled={!newEntry.name || !newEntry.href}>
                      Add Entry
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.[0] || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.roles?.[0] || "Staff"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}