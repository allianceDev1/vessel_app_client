import React, { useState } from 'react'
import './report.scss'
import { Bar, ComposedChart, Line, PolarAngleAxis, PolarGrid, Radar, RadarChart, XAxis, YAxis } from 'recharts'
import ChartTooltip from '../primitives/ChartTooltip'
import ChartLegend from '../primitives/ChartLegend'
import { chartLabelColors } from '../../../assets/javascript/pre_data/chart'
import SkeletonGrid from '../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../UI_Primitives/ui-states/ErrorState'
import { TbPaperclip } from 'react-icons/tb'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../api'
import { normalizeRegistrationMiniReports } from '../../../utils/services/chart_service'


const RegisteredReport = () => {
    // eslint-disable-next-line
    const [limit, setLimit] = useState(5);


    const { isLoading: reportLoading, data: reportData, error: reportError, dataUpdatedAt: updatedAt } = useQuery({
        queryKey: ['reg_mini_report'],
        queryFn: async () => {
            let result = await api.vfCv2Axios.get('/service-registration/mini-report')

            result = normalizeRegistrationMiniReports(result)
            return result
        },
        refetchOnWindowFocus: false,
        staleTime: 30 * 60_000 // 30 minutes
    })


    if (reportLoading) {
        return (
            <SkeletonGrid style={{ marginTop: '20px', marginBottom: '40px' }} rows={2} columns={2} height={'250px'}
                responsive={{ md: { columns: 1, rows: 3, height: '250px' } }} />
        )
    }

    if (reportError) {
        return <ErrorState icon={<TbPaperclip />} title={'Report not available'}
            message={reportError?.message || "Can't find report data"} hight='400px' />
    }

    return (
        <div className="registered-service-report-container">
            <div className="reports">
                <div className="report-one report-box">
                    <div className="title-section">
                        <h4>Total Registration (6 Months)</h4>
                    </div>
                    <div className="content">
                        <ComposedChart
                            style={{ width: '100%', height: '230px' }}
                            data={reportData?.total?.map((month) => ({
                                name: month?.month,
                                "Total": month?.registration,
                                "Closed": month?.closed,
                                "Cancelled": month?.cancelled
                            }))}
                            responsive
                            margin={{ left: -30 }}
                        >
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <ChartTooltip />
                            <ChartLegend />
                            <Line type="monotone" dataKey="Total" strokeWidth={2} stroke={chartLabelColors[0]} />
                            <Line type="monotone" dataKey="Closed" stroke={chartLabelColors[5]} strokeWidth={2} />
                            <Line type="monotone" dataKey="Cancelled" stroke={'var(--color-danger)'} strokeWidth={2} />
                        </ComposedChart>
                    </div>
                </div>
                <div className="report-two report-box">
                    <div className="title-section">
                        <h4>Active Registrations</h4>
                    </div>
                    <div className="content">
                        <RadarChart
                            style={{ width: '100%', height: '230px' }}
                            data={reportData?.active_reg?.map((status) => ({
                                subject: status?.status_text,
                                count: status?.count,
                            }))}
                            responsive
                            margin={{ left: -30 }}
                        >
                            <PolarGrid />
                            <ChartTooltip nameColorVisibility={false} nameVisibility={false} />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13 }} />
                            <Radar name="Count" dataKey="count" stroke={chartLabelColors[5]} fill={chartLabelColors[2]} fillOpacity={0.6} />
                        </RadarChart>
                    </div>
                </div>
                <div className="report-three report-box">
                    <div className="title-section">
                        <h4>This month closed works (City base)</h4>
                    </div>
                    <div className="content">
                        <ComposedChart
                            style={{ width: '100%', height: '230px' }}
                            data={reportData?.city_list?.map((month) => ({
                                name: month?.city_name,
                                "Count": month?.count
                            }))}
                            responsive
                            margin={{ left: -30 }}
                        >
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="Count" tick={{ fontSize: 11 }} />
                            <ChartTooltip nameColorVisibility={false} nameVisibility={false} />
                            <Bar key={'Count'} dataKey={'Count'} barSize={20} fill={chartLabelColors[0]} radius={[10, 10, 0, 0]} />
                        </ComposedChart>
                    </div>
                </div>
                <div className="report-four report-box">
                    <div className="title-section">
                        <h4>Registration Modes (6 Months)</h4>
                    </div>
                    <div className="content">
                        <ComposedChart
                            style={{ width: '100%', height: '230px' }}
                            data={reportData?.reg_mode?.map((month) => ({
                                name: month?.month,
                                "Complaint": month?.complaint,
                                "Service": month?.service,
                                "Renewal": month?.renewal
                            }))}
                            responsive
                            margin={{ left: -30 }}
                        >
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <ChartTooltip />
                            <ChartLegend />
                            <Line type="monotone" dataKey="Complaint" strokeWidth={2} stroke={chartLabelColors[0]} />
                            <Line type="monotone" dataKey="Service" stroke={chartLabelColors[1]} strokeWidth={2} />
                            <Line type="monotone" dataKey="Renewal" stroke={chartLabelColors[2]} strokeWidth={2} />
                        </ComposedChart>
                    </div>
                </div>

            </div>
            <p className="last-update">Last update at {new Date(updatedAt).toLocaleString()}</p>
        </div>
    )
}

export default RegisteredReport