
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Default availability options that can be customized
const defaultAvailabilityOptions = [
  "Full-time",
  "Part-time",
  "Weekends only",
  "Weekdays only",
  "On-call",
  "Flexible"
];

// Location options
const locationOptions = [
  "Bellevue Medical Center",
  "Factoria Medical Center", 
  "Lynnwood Medical Center",
  "Northshore Medical Center",
  "Smokey Point Medical Center"
];

export default function AddEmployeeModal({ open, onOpenChange }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    altEmail: "",
    phone: "",
    location: "",
    customLocation: "",
    shift: "",
    availability: "",
    customAvailability: "",
    startYear: "",
    role: "",
  });

  const [availabilityOptions, setAvailabilityOptions] = useState(defaultAvailabilityOptions);
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [showCustomAvailability, setShowCustomAvailability] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      const employeeData = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        altEmail: data.altEmail,
        phone: data.phone,
        department: data.location === "custom" ? data.customLocation : data.location,
        shift: data.shift,
        availability: data.availability === "custom" ? data.customAvailability : data.availability,
        startYear: data.startYear ? parseInt(data.startYear) : null,
        role: data.role,
        status: "active"
      };
      await apiRequest("POST", "/api/employees", employeeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Employee added",
        description: "The employee has been successfully added to the system.",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      altEmail: "",
      phone: "",
      location: "",
      customLocation: "",
      shift: "",
      availability: "",
      customAvailability: "",
      startYear: "",
      role: "",
    });
    setShowCustomLocation(false);
    setShowCustomAvailability(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "First name, last name, and email are required.",
        variant: "destructive",
      });
      return;
    }

    // Add custom availability to options if it's new
    if (formData.availability === "custom" && formData.customAvailability && 
        !availabilityOptions.includes(formData.customAvailability)) {
      setAvailabilityOptions(prev => [...prev, formData.customAvailability]);
    }

    createEmployeeMutation.mutate(formData);
  };

  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, location: value }));
    setShowCustomLocation(value === "custom");
  };

  const handleAvailabilityChange = (value: string) => {
    setFormData(prev => ({ ...prev, availability: value }));
    setShowCustomAvailability(value === "custom");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="altEmail">Alt. Email</Label>
            <Input
              id="altEmail"
              type="email"
              placeholder="Enter alternative email address"
              value={formData.altEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, altEmail: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Select value={formData.location} onValueChange={handleLocationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Location</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showCustomLocation && (
            <div>
              <Label htmlFor="customLocation">Custom Location</Label>
              <Input
                id="customLocation"
                placeholder="Enter custom location"
                value={formData.customLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, customLocation: e.target.value }))}
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shift">Shift</Label>
              <Select value={formData.shift} onValueChange={(value) => setFormData(prev => ({ ...prev, shift: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startYear">Seniority (Start Year)</Label>
              <Input
                id="startYear"
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                placeholder="e.g. 2020"
                value={formData.startYear}
                onChange={(e) => setFormData(prev => ({ ...prev, startYear: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="availability">Availability</Label>
            <Select value={formData.availability} onValueChange={handleAvailabilityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                {availabilityOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Availability</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showCustomAvailability && (
            <div>
              <Label htmlFor="customAvailability">Custom Availability</Label>
              <Input
                id="customAvailability"
                placeholder="Enter custom availability"
                value={formData.customAvailability}
                onChange={(e) => setFormData(prev => ({ ...prev, customAvailability: e.target.value }))}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              placeholder="Enter job role/title"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createEmployeeMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createEmployeeMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
