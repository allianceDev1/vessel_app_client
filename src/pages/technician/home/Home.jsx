import React, { useEffect } from 'react'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux';
import './home.scss'
import { TbChevronsUp, TbTagFilled, TbTarget } from 'react-icons/tb';

const Home = () => {
    const dispatch = useDispatch();


    useEffect(() => {
        dispatch(page.setTitle({ title: '', note: "" }))

        // eslint-disable-next-line
    }, [])

    return (
        <div className="tech-home-page-container">
            {/* My Works */}
            <div className="sub-title">
                <h3>My Works</h3>
            </div>
            <div className="my-works-report">
                <div className="report-work-item">
                    <p>Today <br></br> Schedules</p>
                    <h2>5000</h2>
                    <TbTagFilled />
                </div>
                <div className="report-work-item">
                    <p>My <br></br> Schedules</p>
                    <h2>500</h2>
                    <TbTagFilled />
                </div>
                <div className="report-work-item">
                    <p>Registered <br></br> to me</p>
                    <h2>500</h2>
                    <TbTagFilled />
                </div>
                <div className="report-work-item">
                    <p>My work <br></br> credits</p>
                    <h2>0500</h2>
                    <TbTagFilled />
                </div>
            </div>

            {/* My service status */}
            <div className="sub-title" style={{ marginTop: '30px' }}>
                <h3>My Service Status</h3>
            </div>
            <div className="my-service-report">
                <div className="report-status-item">
                    <h2>5000</h2>
                    <div className='title'>
                        <p>Works</p>
                        <div>
                            <TbChevronsUp />
                            <p>50</p>
                        </div>
                    </div>
                    <TbTarget />
                </div>
                <div className="report-status-item">
                    <h2>5000</h2>
                    <div className='title'>
                        <p>Calls</p>
                        <div>
                            <TbChevronsUp />
                            <p>50</p>
                        </div>
                    </div>
                    <TbTarget />
                </div>
                <div className="report-status-item">
                    <h2>5000</h2>
                    <div className='title'>
                        <p>Revenue</p>
                        <div>
                            <TbChevronsUp />
                            <p>50</p>
                        </div>
                    </div>
                    <TbTarget />
                </div>
            </div>

            {/* Chart */}
            <div className="sub-title" style={{ marginTop: '30px' }}>
                <h3>Service Report (6 Months)</h3>
            </div>
        </div>
    )
}

export default Home