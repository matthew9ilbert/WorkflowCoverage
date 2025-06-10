import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
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
  ChevronDown 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Contact Directory", href: "/contacts", icon: Users },
  { name: "Shift Coverage", href: "/coverage", icon: Clock },
  { name: "Task Management", href: "/tasks", icon: CheckSquare },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
  { name: "Text Scanning", href: "/scanning", icon: Scan },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div 
      className={cn(
        "bg-white shadow-lg w-64 flex-shrink-0 border-r border-gray-200 transition-all duration-300 ease-in-out lg:translate-x-0 fixed lg:relative z-30 h-full",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">EVS Workflow</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <Link key={item.name} href={item.href}>
                  <a 
                    className={cn(
                      "nav-item",
                      isActive 
                        ? "active bg-blue-50 text-blue-600 font-medium" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                    onClick={() => onClose()}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        </nav>
        
        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role || "EVS Staff"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
