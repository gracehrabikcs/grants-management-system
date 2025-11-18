import { useState, useEffect } from "react";

export default function useNotifications() {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (message) => {
    const newNote = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleString()
    };
    setNotifications((prev) => [newNote, ...prev]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification
  };
}
