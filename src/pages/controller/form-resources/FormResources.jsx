import React, { useEffect, useState } from 'react'
import './form-resources.scss'
import { useDispatch } from 'react-redux';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import { TbFolderFilled } from 'react-icons/tb';

const FormResources = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState('fetch')
    const [data, setData] = useState({})
    const [error, setError] = useState({ error: false, title: null, message: null })

    const fetchApi = async () => {
        try {
            setLoading('fetch')
            setError({ error: false, title: null, message: null })
            const res = await api.vfCv2Axios.get('/resources/form-resources/titles')
            setData(res)
        } catch (error) {
            setError({ error: true, title: 'Data fetching failed', message: error.message })
        } finally {
            setLoading('')
        }
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Form Resources', note: "Form choice options list, create and update form resources." }))

        // Initial fetch
        fetchApi();
        // eslint-disable-next-line
    }, [])


    // loading
    if (loading === 'fetch') {
        return <div className="form-resources-page-load">
            <SkeletonGrid
                height={130}
                responsive={{
                    sm: { columns: 3, rows: 4 },
                    md: { columns: 4, rows: 3 },
                    lg: { columns: 4, rows: 3 },
                    xl: { columns: 6, rows: 3 }
                }}
            />
        </div>
    }

    if (error?.error) {
        return <ErrorState
            hight='80vh'
            title={error?.title}
            message={error?.message}
            icon={<TbFolderFilled />}
        />
    }


    return (
        <div className="form-resources-page">
            <div className="folder-section">
                <h3>Controller App</h3>
                <div className="folders-border">
                    {data?.vf_complaint_reasons && <div className="folder" onClick={() => navigate(`${data?.vf_complaint_reasons?.stretcher_model}/vf_complaint_reasons`)} >
                        <TbFolderFilled />
                        <p>Customer Complaints</p>
                    </div>}
                    {data?.service_cancellation_reasons && <div className="folder" onClick={() => navigate(`${data?.service_cancellation_reasons?.stretcher_model}/service_cancellation_reasons`)}>
                        <TbFolderFilled />
                        <p>Service Cancellation Reasons</p>
                    </div>}
                    {data?.service_postpone_reasons && <div className="folder" onClick={() => navigate(`${data?.service_postpone_reasons?.stretcher_model}/service_postpone_reasons`)} >
                        <TbFolderFilled />
                        <p>Service Postpone Reasons</p>
                    </div>}
                </div>
            </div>
        </div>
    )
}

export default FormResources