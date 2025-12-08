import {type FC, useState, useEffect} from 'react';
import type {ShutdownSchedule as ShutdownScheduleType} from '../electron';
import './ShutdownSchedule.css';

export const ShutdownSchedule: FC = () => {
  const [schedule, setSchedule] = useState<ShutdownScheduleType | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null);

  const days: (keyof ShutdownScheduleType)[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  const dayLabels: Record<keyof ShutdownScheduleType, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const settings = await window.adminGetSettings();
      if (settings?.shutdownSchedule) {
        setSchedule(settings.shutdownSchedule);
      }
    } catch (err) {
      console.error('Failed to load shutdown schedule:', err);
      showMessage('error', 'Failed to load shutdown schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day: keyof ShutdownScheduleType) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      [day]: {...schedule[day], enabled: !schedule[day].enabled},
    });
  };

  const handleTimeChange = (day: keyof ShutdownScheduleType, time: string) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      [day]: {...schedule[day], time},
    });
  };

  const handleSave = async () => {
    if (!schedule) return;

    setSaving(true);
    try {
      const success = await window.adminUpdateShutdownSchedule(schedule);
      if (success) {
        showMessage('success', 'Shutdown schedule updated successfully');
      } else {
        showMessage('error', 'Failed to update shutdown schedule');
      }
    } catch (err) {
      console.error('Failed to update shutdown schedule:', err);
      showMessage('error', 'Failed to update shutdown schedule');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({type, text});
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="shutdown-schedule">
        <h2>Scheduled Shutdown</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="shutdown-schedule">
        <h2>Scheduled Shutdown</h2>
        <p>Failed to load schedule</p>
      </div>
    );
  }

  return (
    <div className="shutdown-schedule">
      <h2>Scheduled Shutdown</h2>
      <p className="section-description">
        Configure automatic system shutdown times for each day of the week. A 10-minute warning will
        be shown before shutdown. The shutdown cannot be cancelled once the scheduled time arrives.
      </p>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="schedule-grid">
        {days.map(day => (
          <div key={day} className="schedule-day-row">
            <label className="day-checkbox">
              <input
                type="checkbox"
                checked={schedule[day].enabled}
                onChange={() => handleDayToggle(day)}
              />
              <span className="day-label">{dayLabels[day]}</span>
            </label>

            <input
              type="time"
              className="time-input"
              value={schedule[day].time}
              onChange={e => handleTimeChange(day, e.target.value)}
              disabled={!schedule[day].enabled}
            />
          </div>
        ))}
      </div>

      <button className="save-button" onClick={handleSave} disabled={saving || loading}>
        {saving ? 'Saving...' : 'Update Shutdown Schedule'}
      </button>
    </div>
  );
};
