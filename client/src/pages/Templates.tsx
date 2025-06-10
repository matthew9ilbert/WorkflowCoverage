import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export default function Templates() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Communication Templates</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Template Management</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            AI-driven communication template generation and management system. 
            Create dynamic templates for various EVS communications including call-outs, 
            task assignments, and announcements.
          </p>
          <div className="text-sm text-gray-500 space-y-2">
            <p>• Automated template generation based on communication patterns</p>
            <p>• Dynamic form field creation using machine learning</p>
            <p>• Template versioning and usage analytics</p>
            <p>• Multi-language support for diverse workforces</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
