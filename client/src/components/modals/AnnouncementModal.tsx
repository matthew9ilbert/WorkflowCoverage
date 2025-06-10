import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AnnouncementModal({ open, onOpenChange }: AnnouncementModalProps) {
  const [formData, setFormData] = useState({
    announcementId: "",
    title: "",
    content: "",
    audience: "all",
    priority: "normal",
    isActive: true,
    expiresAt: undefined as Date | undefined,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const announcementData = {
        ...data,
        announcementId: data.announcementId || `ANN${Date.now()}`,
        expiresAt: data.expiresAt ? data.expiresAt.toISOString() : null,
        readBy: [],
      };
      await apiRequest("POST", "/api/announcements", announcementData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: "Announcement created",
        description: "The announcement has been successfully published.",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      announcementId: "",
      title: "",
      content: "",
      audience: "all",
      priority: "normal",
      isActive: true,
      expiresAt: undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    createAnnouncementMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="announcementId">Announcement ID (Optional)</Label>
              <Input
                id="announcementId"
                placeholder="Auto-generated if empty"
                value={formData.announcementId}
                onChange={(e) => setFormData(prev => ({ ...prev, announcementId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Announcement Title</Label>
            <Input
              id="title"
              placeholder="Enter announcement title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your announcement content here..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={5}
              required
            />
          </div>

          <div>
            <Label htmlFor="audience">Target Audience</Label>
            <Select value={formData.audience} onValueChange={(value) => setFormData(prev => ({ ...prev, audience: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                <SelectItem value="Bellevue Medical Center">Bellevue Medical Center</SelectItem>
                <SelectItem value="Factoria Medical Center">Factoria Medical Center</SelectItem>
                <SelectItem value="Lynnwood Medical Center">Lynnwood Medical Center</SelectItem>
                <SelectItem value="Northshore Medical Center">Northshore Medical Center</SelectItem>
                <SelectItem value="Smokey Point Medical Center">Smokey Point Medical Center</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Publish immediately</Label>
            </div>

            <div>
              <Label>Expiration Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expiresAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiresAt ? format(formData.expiresAt, "PPP") : "Select expiration date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expiresAt}
                    onSelect={(date) => setFormData(prev => ({ ...prev, expiresAt: date }))}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-gray-500 mt-1">
                Leave empty for permanent announcement
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createAnnouncementMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createAnnouncementMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createAnnouncementMutation.isPending ? "Publishing..." : "Publish Announcement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}