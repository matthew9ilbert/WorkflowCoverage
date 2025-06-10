import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Clock, Users, CheckCircle, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";

export default function Analytics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/analytics/metrics"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const analyticsData = metrics || {
    taskCompletionRate: 94.5,
    avgResponseTime: 2.3,
    employeeUtilization: 87,
    coverageSuccessRate: 91,
    taskCompletionTrend: 15,
    responseTimeTrend: -15,
    utilizationTrend: 3,
    coverageTrend: 3,
    departmentPerformance: [
      { name: "Housekeeping", performance: 96, color: "bg-green-500" },
      { name: "Maintenance", performance: 89, color: "bg-yellow-500" },
      { name: "Security", performance: 92, color: "bg-blue-500" },
      { name: "Facilities", performance: 85, color: "bg-purple-500" },
    ]
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Task Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analyticsData.taskCompletionRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${analyticsData.taskCompletionRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Average Response Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analyticsData.avgResponseTime}h
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-600 text-sm">
              <TrendingDown className="w-4 h-4 mr-1" />
              <span>{Math.abs(analyticsData.responseTimeTrend)}% faster than last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Employee Utilization</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analyticsData.employeeUtilization}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${analyticsData.employeeUtilization}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Coverage Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analyticsData.coverageSuccessRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+{analyticsData.coverageTrend}% from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Task completion trends chart</p>
                <p className="text-xs">Chart integration would be implemented here</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.departmentPerformance.map((dept: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                    <span className="text-sm text-gray-600">{dept.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${dept.color} h-2 rounded-full`} 
                      style={{ width: `${dept.performance}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Top Performance</h3>
              <p className="text-2xl font-bold text-green-700 mb-1">Housekeeping</p>
              <p className="text-sm text-green-600">96% completion rate</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Most Improved</h3>
              <p className="text-2xl font-bold text-blue-700 mb-1">Security</p>
              <p className="text-sm text-blue-600">+8% this month</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <h3 className="font-medium text-orange-900 mb-2">Needs Attention</h3>
              <p className="text-2xl font-bold text-orange-700 mb-1">Facilities</p>
              <p className="text-sm text-orange-600">85% completion rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
