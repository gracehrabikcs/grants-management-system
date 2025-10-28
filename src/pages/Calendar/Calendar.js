import React, { useState } from "react";
import "../../styles/Calendar.css";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const upcomingEvents = [
    {
      id: "GR-001",
      title: "Education Innovation Fund - Application Deadline",
      org: "Future Learning Institute",
      date: "3/14/2024 at 11:59 PM",
      type: "Deadline",
    },
    {
      id: "GR-002",
      title: "Healthcare Research Grant - Review Meeting",
      org: "Medical Research Center",
      date: "3/17/2024 at 2:00 PM",
      type: "Review",
    },
    {
      id: "GR-003",
      title: "Environmental Conservation Project - Site Visit",
      org: "Green Earth Foundation",
      date: "3/19/2024 at 10:00 AM",
      type: "Visit",
    },
    {
      id: "GR-004",
      title: "Technology Development Initiative - Progress Report Due",
      org: "Tech Innovators LLC",
      date: "3/24/2024 at 5:00 PM",
      type: "Report",
    },
    {
      id: "GR-005",
      title: "Community Arts Program - Final Review",
      org: "Creative Community Hub",
      date: "3/27/2024 at 3:00 PM",
      type: "Review",
    },
  ];

  return (
    <div className="calendar-page">
      <h1>Calendar</h1>
      <p>Track important dates, deadlines, and milestones for your grants</p>

      <div className="calendar-container">
        <div className="calendar-card">
          <div className="calendar-header">
            <h3>Grant Calendar</h3>
            <div className="calendar-controls">
              <button className="filter-btn">Filter</button>
              <button className="add-event-btn">+ Add Event</button>
            </div>
          </div>

          {/* Simple monthly calendar placeholder */}
          <div className="calendar-grid">
            <table>
              <thead>
                <tr>
                  <th>Su</th>
                  <th>Mo</th>
                  <th>Tu</th>
                  <th>We</th>
                  <th>Th</th>
                  <th>Fr</th>
                  <th>Sa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td><td></td><td></td><td>1</td><td>2</td><td>3</td><td>4</td>
                </tr>
                <tr>
                  <td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td>
                </tr>
                <tr>
                  <td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td>
                </tr>
                <tr>
                  <td>19</td>
                  <td className="selected">20</td>
                  <td>21</td><td>22</td><td>23</td><td>24</td><td>25</td>
                </tr>
                <tr>
                  <td>26</td><td>27</td><td>28</td><td>29</td><td>30</td><td>31</td><td>1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming events sidebar */}
        <div className="upcoming-events">
          <h3>Upcoming Events</h3>
          {upcomingEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className={`event-icon ${event.type.toLowerCase()}`}></div>
              <div className="event-details">
                <h4>{event.title}</h4>
                <p>{event.org}</p>
                <p className="event-date">{event.date}</p>
                <span className="event-id">{event.id}</span>
              </div>
            </div>
          ))}

          <div className="event-types">
            <h4>Event Types</h4>
            <ul>
              <li><span className="dot deadline"></span> Deadlines</li>
              <li><span className="dot review"></span> Reviews</li>
              <li><span className="dot visit"></span> Visits</li>
              <li><span className="dot report"></span> Reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
