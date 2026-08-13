import React from 'react';
import './TodaysWork.scss';

const TodaysWork = ({ data }) => {

  const percent = data?.assign_works > 0 ? (data?.completed_works / data?.assign_works) * 100 : 0;


  return (
    <section className="vms-todays-work">
      <div className="vms-todays-work__card">
        <div className="vms-todays-work__info">
          <h3 className="vms-todays-work__title">Today&apos;s Work</h3>
          <p className="vms-todays-work__summary">
            {data?.assign_works} Scheduled &middot; {data?.completed_works} Completed &middot; {data?.pending_works} Remaining
          </p>
        </div>

        <div className="vms-todays-work__ring">
          <svg viewBox="0 0 36 36" className="vms-todays-work__ring-svg">
            <path
              className="vms-todays-work__ring-track"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="100, 100"
            />
            <path
              className="vms-todays-work__ring-progress"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${percent}, 100`}
            />
          </svg>
          <span className="vms-todays-work__ring-label">
            {data?.completed_works}/{data?.assign_works}
          </span>
        </div>
      </div>
    </section>
  );
};

export default TodaysWork;
