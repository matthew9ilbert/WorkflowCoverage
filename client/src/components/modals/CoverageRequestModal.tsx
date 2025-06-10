import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Employee } from "@shared/schema";

interface CoverageRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CoverageRequestModal({ open, onOpenChange }: CoverageRequestModalProps) {
  const [formData, setFormData] = useState({
    employeeNeedingCoverage: "",
    coverageDate: undefined as Date | undefined,
    coverageNotes: "",
    urgency: "medium",
    requestedBy: "",
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  const createCoverageRequestMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!data.employeeNeedingCoverage || !data.coverageDate || !data.coverageNotes.trim()) {
        throw new Error("Missing required fields");
      }

      const requestData = {
        employeeId: selectedEmployee?.id || null,
        employeeName: data.employeeNeedingCoverage,
        location: selectedEmployee?.department || "",
        shift: selectedEmployee?.shift || "",
        coverageDate: data.coverageDate.toISOString(),
        reason: data.coverageNotes,
        urgency: data.urgency,
        requestedBy: data.requestedBy || "Current User",
        status: "pending"
      };

      await apiRequest("POST", "/api/coverage-requests", requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coverage-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({
        title: "Coverage request created",
        description: "The coverage request has been successfully submitted.",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Coverage request error:", error);
      toast({
        title: "Error",
        description: "Failed to create coverage request. Please check all required fields.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      employeeNeedingCoverage: "",
      coverageDate: undefined,
      coverageNotes: "",
      urgency: "medium",
      requestedBy: "",
    });
    setSelectedEmployee(null);
  };

  const handleEmployeeChange = (employeeName: string) => {
    const employee = employees.find((emp: Employee) => emp.name === employeeName);
    setSelectedEmployee(employee || null);
    setFormData(prev => ({ ...prev, employeeNeedingCoverage: employeeName }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeNeedingCoverage || !formData.coverageDate || !formData.coverageNotes.trim()) {
      toast({
        title: "Validation Error", 
        description: "Employee needing coverage, coverage date, and coverage notes are required.",
        variant: "destructive",
      });
      return;
    }

    createCoverageRequestMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Shift Coverage</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="employeeNeedingCoverage">Employee Needing Coverage</Label>
            <Select value={formData.employeeNeedingCoverage} onValueChange={handleEmployeeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee who needs coverage" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee: Employee) => (
                  <SelectItem key={employee.id} value={employee.name || ""}>
                    {employee.name} ({employee.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployee && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Location:</strong> {selectedEmployee.department || "Not specified"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Shift:</strong> {selectedEmployee.shift || "Not specified"}
              </p>
            </div>
          )}

          <div>
            <Label>Coverage Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.coverageDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.coverageDate ? format(formData.coverageDate, "PPP") : "Pick coverage date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.coverageDate}
                  onSelect={(date) => setFormData(prev => ({ ...prev, coverageDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="coverageNotes">Coverage Notes</Label>
            <Textarea
              id="coverageNotes"
              placeholder="Enter reason for coverage and any additional details"
              value={formData.coverageNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, coverageNotes: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="urgency">Urgency</Label>
              <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="requestedBy">Requested By</Label>
              <Input
                id="requestedBy"
                placeholder="Your name"
                value={formData.requestedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, requestedBy: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createCoverageRequestMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCoverageRequestMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createCoverageRequestMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}