import React, { useEffect } from 'react'
import './form-resources.scss'
import { useDispatch } from 'react-redux';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import { TbFolderFilled } from 'react-icons/tb';
import { useQuery } from '@tanstack/react-query';
import { toStandardText } from '../../../utils/helpers/text-formatting';

const FormResources = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { data, isLoading, error } = useQuery({
        queryKey: ['resources_titles'],
        queryFn: async () => {

            const data = await api.vfCv2Axios.get('/resources/form-resources/titles')
            return data;
        },
        staleTime: 60_000 * 30
    })

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Form Resources', note: "Form choice options list, create and update form resources." }))

        // eslint-disable-next-line
    }, [])


    // loading
    if (isLoading) {
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
            title={'Data fetching Failed!'}
            message={error?.message}
            icon={<TbFolderFilled />}
        />
    }


    return (
        <div className="form-resources-page">
            <div className="folder-section">
                {/* <h3>Controller App</h3> */}
                <div className="folders-border">
                    {Object.keys(data).map((key) => {
                        return <div className="folder" onClick={() => navigate(`${data?.[key]?.stretcher_model}/${key}`)} >
                            <TbFolderFilled />
                            <p>{toStandardText(key)}</p>
                        </div>
                    })}
                </div>
            </div>
        </div>
    )
}

export default FormResources