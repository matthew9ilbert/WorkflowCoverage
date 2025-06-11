import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, CheckCircle, TrendingUp, Calendar, MapPin } from "lucide-react";
import CoverageRequestModal from "@/components/modals/CoverageRequestModal";
import type { CoverageRequest } from "@shared/schema";

export default function ShiftCoverage() {
  const [coverageRequestOpen, setCoverageRequestOpen] = useState(false);

  const { data: coverageRequests = [], isLoading } = useQuery({
    queryKey: ["/api/coverage-requests"],
  });

  const openRequests = coverageRequests.filter((req: CoverageRequest) => req.status === "open");
  const coverageRate = coverageRequests.length > 0 
    ? Math.round((coverageRequests.filter((req: CoverageRequest) => req.status === "covered").length / coverageRequests.length) * 100)
    : 0;
  const avgResponseTime = 45; // This would be calculated from actual data

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Shift Coverage</h1>
        <Button 
          onClick={() => setCoverageRequestOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Request Coverage
        </Button>
      </div>

      {/* Calendar */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <Calendar
                onSelect={(date) => console.log('Selected date:', date)}
                modifiersStyles={{
                  selected: { backgroundColor: '#ffeb3b', color: '#ffffff' },
                  today: { backgroundColor: '#ff5733', color: '#ffffff' },
                }} 
                onDayDoubleClick={(day) => alert(`Day double-clicked: ${day}`)}
              />
          </CardContent>
        </Card>
      </div>

      {/* Coverage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Open Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{openRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Coverage Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{coverageRate}%</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{avgResponseTime}m</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Coverage Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Active Coverage Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {openRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No active coverage requests</p>
              <p className="text-sm">All shifts are currently covered</p>
            </div>
          ) : (
            <div className="space-y-4">
              {openRequests.map((request: CoverageRequest) => (
                <div key={request.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {request.shift} Shift - {request.location}
                        </h4>
                        <Badge className={getUrgencyColor(request.urgency || "normal")}>
                          {(request.urgency || "normal").toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{request.reason}</p>
                      <div className="flex items-center space-x-6 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(request.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {request.startTime} - {request.endTime}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {request.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Accept
                      </Button>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CoverageRequestModal 
        open={coverageRequestOpen} 
        onOpenChange={setCoverageRequestOpen} 
      />
    </div>
  );
}