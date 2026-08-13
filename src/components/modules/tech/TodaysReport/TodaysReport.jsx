import React from 'react';
import './TodaysReport.scss';

const TodaysReport = ({
  scheduled,
  completed,
  revenueToday,
  travelTimeToday,
  workDuration,
  workPercent,
  travelDuration,
  travelPercent,
}) => {
  return (
    <section className="vms-todays-report">
      <h3 className="vms-todays-report__title">Today&apos;s Report</h3>

      <div className="vms-todays-report__grid">
        <div className="vms-todays-report__tile">
          <span className="vms-todays-report__tile-value">{scheduled}</span>
          <span className="vms-todays-report__tile-label">Scheduled</span>
        </div>
        <div className="vms-todays-report__tile">
          <span className="vms-todays-report__tile-value">{completed}</span>
          <span className="vms-todays-report__tile-label">Completed</span>
        </div>

        <div className="vms-todays-report__summary">
          <div className="vms-todays-report__summary-row">
            <div className="vms-todays-report__summary-col">
              <span className="vms-todays-report__summary-value vms-todays-report__summary-value--success">
                ₹{revenueToday}
              </span>
              <span className="vms-todays-report__summary-label">Revenue Today</span>
            </div>
            <div className="vms-todays-report__summary-col vms-todays-report__summary-col--right">
              <span className="vms-todays-report__summary-value">{travelTimeToday}</span>
              <span className="vms-todays-report__summary-label">Travel Time</span>
            </div>
          </div>

          <div className="vms-todays-report__distribution">
            <span className="vms-todays-report__distribution-title">Time Distribution</span>

            <div className="vms-todays-report__bar-row">
              <span className="vms-todays-report__bar-label">Work</span>
              <div className="vms-todays-report__bar-track">
                <div
                  className="vms-todays-report__bar-fill vms-todays-report__bar-fill--work"
                  style={{ width: `${workPercent}%` }}
                />
              </div>
              <span className="vms-todays-report__bar-value">{workDuration}</span>
            </div>

            <div className="vms-todays-report__bar-row">
              <span className="vms-todays-report__bar-label">Travel</span>
              <div className="vms-todays-report__bar-track">
                <div
                  className="vms-todays-report__bar-fill vms-todays-report__bar-fill--travel"
                  style={{ width: `${travelPercent}%` }}
                />
              </div>
              <span className="vms-todays-report__bar-value">{travelDuration}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TodaysReport;
