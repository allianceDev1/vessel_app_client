import React, { useState } from 'react';
import './PerformanceChart.scss';
import Button from '../../../UI_Primitives/buttons/Button';
import { Area, CartesianGrid, ComposedChart, XAxis } from 'recharts';
import ChartTooltip from '../../../charts/primitives/ChartTooltip';
import { chartLabelColors } from '../../../../assets/javascript/pre_data/chart';
import { formatSecondsToHHMM } from '../../../../utils/helpers/date-helpers';


const TABS = [
  { key: 'revenue', label: 'Revenue', formate: (v) => '₹' + v.toLocaleString('en-IN') },
  { key: 'works', label: 'Works', formate: (v) => v.toLocaleString('en-IN') },
  { key: 'work_time', label: 'Work Time', formate: (v) => formatSecondsToHHMM(v) },
]


const PerformanceChart = ({ data }) => {
  const [activeTab, setActiveTab] = useState('revenue');
  const chartData = data[activeTab];
  const valueFormate = TABS?.find(t => t?.key === activeTab)?.formate


  return (
    <section className="vms-performance">
      <h3 className="vms-performance__title">Performance</h3>

      <div className="vms-performance__card">
        <div className="vms-performance__tabs">
          {TABS.map((tab) => (
            <Button label={tab?.label} key={tab?.key} onClick={() => setActiveTab(tab?.key)} size='small' rounded outlined={activeTab !== tab?.key}
              style={{ fontSize: '12px', padding: '3px 10px' }} />
          ))}
        </div>

        <div className="vms-performance__chart">
          <ComposedChart
            style={{ width: '100%', height: '180px' }}
            data={chartData}
            responsive
            margin={{ left: -10 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              strokeOpacity={0.35}
            />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />

            <ChartTooltip valueFormatter={(value) => [valueFormate(value)]} nameVisibility={false}
              nameColorVisibility={false} />

            <Area key={'value'} type="monotone" dataKey={'value'} strokeWidth={1} stroke={chartLabelColors[0]}
              fill={chartLabelColors[0]} />
          </ComposedChart>
        </div>
      </div>
    </section>
  );
};

export default PerformanceChart;
