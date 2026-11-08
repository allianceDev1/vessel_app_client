import React, { useState } from 'react';
import './PerformanceReport.scss';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import {
  TbCashBanknote,
  TbBriefcase,
  TbClockHour4,
  TbRoute,
  TbMapPin,
  TbChevronRight,
} from 'react-icons/tb';
import AnimatedCounter from '../../../UI_Primitives/counter/AnimatedCounter';

/**
 * Mobile performance report with two tabs: Today (default) and current Month.
 * `today` / `month` are expected to be pre-formatted display values.
 */
const PerformanceReport = ({ today, month }) => {

  const navigate = useNavigate();
  const [tab, setTab] = useState('today');

  const monthName = moment().format('MMMM');

  const tabs = [
    { key: 'today', label: 'Today' },
    { key: 'month', label: monthName },
  ];

  const metrics = tab === 'today'
    ? [
      { key: 'works', label: 'Works', value: today?.works, sub: 'Completed', icon: <TbBriefcase />, tone: 'primary' },
      { key: 'work_time', label: 'Working Time', value: today?.workTime, sub: 'Hours : Minutes', icon: <TbClockHour4 />, tone: 'success' },
      { key: 'travel_time', label: 'Travel Time', value: today?.travelTime, sub: 'Hours : Minutes', icon: <TbRoute />, tone: 'warning' },
      { key: 'distance', label: 'Distance', value: today?.distance, sub: 'Kilometers', icon: <TbMapPin />, tone: 'info' },
    ]
    : [
      { key: 'works', label: 'Works', value: month?.works, sub: 'Completed visits', icon: <TbBriefcase />, tone: 'primary' },
      { key: 'work_time', label: 'Working Time', value: month?.workTime, sub: `Avg: ${month?.workTimeAvg}`, icon: <TbClockHour4 />, tone: 'success' },
      { key: 'travel_time', label: 'Travel Time', value: month?.travelTime, sub: `Avg: ${month?.travelTimeAvg}`, icon: <TbRoute />, tone: 'warning' },
      { key: 'distance', label: 'Distance', value: month?.distance, sub: 'Kilometers', icon: <TbMapPin />, tone: 'info' },
    ];

  const revenue = tab === 'today' ? today?.revenue : month?.revenue;

  const goDetail = () => navigate(
    `/tech/completed?fl=Yes&from_date=${moment().startOf('month').format('YYYY-MM-DD')}&end_date=${moment().endOf('month').format('YYYY-MM-DD')}`
  );

  return (
    <section className="vms-perf-report">

      <div className="vms-perf-report__tabs" role="tablist">
        {tabs.map(t => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={`vms-perf-report__tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="vms-perf-report__body" key={tab}>

        <div className="vms-perf-report__revenue">
          <div className="vms-perf-report__revenue-text">
            <span className="vms-perf-report__revenue-label">
              {tab === 'today' ? "Today's Revenue" : `${monthName} Revenue`}
            </span>
            <span className="vms-perf-report__revenue-value">₹<AnimatedCounter key={`${tab}-${revenue}`} value={revenue} /></span>
          </div>
          <div className="vms-perf-report__revenue-icon"><TbCashBanknote /></div>
        </div>

        <div className="vms-perf-report__grid">
          {metrics.map(m => (
            <div key={m.key} className={`vms-perf-report__metric tone-${m.tone}`}>
              <div className="vms-perf-report__metric-head">
                <span className="vms-perf-report__metric-icon">{m.icon}</span>
                <span className="vms-perf-report__metric-label">{m.label}</span>
              </div>
              <span className="vms-perf-report__metric-value">{m.value}</span>
              <span className="vms-perf-report__metric-sub">{m.sub}</span>
            </div>
          ))}
        </div>

        {tab === 'month' && (
          <button className="vms-perf-report__detail" onClick={goDetail}>
            View Detail <TbChevronRight />
          </button>
        )}
      </div>
    </section>
  );
};

export default PerformanceReport;

