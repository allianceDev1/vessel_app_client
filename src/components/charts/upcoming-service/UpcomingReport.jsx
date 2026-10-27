import React, { useMemo } from 'react'
import './report.scss'
import { Area, Bar, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import ChartTooltip from '../primitives/ChartTooltip'
import ChartLegend from '../primitives/ChartLegend'
import { renderCustomChartLabel } from '../../../utils/helpers/chart_utils'
import { chartLabelColors } from '../../../assets/javascript/pre_data/chart'
import { upcomingServiceMiniReport } from '../../../utils/services/chart_service'
import SkeletonGrid from '../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../UI_Primitives/ui-states/ErrorState'
import { TbAlertCircle, TbFilter, TbDroplet, TbLayoutGrid } from 'react-icons/tb'
import { useSearchParams } from 'react-router-dom'

const UpcomingReport = ({ data, loading, error, updatedAt }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Generate chart data using standard chart_service function
  const { summeryData, countsData, chartData, monthChart, monthCharPackageColorCode } = useMemo(() => {
    if (!data?.summary) {
      return {
        summeryData: [],
        countsData: {},
        chartData: [],
        monthChart: [],
        monthCharPackageColorCode: {}
      }
    }
    return upcomingServiceMiniReport(data)

    // eslint-disable-next-line
  }, [data, searchParams.get("parent_type"), searchParams.get('view_type')])

  const firstItem = monthChart?.[0] || {}
  const { name, Works, Renewal, Service, Addon, ...packages } = firstItem

  const selectTab = (key) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('parent_type', key);
      return next;
    })
  }

  // Tab configurations
  const productTabs = [
    {
      key: 'ALL',
      label: 'All Products',
      icon: <TbLayoutGrid />,
      className: 'tab-all'
    },
    {
      key: 'VESSEL_FILTER',
      label: 'Vessel Filter',
      icon: <TbFilter />,
      className: 'tab-vessel'
    },
    {
      key: 'WATER_PURIFIER',
      label: 'Water Purifier',
      icon: <TbDroplet />,
      className: 'tab-purifier'
    }
  ]

  if (loading) {
    return (
      <SkeletonGrid
        style={{ marginTop: '20px', marginBottom: '40px' }}
        rows={2}
        columns={2}
        height={'250px'}
        responsive={{ md: { columns: 1, rows: 3, height: '250px' } }}
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        icon={<TbAlertCircle />}
        title={'Report not available'}
        message={error?.message || "Can't find report data"}
        hight='400px'
      />
    )
  }

  return (
    <div className="upcoming-service-report-container">
      {/* Product Type Tabs */}
      <div className="product-type-filter-bar">
        {productTabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`product-tab-btn ${tab.className} ${searchParams.get('parent_type') === tab.key ? 'active' : ''}`}
            onClick={() => selectTab(tab.key)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Reports Structure (Preserved exact design structure) */}
      <div className="reports">
        {/* 1. Monthly Report */}
        <div className="report-one report-box">
          <div className="title-section">
            <h4>Monthly Report</h4>
          </div>
          <div className="content">
            <ComposedChart
              style={{ width: '100%', height: '230px' }}
              data={monthChart}
              responsive
              margin={{ left: -30 }}
            >
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis niceTicks="snap125" tick={{ fontSize: 11 }} />
              <ChartTooltip />
              <ChartLegend />
              <Area type="monotone" dataKey="Works" fill={chartLabelColors[11]} stroke={chartLabelColors[5]} fillOpacity={.3} />
              <Line type="monotone" dataKey="Service" strokeWidth={2} stroke={chartLabelColors[10]} />
              <Line type="monotone" dataKey="Renewal" stroke={chartLabelColors[9]} strokeWidth={2} />
              {searchParams.get('parent_type') !== 'ALL' && Boolean(Object.keys(packages || {}).length) && (
                <Line type="monotone" dataKey="Addon" stroke={chartLabelColors[8]} strokeWidth={2} />
              )}
              {/* Packages only shown for specific product types (All products do not have package report) */}
              {searchParams.get('parent_type') !== 'ALL' && Object.keys(packages || {}).map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  barSize={20}
                  fill={monthCharPackageColorCode?.[key] || chartLabelColors[0]}
                  radius={[10, 10, 10, 10]}
                  stackId="Package"
                />
              ))}
            </ComposedChart>
          </div>
        </div>

        {/* 2. Summary */}
        <div className="report-two report-box">
          <div className="title-section">
            <h4>Summary</h4>
          </div>
          <div className="content">
            <ResponsiveContainer width={'100%'} height={150}>
              <PieChart>
                <Pie
                  accessibilityLayer
                  cornerRadius={10}
                  data={summeryData}
                  stroke='none'
                  cx="50%"
                  cy="87%"
                  startAngle={180}
                  endAngle={0}
                  labelLine={false}
                  label={renderCustomChartLabel}
                  outerRadius={100}
                  innerRadius={80}
                  fill={chartLabelColors[0]}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  paddingAngle={5}
                >
                  {summeryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartLabelColors[index % chartLabelColors.length]}
                      stroke='none'
                    />
                  ))}
                  <ChartTooltip />
                  <ChartLegend />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="count-report">
              <div className="item-div">
                <h2>{countsData?.total_pending ?? 0}</h2>
                <p>Total Pending</p>
              </div>
              <div className="item-div">
                <h2>{countsData?.month_pending ?? 0}</h2>
                <p>Month Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. City Report */}
        <div className="report-three report-box">
          <div className="title-section">
            <h4>City Report</h4>
          </div>
          <div className="content">
            <ComposedChart
              style={{ width: '100%', height: '230px' }}
              data={chartData}
              responsive
              margin={{ left: -30 }}
            >
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis niceTicks="snap125" tick={{ fontSize: 11 }} />
              <ChartTooltip />
              <ChartLegend />
              <Bar dataKey="Renewal" barSize={20} fill={chartLabelColors[1]} radius={[10, 10, 10, 10]} stackId="Count" />
              <Bar dataKey="Service" barSize={20} fill={chartLabelColors[0]} radius={[10, 10, 10, 10]} stackId="Count" />
            </ComposedChart>
          </div>
        </div>
      </div>

      <p className="last-update">Last update at {new Date(updatedAt || Date.now()).toLocaleString()}</p>
    </div>
  )
}

export default UpcomingReport
