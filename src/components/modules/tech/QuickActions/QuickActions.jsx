import React from 'react';
import './QuickActions.scss';
import { TbBike, TbBubbleText, TbCalendarWeek, TbMap, TbTicket } from 'react-icons/tb'
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';


const QuickActions = () => {

  const navigate = useNavigate()
  const { user } = useSelector((state) => state.user)
  const thisMonth = isoToYYYYMMDD(new Date()).slice(0, 7);


  const helpFormNavigate = () => {
    window.open(`https://docs.google.com/forms/d/e/1FAIpQLSfHzaBzc0SLS9BFJ_yGgtQsX290fiZrjymAK0tAIMDFmnSazw/viewform?usp=pp_url&entry.2086004218=${user?.dvc_id}&entry.1229166839=${user?.acc_id}&entry.319667061=${user?.first_name} ${user?.last_name}&entry.1265184055=Vessel+Filter+App`, '_blank')
  }

  const DEFAULT_ACTIONS = [
    { key: 'schedules', label: 'Schedules', icon: <TbCalendarWeek />, action: () => navigate('/tech/schedules') },
    { key: 'service_area', label: 'Service Area', icon: <TbMap />, action: () => navigate('/tech/service-area') },
    { key: 'kilometer', label: 'Kilometer', icon: <TbBike />, action: () => navigate(`/tech/running-kms?month=${thisMonth}`) },
    { key: 'top_up', label: 'Top-up', icon: <TbTicket />, action: () => navigate('/tech/token-top-up') },
    { key: 'help', label: 'Feedback', icon: <TbBubbleText />, action: helpFormNavigate },
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
