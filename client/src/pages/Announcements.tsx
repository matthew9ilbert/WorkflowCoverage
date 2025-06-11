import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Megaphone, Calendar, User } from "lucide-react";
import AnnouncementModal from "@/components/modals/AnnouncementModal";
import type { Announcement } from "@shared/schema";

export default function Announcements() {
  const [announcementOpen, setAnnouncementOpen] = useState(false);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["/api/announcements"],
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
          <div className="space-y-4">
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
        <h1 className="text-2xl font-bold text-gray-900">Team Announcements</h1>
        <Button 
          onClick={() => setAnnouncementOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Announcement
        </Button>
      </div>
      
      {/* Bulletin Board */}
      <Card className="bg-yellow-50 border-2 border-yellow-300 mb-6">
        <CardHeader>
          <CardTitle>Bulletin Board</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full mb-3 justify-center" onClick={() => alert('Post new announcement')}>
            Post New Announcement
          </Button>
          <div className="bulletin-board">
            <p>Interactive Bulletin Board:</p>
            <div className="pin" onClick={() => alert('Pin clicked!')}>Click any pin to interact</div>
          </div>
        </CardContent>
      </Card>

      {/* Announcement List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements</h3>
              <p className="text-gray-600 mb-6">
                Create your first announcement to communicate with your team
              </p>
              <Button 
                onClick={() => setAnnouncementOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement: Announcement) => (
            <Card key={announcement.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                      <Badge className={getPriorityColor(announcement.priority || "normal")}>
                        {(announcement.priority || "normal").toUpperCase()}
                      </Badge>
                      {announcement.isActive && (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{announcement.content}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {announcement.author}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(announcement.createdAt!).toLocaleDateString()}
                      </span>
                      <span>
                        Audience: {announcement.audience || "All"}
                      </span>
                      {announcement.expiresAt && (
                        <span>
                          Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AnnouncementModal 
        open={announcementOpen} 
        onOpenChange={setAnnouncementOpen} 
      />
    </div>
  );
}
