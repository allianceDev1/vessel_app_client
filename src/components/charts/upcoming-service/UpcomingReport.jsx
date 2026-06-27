import React, { useEffect, useState } from 'react'
import './report.scss'
import { Area, Bar, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import ChartTooltip from '../primitives/ChartTooltip'
import ChartLegend from '../primitives/ChartLegend'
import { renderCustomChartLabel } from '../../../utils/helpers/chart_utils'
import { chartLabelColors } from '../../../assets/javascript/pre_data/chart'
import { upcomingServiceMiniReport } from '../../../utils/services/chart_service'
import SkeletonGrid from '../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../UI_Primitives/ui-states/ErrorState'
import { TbAlertCircle, TbAlertCircleOff, TbPaperclip } from 'react-icons/tb'

const UpcomingReport = ({ data, loading, error, updatedAt }) => {
  const [monthChart, setMonthChart] = useState()
  const firstItem = monthChart?.[0] || {}
  const { name, Works, Renewal, Service, Addon, ...packages } = firstItem
  const [summery, setSummery] = useState([])
  const [counts, setCounts] = useState([])
  const [cityChart, setCityChart] = useState([])
  const [MCPC, setMCPC] = useState({})

  useEffect(() => {
    // generate report
    if (loading || error) {
      return;
    }

    const { summeryData, countsData, chartData, monthChart, monthCharPackageColorCode } = upcomingServiceMiniReport(data)

    setSummery(summeryData)
    setCounts(countsData)
    setCityChart(chartData)
    setMonthChart(monthChart)
    setMCPC(monthCharPackageColorCode)

    // eslint-disable-next-line
  }, [data, loading, error])



  if (loading) {
    return (
      <SkeletonGrid style={{ marginTop: '20px', marginBottom: '40px' }} rows={2} columns={2} height={'250px'}
        responsive={{ md: { columns: 1, rows: 3, height: '250px' } }} />
    )
  }

  if (error) {
    return <ErrorState icon={<TbAlertCircle />} title={'Report not available'}
      message={error?.message || "Can't find report data"} hight='400px' />
  }

  return (
    <div className="upcoming-service-report-container">
      <div className="reports">
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
              {Object.keys(packages || {})?.length && <Line type="monotone" dataKey="Addon" stroke={chartLabelColors[8]} strokeWidth={2} />}
              {
                Object.keys(packages || {}).map((key, index) => {
                  return <Bar key={key} dataKey={key} barSize={20} fill={MCPC?.[key]} radius={[10, 10, 0, 0]} />
                })
              }
            </ComposedChart>
          </div>
        </div>
        <div className="report-two report-box">
          <div className="title-section">
            <h4>Summery</h4>
          </div>
          <div className="content">
            <ResponsiveContainer width={'100%'} height={150}>
              <PieChart>
                <Pie
                  accessibilityLayer
                  cornerRadius={10}
                  data={summery}
                  stroke='none'
                  cx="50%"
                  cy="87%"
                  startAngle={180}
                  endAngle={0}
                  labelLine={false}
                  label={renderCustomChartLabel}
                  outerRadius={100}
                  innerRadius={80}
                  fill="#0077B6"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  paddingAngle={5}
                >
                  {summery.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartLabelColors[(index) % chartLabelColors.length]} stroke='none' />
                  ))}
                  <ChartTooltip />
                  <ChartLegend />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="count-report">
              <div className="item-div">
                <h2>{counts?.total_pending}</h2>
                <p>Total Pending</p>
              </div>
              <div className="item-div">
                <h2>{counts?.month_pending}</h2>
                <p>Month Pending</p>
              </div>
            </div>
          </div>
        </div>
        <div className="report-three report-box">
          <div className="title-section">
            <h4>City Report</h4>
          </div>
          <div className="content">
            <ComposedChart
              style={{ width: '100%', height: '230px' }}
              data={cityChart}
              responsive
              margin={{ left: -30 }}
            >
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis niceTicks="snap125" tick={{ fontSize: 11 }} />
              <ChartTooltip />
              <ChartLegend />
              <Bar dataKey="Service" barSize={20} fill={chartLabelColors[0]} radius={[10, 10, 0, 0]} />
              <Bar dataKey="Renewal" barSize={20} fill={chartLabelColors[1]} radius={[10, 10, 0, 0]} />
            </ComposedChart>
          </div>
        </div>
      </div>
      <p className="last-update">Last update at {new Date(updatedAt).toLocaleString()}</p>
    </div>
  )
}

export default UpcomingReport