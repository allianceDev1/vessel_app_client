import React, { useEffect } from 'react'
import './service-packages.scss'
import { useDispatch } from 'react-redux';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbCarouselHorizontal, TbCheck, TbX } from "react-icons/tb";
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../components/UI_Primitives/ui-states/EmptyState';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import { api } from '../../../api';
import { hexToRgba } from '../../../utils/helpers/color-utils';
import { useQuery } from '@tanstack/react-query';


const ServicePackages = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

   
   

    const { data, isLoading, error } = useQuery({
        queryKey: ['service_package_list', 'controller'],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get('/config/service-package/list?product_type=VESSEL_FILTER&hidden=Yes')
            return res
        },
        staleTime: 10_000
    })

  

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Service Packages', note: "Manage the vessel system service packages & services." }))
       
        // eslint-disable-next-line
    }, [])

    // loading
    if (isLoading) {
        return <div className="service-packages-page-load">
            <SkeletonGrid
                rows={2}
                columns={3}
                height={180}
                responsive={{
                    sm: { columns: 1, rows: 4 },
                    md: { columns: 2, rows: 3 },
                    lg: { columns: 2, rows: 3 },
                    xl: { columns: 3 }
                }}
            />
        </div>
    }

    if (error) {
        return <ErrorState
            hight='80vh'
            title={'Data fetching failed!'}
            message={error?.message}
            icon={<TbCarouselHorizontal />}
        />
    }

    if (!data.length) {
        return <EmptyState
            hight='80vh'
            title={'No service packages found'}
            icon={<TbCarouselHorizontal />}
        />
    }

    // content
    return (
        <div className="service-packages-page">
            <div className="content">
                {data?.map((p, i) => (
                    <div className="pack-card" key={p.package_id}
                        onClick={() => navigate(`/controller/app-config/service-packages/${p.package_id}`)}
                        style={{
                            borderColor: p?.color_code,
                            background: `linear-gradient(50deg,
    ${hexToRgba(p?.color_code, 0.3)} 25%,
    ${hexToRgba(p?.color_code, 0.5)} 60%,
    ${hexToRgba(p?.color_code, 0.7)} 85%)`
                        }}
                    >
                        <h2 style={{ color: p.color_code }}>{p?.package_name}</h2>
                        <p>( {p?.full_form} )</p>
                        <div className="section">
                            <div className="box">
                                <h3>{p?.package_duration_months ? `${p?.package_duration_months} mo` : 'Nil'}</h3>
                                <p>Duration</p>
                            </div>
                            <div className="box">
                                <h3>{p?.tokens_count ? `${p?.tokens_count}` : 'Nil'}</h3>
                                <p>Tokens</p>
                            </div>
                        </div>
                        <div className={`status-fold ${p.is_active ? 'active' : 'inactive'}`}>
                            {p.is_active ? <TbCheck /> : <TbX />}
                            <p>{p.is_active ? 'Active' : 'Inactive'}</p>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    )
}

export default ServicePackages