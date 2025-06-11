import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckSquare, Clock, Target, TrendingUp, TrendingDown, UserPlus, PlusSquare, Megaphone, Plus } from "lucide-react";
import { useState } from "react";
import AddEmployeeModal from "@/components/modals/AddEmployeeModal";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import CoverageRequestModal from "@/components/modals/CoverageRequestModal";
import AnnouncementModal from "@/components/modals/AnnouncementModal";

export default function Dashboard() {
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [coverageRequestOpen, setCoverageRequestOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = dashboardStats || {
    totalEmployees: 0,
    activeTasks: 0,
    coverageRequests: 0,
    completionRate: 0,
    employeeGrowth: 0,
    taskChange: 0,
    coverageChange: 0,
    completionChange: 0
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEmployees}</p>
              </div>
              <Link href="/employees">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center cursor-pointer">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </Link>
            </div>
            <div className="flex items-center mt-4 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+{stats.employeeGrowth}% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeTasks}</p>
              </div>
              <Link href="/tasks">
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center cursor-pointer">
                  <CheckSquare className="w-6 h-6 text-orange-600" />
                </div>
              </Link>
            </div>
            <div className="flex items-center mt-4 text-red-600 text-sm">
              <TrendingDown className="w-4 h-4 mr-1" />
              <span>{stats.taskChange}% from last week</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Coverage Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.coverageRequests}</p>
              </div>
              <Link href="/coverage">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center cursor-pointer">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
              </Link>
            </div>
            <div className="flex items-center mt-4 text-gray-500 text-sm">
              <span>No change</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completionRate}%</p>
              </div>
              <Link href="/completion">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center cursor-pointer">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </Link>
            </div>
            <div className="flex items-center mt-4 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+{stats.completionChange}% from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!dashboardStats?.recentActivity?.length ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity to display</p>
                </div>
              ) : (
                dashboardStats.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div>
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>

<Button 
  className="w-full justify-start bg-indigo-600 text-white hover:bg-indigo-700"
  onClick={() => alert('Quick Action Executed')}
>
  <UserPlus className="w-5 h-5 mr-3" />
  New Quick Action
</Button>

            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setAddEmployeeOpen(true)}
              >
                <UserPlus className="w-5 h-5 mr-3" />
                Add Employee
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setCreateTaskOpen(true)}
              >
                <PlusSquare className="w-5 h-5 mr-3" />
                Create Task
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setCoverageRequestOpen(true)}
              >
                <Clock className="w-5 h-5 mr-3" />
                Request Coverage
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setAnnouncementOpen(true)}
              >
                <Megaphone className="w-5 h-5 mr-3" />
                Send Announcement
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AddEmployeeModal 
        open={addEmployeeOpen} 
        onOpenChange={setAddEmployeeOpen} 
      />
      <CreateTaskModal 
        open={createTaskOpen} 
        onOpenChange={setCreateTaskOpen} 
      />
      <CoverageRequestModal 
        open={coverageRequestOpen} 
        onOpenChange={setCoverageRequestOpen} 
      />
      <AnnouncementModal 
        open={announcementOpen} 
        onOpenChange={setAnnouncementOpen} 
      />
    </div>
  );
}
