import React, { useEffect } from 'react'
import './dashboard.scss'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'
import TodayWorkFlow from '../../../components/charts/dashboard/TodayWorkFlow'

const Dashboard = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(page.setTitle({}))
        // eslint-disable-next-line
    }, [])


    return (
        <div className='controller-dashboard-page-container'>
            <div className="reports">
                <div className="report-box work-flow-report">
                    <div className="title-section">
                        <h4>Today work flow</h4>
                    </div>
                    <div className="content">
                        <TodayWorkFlow />
                    </div>
                </div>
            </div>
            <div className="text-mark">
                <h1>Track, monitor, decide —</h1>
                <h2>Purity is our flag.</h2>
            </div>
        </div>
    )
}

export default Dashboard