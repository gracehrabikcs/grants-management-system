import React, { useState } from "react";
import "../../styles/Calendar.css";


const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());


  const upcomingEvents = [
    { id: "GR-001", title: "Education Innovation Fund - Application Deadline", org: "Future Learning Institute", date: "3/14/2024 23:59", type: "Deadline" },
    { id: "GR-002", title: "Healthcare Research Grant - Review Meeting", org: "Medical Research Center", date: "3/17/2024 14:00", type: "Review" },
    { id: "GR-003", title: "Environmental Conservation Project - Site Visit", org: "Green Earth Foundation", date: "3/19/2024 10:00", type: "Visit" },
    { id: "GR-004", title: "Technology Development Initiative - Progress Report Due", org: "Tech Innovators LLC", date: "3/24/2024 17:00", type: "Report" },
    { id: "GR-005", title: "Community Arts Program - Final Review", org: "Creative Community Hub", date: "3/27/2024 15:00", type: "Review" },
  ];


  const [events, setEvents] = useState(upcomingEvents);
  const [filterType, setFilterType] = useState("All");
  const [showModal, setShowModal] = useState(false);


  // Form fields
  const [newEvent, setNewEvent] = useState({
    title: "",
    org: "",
    date: "",
    type: "Deadline",
  });


  const handleAddEvent = () => {
    const event = {
      ...newEvent,
      id: `GR-${String(events.length + 1).padStart(3, "0")}`,
    };
    setEvents([...events, event]);
    setShowModal(false);
    setNewEvent({ title: "", org: "", date: "", type: "Deadline" });
  };


  const filteredEvents =
    filterType === "All" ? events : events.filter((e) => e.type === filterType);


  // === Generate Calendar Dynamically ===
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth(); // 0-11
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDay = firstDayOfMonth.getDay(); // Sunday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();


  // Create array of day numbers with empty cells before the first day
  const days = [];
  for (let i = 0; i < startingDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);


  // === Parse event dates to match calendar days ===
 // === Parse event dates for all months ===
const getEventsForDay = (day, cellMonth, cellYear) => {
  return filteredEvents.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === day &&
      eventDate.getMonth() === cellMonth &&
      eventDate.getFullYear() === cellYear
    );
  });
};




  // === Navigation for months ===
  const prevMonth = () => setSelectedDate(new Date(year, month - 1, 1));
  const nextMonth = () => setSelectedDate(new Date(year, month + 1, 1));


  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];


  return (
    <div className="calendar-page">
      <h1>Calendar</h1>
      <p>Track important dates, deadlines, and milestones for your grants</p>


      <div className="calendar-container">
        <div className="calendar-card">
          <div className="calendar-header">
            <h3>
              {monthNames[month]} {year}
            </h3>
            <div className="calendar-controls">
              <button onClick={prevMonth}>←</button>
              <button onClick={nextMonth}>→</button>


              <select
                className="filter-dropdown"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">All Events</option>
                <option value="Deadline">Deadlines</option>
                <option value="Review">Reviews</option>
                <option value="Visit">Visits</option>
                <option value="Report">Reports</option>
              </select>


              <button className="add-event-btn" onClick={() => setShowModal(true)}>
                + Add Event
              </button>
            </div>
          </div>


          {/* Dynamic Calendar Grid */}
          <div className="calendar-grid">
            <table>
              <thead>
                <tr>
                  <th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th>
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
                              {getEventsForDay(day, month, year).map((ev) => (
                                <div
                                  key={ev.id}
                                  className={`event-entry ${ev.type.toLowerCase()}`}
                                  title={ev.title} // ✅ adds hover tooltip
                                >
                                  <span className={`event-dot ${ev.type.toLowerCase()}`}></span>
                                  <span className="event-title">
                                    {ev.title.length > 20 ? ev.title.slice(0, 20) + "..." : ev.title}
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


        {/* Events Sidebar */}
        <div className="upcoming-events">
          <h3>Upcoming Events</h3>
          {filteredEvents.map((event) => (
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


      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Add Event</h3>


            <input
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <input
              placeholder="Organization"
              value={newEvent.org}
              onChange={(e) => setNewEvent({ ...newEvent, org: e.target.value })}
            />
            <input
              type="datetime-local"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            />
            <select
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
            >
              <option value="Deadline">Deadline</option>
              <option value="Review">Review</option>
              <option value="Visit">Visit</option>
              <option value="Report">Report</option>
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


