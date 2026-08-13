import React from 'react';
import './MonthlyReport.scss';
import Button from '../../../UI_Primitives/buttons/Button';
import { TbCashBanknote } from 'react-icons/tb';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';


const MonthlyReport = ({
  revenue,
  totalWork,
  totalWorkTime,
  workTimeAvg,
  travelTime,
  travelTimeAvg,
  cancelledVisits,
  onViewDetail,
}) => {

  const navigate = useNavigate();


  return (
    <section className="vms-monthly-report">
      <div className="vms-monthly-report__header">
        <h3 className="vms-monthly-report__title">This Month</h3>
        <Button label={'View Detail'} size='small' rounded text onClick={() => navigate(`/tech/completed?fl=Yes&from_date=${moment().format('YYYY-MM-DD')}&end_date=${moment().format('YYYY-MM-DD')}`)} />
      </div>

      <div className="vms-monthly-report__grid">
        <div className="vms-monthly-report__revenue-card">
          <div className="vms-monthly-report__revenue-text">
            <span className="vms-monthly-report__revenue-label">Total Revenue</span>
            <span className="vms-monthly-report__revenue-value">₹{revenue}</span>
          </div>
          <div className="vms-monthly-report__revenue-icon">
            <TbCashBanknote />
          </div>
        </div>

        <div className="vms-monthly-report__metric-card">
          <span className="vms-monthly-report__metric-label">Total Work</span>
          <span className="vms-monthly-report__metric-value">{totalWork}</span>
          <span className="vms-monthly-report__metric-sub">Visits</span>
        </div>

        <div className="vms-monthly-report__metric-card">
          <span className="vms-monthly-report__metric-label">Total Work Time</span>
          <span className="vms-monthly-report__metric-value">{totalWorkTime}</span>
          <span className="vms-monthly-report__metric-sub">Avg: {workTimeAvg}</span>
        </div>

        <div className="vms-monthly-report__metric-card">
          <span className="vms-monthly-report__metric-label">Travel Time</span>
          <span className="vms-monthly-report__metric-value">{travelTime}</span>
          <span className="vms-monthly-report__metric-sub">Avg: {travelTimeAvg}</span>
        </div>

        <div className="vms-monthly-report__metric-card">
          <span className="vms-monthly-report__metric-label">Cancelled Visits</span>
          <span className="vms-monthly-report__metric-value vms-monthly-report__metric-value--error">
            {cancelledVisits}
          </span>
          <span className="vms-monthly-report__metric-sub">This Month</span>
        </div>
      </div>
    </section>
  );
};

export default MonthlyReport;
