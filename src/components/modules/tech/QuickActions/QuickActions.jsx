import React from 'react';
import './QuickActions.scss';
import { TbBike, TbCalendarWeek, TbMap, TbSettings, TbTicket } from 'react-icons/tb'
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers';
import { useNavigate } from 'react-router-dom';


const QuickActions = () => {

  const navigate = useNavigate()
  const thisMonth = isoToYYYYMMDD(new Date()).slice(0, 7);


  const DEFAULT_ACTIONS = [
    { key: 'schedules', label: 'Schedules', icon: <TbCalendarWeek />, action: () => navigate('/tech/schedules') },
    { key: 'service_area', label: 'Service Area', icon: <TbMap />, action: () => navigate('/tech/service-area') },
    { key: 'kilometer', label: 'Kilometer', icon: <TbBike />, action: () => navigate(`/tech/running-kms?month=${thisMonth}`) },
    { key: 'top_up', label: 'Top-up', icon: <TbTicket />, action: () => navigate('/tech/token-top-up') },
    { key: 'settings', label: 'Settings', icon: <TbSettings />, action: () => navigate('/tech/settings') }
  ];


  return (
    <section className="vms-quick-actions">
      <div className="vms-quick-actions__scroller">
        {DEFAULT_ACTIONS.map((action) => (
          <div
            key={action.key}
            type="button"
            className="vms-quick-actions__item"
            onClick={() => action?.action()}
          >
            <span className={`vms-quick-actions__icon-wrap ${action.primary ? 'vms-quick-actions__icon-wrap--primary' : ''}`}>
              {action.icon}
            </span>
            <span className="vms-quick-actions__label">{action.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
