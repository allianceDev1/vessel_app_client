import React, { useEffect } from 'react'
import './app-config.scss'
import { useDispatch } from 'react-redux';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbArrowLeft } from 'react-icons/tb';
import { app_version } from '../../../config/app_config';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api';
import { useQuery } from '@tanstack/react-query';

const AppConfig = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();


    useEffect(() => {
        dispatch(page.setTitle({ title: 'App Configuration', note: "Manage and customize the vessel filter software settings." }))

        // eslint-disable-next-line
    }, [])


    const { data } = useQuery({
        queryKey: ['controller_access'],
        queryFn: async () => {
            return await api.ttPv2Axios.get('/worker/account/filter?origins=vessel_c_reader,vessel_c_writer,vessel_c_admin')
        },
        staleTime: 60_000
    })

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
                                <h4>Software Version</h4>
                            </div>
                            <div className="r">
                                <p>{app_version}</p>
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
                        <div className="list-item" onClick={() => navigate('/controller/app-config/service-categories')}>
                            <div className="l">
                                <h4>Service categories</h4>
                                <p className='description'>Categorize services workflows</p>
                            </div>
                            <div className="r">
                                <TbArrowLeft className='arrow' />
                            </div>
                        </div>
                        <div className="list-item" onClick={() => navigate('/controller/app-config/service-packages')}>
                            <div className="l">
                                <h4>Service packages</h4>
                                <p className='description'>Manage service packages, validity, pricing, and included benefits</p>
                            </div>
                            <div className="r">
                                <TbArrowLeft className='arrow' />
                            </div>
                        </div>
                        <div className="list-item" onClick={() => navigate('/controller/app-config/form-resources')}>
                            <div className="l">
                                <h4>Form Resources</h4>
                                <p className='description'>Maintain reusable form data and configurations used across the application</p>
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
                        {data?.map((worker) => {
                            return <div className="list-item" key={worker?.worker_uuid}>
                                <div className="l">
                                    <h4>{worker?.full_name}</h4>
                                </div>
                                <div className="r">
                                    <p>{worker?.origins?.includes('vessel_c_admin') ? 'Administrator' :
                                        worker?.origins?.includes('vessel_c_writer') ? 'Editor' :
                                            worker?.origins?.includes('vessel_c_reader') ? 'Viewer' : 'None'}</p>
                                </div>
                            </div>
                        })}
                    </div>
                </div>
            </div>
        </div >
    )
}

export default AppConfig