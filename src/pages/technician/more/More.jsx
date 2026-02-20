import React, { useEffect } from 'react'
import './more.scss'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'
import { TbArrowRight, TbBike, TbChartInfographic, TbCircleLetterT, TbHelpSquareRounded, TbMap } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'

const More = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(page.setTitle({ title: 'More Options', note: "" }))

        // eslint-disable-next-line
    }, [])

    return (
        <div className="tech-more-page-container">
            <div className="menu-list">
                {/* Service Area */}
                <div className="menu" onClick={() => navigate('/tech/service-area')}>
                    <div className="icon">
                        <TbMap />
                    </div>
                    <div className="label">
                        <p className="label-name">Service Area</p>
                    </div>
                    <div className="action">
                        <TbArrowRight />
                    </div>
                </div>

                {/* Daily Running */}
                <div className="menu" onClick={() => navigate('/tech/running-kms')}>
                    <div className="icon">
                        <TbBike />
                    </div>
                    <div className="label">
                        <p className="label-name">Running Kilometers</p>
                    </div>
                    <div className="action">
                        <TbArrowRight />
                    </div>
                </div>

                {/* DAR */}
                <div className="menu">
                    <div className="icon">
                        <TbChartInfographic />
                    </div>
                    <div className="label">
                        <p className="label-name">Daily Activity Report</p>
                    </div>
                    <div className="action">
                        <TbArrowRight />
                    </div>
                </div>

                {/* Token Top-ups */}
                <div className="menu">
                    <div className="icon">
                        <TbCircleLetterT />
                    </div>
                    <div className="label">
                        <p className="label-name">Token Top-up</p>
                    </div>
                    <div className="action">
                        <TbArrowRight />
                    </div>
                </div>

                {/* Help */}
                <div className="menu">
                    <div className="icon">
                        <TbHelpSquareRounded />
                    </div>
                    <div className="label">
                        <p className="label-name">Help Center</p>
                    </div>
                    <div className="action">
                        <TbArrowRight />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default More