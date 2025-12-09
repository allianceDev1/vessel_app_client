import React, { useEffect } from 'react'
import './app-config.scss'
import { useDispatch } from 'react-redux';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbArrowLeft } from 'react-icons/tb';
import { ui_version } from '../../../config/appConfig';
import { useNavigate } from 'react-router-dom';

const AppConfig = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();


    useEffect(() => {
        dispatch(page.setTitle({ title: 'App Configuration', note: "Manage and customize the vessel filter software settings." }))

        // eslint-disable-next-line
    }, [])

    return (
        <div className="app-config-page">
            <div className="border">
                {/* About Application */}
                <div className="section">
                    <div className="sub-title">
                        <h3>Application Info</h3>
                    </div>
                    <div className="content">
                        <div className="list-item">
                            <div className="l">
                                <p>Current Version</p>
                            </div>
                            <div className="r">
                                <p>{ui_version}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Essentials */}
                <div className="section">
                    <div className="sub-title">
                        <h3>System Essentials</h3>
                    </div>
                    <div className="content">
                        <div className="list-item" onClick={() => navigate('/controller/app-config/service-packages')}>
                            <div className="l">
                                <p>View Available Packages</p>
                            </div>
                            <div className="r">
                                <TbArrowLeft className='arrow' />
                            </div>
                        </div>
                        <div className="list-item">
                            <div className="l">
                                <p>Manage Service Solutions</p>
                            </div>
                            <div className="r">
                                <TbArrowLeft className='arrow' />
                            </div>
                        </div>
                        <div className="list-item">
                            <div className="l">
                                <p>Form Resources</p>
                            </div>
                            <div className="r">
                                <TbArrowLeft className='arrow' />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pro Accounts */}
                <div className="section">
                    <div className="sub-title">
                        <h3>User Access & Roles</h3>
                    </div>
                    <div className="content">
                        <div className="list-item">
                            <div className="l">
                                <p>Shibily Muhamemd</p>
                            </div>
                            <div className="r">
                                <p>Editor</p>
                            </div>
                        </div>
                        <div className="list-item">
                            <div className="l">
                                <p>Shibily Muhamemd</p>
                            </div>
                            <div className="r">
                                <p>Viewer</p>
                            </div>
                        </div>
                        <div className="list-item">
                            <div className="l">
                                <p>Shibily Muhamemd</p>
                            </div>
                            <div className="r">
                                <p>Administrator</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AppConfig