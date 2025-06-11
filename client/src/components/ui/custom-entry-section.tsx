import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomEntry {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  data: any;
  createdAt: Date;
}

interface CustomEntrySectionProps {
  title: string;
  description: string;
  category: string;
  allowedCategories?: string[];
  onSave?: (entry: Omit<CustomEntry, 'id' | 'createdAt'>) => void;
  onEdit?: (id: string, entry: Partial<CustomEntry>) => void;
  onDelete?: (id: string) => void;
  existingEntries?: CustomEntry[];
}

export function CustomEntrySection({
  title,
  description,
  category,
  allowedCategories = ['general', 'task', 'note', 'reminder'],
  onSave,
  onEdit,
  onDelete,
  existingEntries = []
}: CustomEntrySectionProps) {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: category,
    priority: "medium" as const,
    data: {}
  });

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      onEdit?.(editingId, formData);
      setEditingId(null);
    } else {
      onSave?.(formData);
    }

    setFormData({
      title: "",
      description: "",
      category: category,
      priority: "medium",
      data: {}
    });
    setShowDialog(false);

    toast({
      title: "Success",
      description: editingId ? "Entry updated successfully" : "Entry created successfully"
    });
  };

  const handleEdit = (entry: CustomEntry) => {
    setFormData({
      title: entry.title,
      description: entry.description || "",
      category: entry.category,
      priority: entry.priority,
      data: entry.data
    });
    setEditingId(entry.id);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    onDelete?.(id);
    toast({
      title: "Deleted",
      description: "Entry removed successfully"
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="border-2 border-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {title}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300 mt-1">
              {description}
            </CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button 
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    title: "",
                    description: "",
                    category: category,
                    priority: "medium",
                    data: {}
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Custom Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-800 dark:text-slate-100">
                  {editingId ? "Edit Entry" : "Create Custom Entry"}
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-300">
                  {editingId ? "Update your custom entry" : "Add a new custom entry to your workspace"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-700 dark:text-slate-200 font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter title..."
                    className="border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 dark:text-slate-200 font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description..."
                    rows={3}
                    className="border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-200 font-medium">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="border-slate-300 dark:border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-200 font-medium">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="border-slate-300 dark:border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDialog(false)}
                    className="border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {editingId ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {existingEntries.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-lg font-medium mb-1">No custom entries yet</p>
            <p className="text-sm">Create your first custom entry to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {existingEntries.map((entry) => (
              <div 
                key={entry.id} 
                className="group p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                        {entry.title}
                      </h4>
                      <Badge className={getPriorityColor(entry.priority)}>
                        {entry.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {entry.category}
                      </Badge>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        {entry.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Created {entry.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => handleEdit(entry)}
                    >
                      <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}