import React from 'react'
import './eligibility.scss'
import { TbCheck, TbCircleCheck, TbX } from 'react-icons/tb'
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState';
import { api } from '../../../../api';
import { convertEligibilityToArray } from '../../../../utils/services/work_services';
import { toStandardText } from '../../../../utils/helpers/text-formatting';

const Eligibility = () => {

    const { customer_id, product_id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['controller_customer_pr_eligibility', customer_id, product_id],
        queryFn: async () => {
            const data = await api.vfCv2Axios(`/product/${product_id}/eligibility`)
            return convertEligibilityToArray(data || {});
        },
        staleTime: 60_000
    })

    if (isLoading) {
        return <div className='controller-eligibility-customer-container'>
            <div className="container">
                <SkeletonGrid rows={4} columns={1} height={'70px'} gap={'10px'} />
            </div>
        </div>
    }

    if (error) {
        return <div>
            <ErrorState
                icon={<TbCircleCheck />}
                title={'Data fetching Failed'}
                message={error?.message}
                hight='400px'
            />
        </div>
    }

    return (
        <div className="controller-eligibility-customer-container">
            <div className="container">
                {data?.map((e, index) => {
                    return <div className={`eli-item ${e?.[1] ? 'success' : 'danger'}`} key={index}>
                        <div className="icon">
                            {e?.[1] ? <TbCheck /> : <TbX />}
                        </div>
                        <div className="content">
                            <h4>{toStandardText(e?.[0] || '')}</h4>
                            <p>{e?.[2] ? e?.[2] : `Eligible for ${toStandardText(e?.[0] || '')}`}</p>
                        </div>
                    </div>
                })}
            </div>
        </div>
    )
}

export default Eligibility