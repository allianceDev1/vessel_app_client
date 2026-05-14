import React, { useEffect } from 'react'
import './more.scss'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch, useSelector } from 'react-redux'
import { TbArrowRight, TbBike, TbCircleLetterT, TbDropletCheck, TbHelpSquareRounded, TbMap } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { isoToYYYYMMDD } from '../../../utils/helpers/date-helpers'
import moment from 'moment'

const More = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const thisMonth = isoToYYYYMMDD(new Date()).slice(0, 7);
    const { user } = useSelector((state) => state.user)

    const helpFormNavigate = () => {
        window.open(`https://docs.google.com/forms/d/e/1FAIpQLSfHzaBzc0SLS9BFJ_yGgtQsX290fiZrjymAK0tAIMDFmnSazw/viewform?usp=pp_url&entry.2086004218=${user?.dvc_id}&entry.1229166839=${user?.acc_id}&entry.319667061=${user?.first_name} ${user?.last_name}&entry.1265184055=Vessel+Filter+App`, '_blank')
    }

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
                <div className="menu" onClick={() => navigate(`/tech/running-kms?month=${thisMonth}`)}>
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
                <div className="menu" onClick={() => navigate(`/tech/completed?fl=Yes&from_date=${moment().format('YYYY-MM-DD')}&end_date=${moment().format('YYYY-MM-DD')}`)}>
                    <div className="icon">
                        <TbDropletCheck />
                    </div>
                    <div className="label">
                        <p className="label-name">Completed Services</p>
                    </div>
                    <div className="action">
                        <TbArrowRight />
                    </div>
                </div>

                {/* Token Top-ups */}
                <div className="menu" onClick={() => navigate('/tech/token-top-up')}>
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
                <div className="menu" onClick={helpFormNavigate}>
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