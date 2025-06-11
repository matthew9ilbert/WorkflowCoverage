import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import type { Task } from "@shared/schema";

export default function TaskManagement() {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      await apiRequest("PUT", `/api/tasks/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task updated",
        description: "The task has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch = 
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesAssignee = assigneeFilter === "all" || task.assignedTo === assigneeFilter;
    const matchesLocation = locationFilter === "all" || task.location === locationFilter;
    
    return matchesSearch && matchesPriority && matchesStatus && matchesAssignee && matchesLocation;
  });

  const pendingTasks = filteredTasks.filter((task: Task) => task.status === "pending");
  const inProgressTasks = filteredTasks.filter((task: Task) => task.status === "in_progress");
  const completedTasks = filteredTasks.filter((task: Task) => task.status === "completed");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateTaskMutation.mutate({
      id: taskId,
      updates: { 
        status: newStatus,
        ...(newStatus === "completed" && { completedAt: new Date() })
      }
    });
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
        <Badge className={getPriorityColor(task.priority || "medium")}>
          {(task.priority || "medium").toUpperCase()}
        </Badge>
      </div>
      <p className="text-xs text-gray-600 mb-3">{task.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{task.location}</span>
        <span>
          {task.deadline ? `Due: ${new Date(task.deadline).toLocaleDateString()}` : "No deadline"}
        </span>
      </div>
      {task.status === "in_progress" && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: "65%" }}></div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">
              {task.assignedTo?.split(' ').map(n => n[0]).join('').toUpperCase() || "UN"}
            </span>
          </div>
          <span className="text-xs text-gray-600">{task.assignedTo || "Unassigned"}</span>
        </div>
        <Select 
          value={task.status || "pending"} 
          onValueChange={(value) => handleStatusChange(task.id, value)}
        >
          <SelectTrigger className="w-24 h-6 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 h-96"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        <Button 
          onClick={() => setCreateTaskOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>
      
      {/* Task Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Tasks</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {tasks && [...new Set(tasks.map((task: Task) => task.assignedTo).filter(Boolean))].map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="building_a">Building A</SelectItem>
                  <SelectItem value="building_b">Building B</SelectItem>
                  <SelectItem value="common_areas">Common Areas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* To-Do List */}
      <Card className="bg-green-50 border-2 border-green-300 mb-6">
        <CardHeader>
          <CardTitle>To-Do List</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full mb-3 justify-center" onClick={() => alert('Add new to-do item')}>
            Add New To-Do
          </Button>
          <ul className="interactive-todo-list">
            <li onClick={() => alert('To-Do item clicked')}>Item 1</li>
            <li onClick={() => alert('To-Do item clicked')}>Item 2</li>
          </ul>
        </CardContent>
      </Card>

      {/* Task Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              Pending ({pendingTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {pendingTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No pending tasks</p>
            ) : (
              pendingTasks.map((task: Task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </CardContent>
        </Card>
        
        {/* In Progress Tasks */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              In Progress ({inProgressTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {inProgressTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No tasks in progress</p>
            ) : (
              inProgressTasks.map((task: Task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </CardContent>
        </Card>
        
        {/* Completed Tasks */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Completed ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {completedTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No completed tasks</p>
            ) : (
              completedTasks.map((task: Task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <CreateTaskModal 
        open={createTaskOpen} 
        onOpenChange={setCreateTaskOpen} 
      />
    </div>
  );
}
