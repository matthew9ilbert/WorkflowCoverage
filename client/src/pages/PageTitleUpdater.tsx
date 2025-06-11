
import { useEffect } from "react";
import { useLocation } from "wouter";

const PageTitleUpdater = () => {
  const [location] = useLocation();

  useEffect(() => {
    const pathToTitle = {
      "/": "Dashboard Overview",
      "/coverage": "Shift Coverage",
      "/announcements": "Announcements",
      "/tasks": "Task Management",
      // Add other routes and corresponding titles here
    };

    document.title = pathToTitle[location] || "App";
  }, [location]);

  return null;
};

export default PageTitleUpdater;

