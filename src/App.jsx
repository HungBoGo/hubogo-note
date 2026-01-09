import React, { useEffect } from "react";
import useStore from "./store/useStore";
import Sidebar from "./components/Sidebar";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import CategoryForm from "./components/CategoryForm";
import Statistics from "./pages/Statistics";
import PriorityView from "./components/PriorityView";
import TaskStatusView from "./components/TaskStatusView";
import AboutView from "./components/AboutView";
import TitleBar from "./components/TitleBar";
import WhatsNewDialog, { useWhatsNew } from "./components/WhatsNewDialog";
import UpdateNotification from "./components/UpdateNotification";
import { startDeadlineChecker, requestNotificationPermission } from "./utils/notifications";
import { startAutoBackup } from "./utils/backup";
import { initAnalytics } from "./utils/analytics";

function App() {
  const { theme, loadTasks, loadCategories, tasks, exportData, selectedView, isTaskFormOpen, isCategoryFormOpen } = useStore();
  const { showDialog: showWhatsNew, closeDialog: closeWhatsNew } = useWhatsNew();

  useEffect(() => {
    loadTasks();
    loadCategories();
    requestNotificationPermission();
    initAnalytics(); // Track app usage
  }, []);

  useEffect(() => {
    const stopChecker = startDeadlineChecker(() => tasks);
    const stopBackup = startAutoBackup(exportData);

    return () => {
      stopChecker();
      stopBackup();
    };
  }, [tasks]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className={`h-screen flex flex-col ` + (theme === "dark" ? "dark" : "")}>
      <TitleBar />
      {/* Responsive: flex-col on narrow screens, flex-row on wide screens */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          {selectedView === "statistics" ? (
            <Statistics />
          ) : selectedView === "priority" ? (
            <PriorityView />
          ) : selectedView === "status" ? (
            <TaskStatusView />
          ) : selectedView === "about" ? (
            <AboutView />
          ) : (
            <TaskList />
          )}
        </main>
      </div>

      {isTaskFormOpen && <TaskForm />}
      {isCategoryFormOpen && <CategoryForm />}
      {showWhatsNew && <WhatsNewDialog onClose={closeWhatsNew} />}
      <UpdateNotification />
    </div>
  );
}

export default App;
