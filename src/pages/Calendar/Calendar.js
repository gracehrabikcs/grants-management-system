import React, { useState, useEffect } from "react";
import "../../styles/Calendar.css";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    org: "",
    date: "",
    type: "Deadline",
  });

  // Fetch both JSON sources
  useEffect(() => {
    const fetchCalendarEvents = fetch("/data/calendarEvents.json").then(res =>
      res.json()
    );

    const fetchGrantTracking = fetch("/data/grantDetails.json")
      .then(res => res.json())
      .then(grants => {
        let taskEvents = [];

        grants.forEach(grant => {
          const grantTitle = grant.title;
          const tracking = grant.tracking || {};

          Object.keys(tracking).forEach(section => {
            tracking[section].forEach(task => {
              if (task.deadline) {
                taskEvents.push({
                  id: `T-${grant.id}-${section}-${task.id}`,
                  title: `${grantTitle}: ${task.name}`,
                  section,
                  grantId: grant.id,
                  taskId: task.id,
                  org: grant.organization,
                  date: task.deadline,
                  type: task.type || "Deadline" // Default to Deadline if type not set
                });
              }
            });
          });
        });

        return taskEvents;
      });

    Promise.all([fetchCalendarEvents, fetchGrantTracking])
      .then(([calendarData, trackingData]) => {
        setEvents([...calendarData, ...trackingData]);
      })
      .catch(err => console.error("Error loading events:", err));
  }, []);

  const handleAddEvent = () => {
    const event = {
      ...newEvent,
      id: `EVT-${String(events.length + 1).padStart(3, "0")}`,
    };
    setEvents([...events, event]);
    setShowModal(false);
    setNewEvent({ title: "", org: "", date: "", type: "Deadline" });
  };

  const filteredEvents =
    filterType === "All" ? events : events.filter(e => e.type === filterType);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < startingDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const getEventsForDay = day =>
    filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });

  const prevMonth = () => setSelectedDate(new Date(year, month - 1, 1));
  const nextMonth = () => setSelectedDate(new Date(year, month + 1, 1));

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const eventTypes = ["All", "Deadline", "Review", "Visit", "Report"];

  return (
    <div className="calendar-page">
      <h1>Calendar</h1>
      <p>Track deadlines, meetings, visits, and reports for grants</p>

      <div className="calendar-container">
        <div className="calendar-card">
          <div className="calendar-header">
            <h3>{monthNames[month]} {year}</h3>
            <div className="calendar-controls">
              <button onClick={prevMonth}>←</button>
              <button onClick={nextMonth}>→</button>

              <select
                className="filter-dropdown"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <button className="add-event-btn" onClick={() => setShowModal(true)}>
                + Add Event
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            <table>
              <thead>
                <tr>
                  <th>Su</th><th>Mo</th><th>Tu</th><th>We</th>
                  <th>Th</th><th>Fr</th><th>Sa</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.ceil(days.length / 7) }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {days.slice(rowIndex * 7, rowIndex * 7 + 7).map((day, i) => (
                      <td key={i} className={day ? "" : "empty"}>
                        {day && (
                          <div className="calendar-day">
                            <span className="day-number">{day}</span>
                            <div className="day-events">
                              {getEventsForDay(day).map(ev => (
                                <div
                                  key={ev.id}
                                  className={`event-entry ${ev.type.toLowerCase()}`}
                                  title={ev.title}
                                >
                                  <span className={`event-dot ${ev.type.toLowerCase()}`}></span>
                                  <span className="event-title">
                                    {ev.title.length > 20 ? ev.title.slice(0,20) + "..." : ev.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="upcoming-events">
          <h3>Upcoming Events</h3>
          {filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className={`event-icon ${event.type?.toLowerCase()}`}></div>
              <div className="event-details">
                <h4>{event.title}</h4>
                <p>{event.org}</p>
                <p className="event-date">{new Date(event.date).toLocaleString()}</p>
                <span className="event-id">{event.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Add Event</h3>
            <input
              placeholder="Event Title"
              value={newEvent.title}
              onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <input
              placeholder="Organization"
              value={newEvent.org}
              onChange={e => setNewEvent({ ...newEvent, org: e.target.value })}
            />
            <input
              type="datetime-local"
              value={newEvent.date}
              onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
            />
            <select
              value={newEvent.type}
              onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
            >
              {eventTypes.filter(t => t !== "All").map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleAddEvent}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
