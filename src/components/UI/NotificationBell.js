import React, { useState } from "react";
import "../../styles/NotificationBell.css";

const NotificationBell = ({ notifications, removeNotification }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="notif-bell-container">
      <div className="notif-bell" onClick={() => setOpen(!open)}>
        🔔
        {notifications.length > 0 && (
          <span className="notif-count">{notifications.length}</span>
        )}
      </div>

      {open && (
        <div className="notif-dropdown">
          {notifications.length === 0 ? (
            <p className="empty">No notifications</p>
          ) : (
            notifications.map((note) => (
              <div key={note.id} className="notif-item">
                <p>{note.message}</p>
                <small>{note.timestamp}</small>
                <button
                  className="dismiss-btn"
                  onClick={() => removeNotification(note.id)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
