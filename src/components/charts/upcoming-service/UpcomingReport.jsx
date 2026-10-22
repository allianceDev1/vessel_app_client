import React, { useMemo, useState } from 'react'
import './report.scss'
import { Area, Bar, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import ChartTooltip from '../primitives/ChartTooltip'
import ChartLegend from '../primitives/ChartLegend'
import { renderCustomChartLabel } from '../../../utils/helpers/chart_utils'
import { chartLabelColors } from '../../../assets/javascript/pre_data/chart'
import { upcomingServiceMiniReport } from '../../../utils/services/chart_service'
import SkeletonGrid from '../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../UI_Primitives/ui-states/ErrorState'
import { TbAlertCircle, TbFilter, TbDroplet, TbPuzzle, TbLayoutGrid } from 'react-icons/tb'
import { mockUpcomingReportData } from './mockUpcomingData'

const UpcomingReport = ({ data, loading, error, updatedAt }) => {
  // Selected Product Type tab: 'VESSEL_FILTER' | 'WATER_PURIFIER' | 'ADD_ON' | 'ALL'
  const [activeProductType, setActiveProductType] = useState('VESSEL_FILTER')

  // Resolve data source: supports updated multi-product API or legacy single report + dummy fallback
  const resolvedDatasets = useMemo(() => {
    // 1. Vessel Filter data: use real API data if available, fallback to mock
    const vfData = data?.vessel_filter || (data?.summary ? data : mockUpcomingReportData.vessel_filter)

    // 2. Water Purifier data: use API data if available, fallback to mock
    const wpData = data?.water_purifier || mockUpcomingReportData.water_purifier

    // 3. Add-on data: use API data if available, fallback to mock
    const aoData = data?.add_on || mockUpcomingReportData.add_on

    // 4. Combined ALL dataset (All products don't have package report)
    const aggregateAll = () => {
      const sources = [vfData, wpData, aoData]

      const summary = {
        total_work: sources.reduce((acc, s) => acc + (s?.summary?.total_work || 0), 0),
        total_service: sources.reduce((acc, s) => acc + (s?.summary?.total_service || 0), 0),
        total_renewal: sources.reduce((acc, s) => acc + (s?.summary?.total_renewal || 0), 0),
        this_month_total_work: sources.reduce((acc, s) => acc + (s?.summary?.this_month_total_work || 0), 0)
      }

      const cityMap = new Map()
      sources.forEach(s => {
        (s?.city_chart || []).forEach(c => {
          const existing = cityMap.get(c.city_name) || { city_name: c.city_name, total_service: 0, total_renewal: 0 }
          existing.total_service += (c.total_service || 0)
          existing.total_renewal += (c.total_renewal || 0)
          cityMap.set(c.city_name, existing)
        })
      })
      const city_chart = Array.from(cityMap.values())

      const monthMap = new Map()
      sources.forEach(s => {
        (s?.month_chart || []).forEach(m => {
          const existing = monthMap.get(m.month) || {
            month: m.month,
            total_work: 0,
            total_service: 0,
            total_renewal: 0,
            add_on_works: 0,
            package_counts: []
          }
          existing.total_work += (m.total_work || 0)
          existing.total_service += (m.total_service || 0)
          existing.total_renewal += (m.total_renewal || 0)
          existing.add_on_works += (m.add_on_works || 0)
          monthMap.set(m.month, existing)
        })
      })

      // All products do not include package report
      const month_chart = Array.from(monthMap.values()).map(m => ({
        ...m,
        package_counts: []
      })).sort((a, b) => a.month.localeCompare(b.month))

      return { summary, city_chart, month_chart }
    }

    return {
      VESSEL_FILTER: vfData,
      WATER_PURIFIER: wpData,
      ADD_ON: aoData,
      ALL: aggregateAll()
    }
  }, [data])

  // Current active dataset
  const currentDataset = resolvedDatasets[activeProductType] || resolvedDatasets.VESSEL_FILTER

  // Generate chart data using standard chart_service function
  const { summeryData, countsData, chartData, monthChart, monthCharPackageColorCode } = useMemo(() => {
    if (!currentDataset?.summary) {
      return {
        summeryData: [],
        countsData: {},
        chartData: [],
        monthChart: [],
        monthCharPackageColorCode: {}
      }
    }
    return upcomingServiceMiniReport(currentDataset)
  }, [currentDataset])

  const firstItem = monthChart?.[0] || {}
  const { name, Works, Renewal, Service, Addon, ...packages } = firstItem

  // Tab configurations
  const productTabs = [
    {
      key: 'ALL',
      label: 'All Products',
      icon: <TbLayoutGrid />,
      count: resolvedDatasets.ALL?.summary?.total_work || 0,
      className: 'tab-all'
    },
    {
      key: 'VESSEL_FILTER',
      label: 'Vessel Filter',
      icon: <TbFilter />,
      count: resolvedDatasets.VESSEL_FILTER?.summary?.total_work || 0,
      className: 'tab-vessel'
    },
    {
      key: 'WATER_PURIFIER',
      label: 'Water Purifier',
      icon: <TbDroplet />,
      count: resolvedDatasets.WATER_PURIFIER?.summary?.total_work || 0,
      className: 'tab-purifier'
    },
    {
      key: 'ADD_ON',
      label: 'Add-on',
      icon: <TbPuzzle />,
      count: resolvedDatasets.ADD_ON?.summary?.total_work || 0,
      className: 'tab-addon'
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
            className={`product-tab-btn ${tab.className} ${activeProductType === tab.key ? 'active' : ''}`}
            onClick={() => setActiveProductType(tab.key)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            <span className="tab-badge">{tab.count}</span>
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
              {activeProductType !== 'ALL' && Boolean(Object.keys(packages || {}).length) && (
                <Line type="monotone" dataKey="Addon" stroke={chartLabelColors[8]} strokeWidth={2} />
              )}
              {/* Packages only shown for specific product types (All products do not have package report) */}
              {activeProductType !== 'ALL' && Object.keys(packages || {}).map((key) => (
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
