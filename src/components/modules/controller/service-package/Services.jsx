import React from 'react'
import ServiceCard from '../../common/cards/ServiceCard'
import { TbPlayCard4 } from 'react-icons/tb'
import { useNavigate, useParams } from 'react-router-dom'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../api'
import CancellationCard from '../../common/cards/CancellationCard'
import Button from '../../../UI_Primitives/buttons/Button'
import { useDispatch, useSelector } from 'react-redux'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import ServiceCancellation from '../../../forms/controller/service-package/ServiceCancellation'

const Services = () => {
    const { serial_number } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user)

    const fetchServiceCards = async ({ pageParam = 0 }) => {
        const res = await api.vfCv2Axios(`/package/${serial_number}/services`)
        return res
    };

    const openCancellationModal = () => {
        dispatch(modal.push({
            title: "Service Index Cancellation",
            body: <ServiceCancellation packageSrlNo={serial_number} />
        }))
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ["package_service_cards", serial_number],
        queryFn: fetchServiceCards,
        enabled: !!serial_number,
        staleTime: 60_000
    })

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '400px' }}>
                <SkeletonGrid rows={7} columns={1} height={'130px'} gap={'10px'} />
            </div>
        </div>
    }

    if (error) {
        return <div>
            <ErrorState
                icon={<TbPlayCard4 />}
                title={'Data fetching Failed'}
                message={error?.message}
                hight='400px'
            />
        </div>
    }

    return (
        <div className="controller-customer-service-cards-container" >

            {user?.allowed_origins?.some(a => ['vessel_c_writer', 'vessel_c_admin'].includes(a)) &&
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <Button icon={<TbPlayCard4 />} label={'Cancel Service'} size='small' severity={'danger'} rounded style={{ width: '150px' }}
                        onClick={openCancellationModal} />
                </div>}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <div className="content" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '400px' }}>
                    {!data.length && <ErrorState
                        icon={<TbPlayCard4 />}
                        title={'No service history yet.'}
                        message={error?.message}
                        hight='400px'
                    />}

                    {data.map((card) => (
                        card?.type === 'SERVICE' ? <ServiceCard key={card.uuid} data={card} pointer
                            onClick={() => navigate(`/controller/completed/service-job/${card?.service_srl_no}`)} /> :
                            card?.type === 'CANCELLATION' ? <CancellationCard key={card.uuid} data={card} /> : ""
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Services