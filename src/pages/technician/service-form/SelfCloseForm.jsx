import React, { useEffect, useState } from 'react'
import './service-form.scss'
import Review from '../../../components/modules/tech/self-close-form-pages/Review'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../api'
import Payment from '../../../components/modules/tech/self-close-form-pages/Payment'
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid'
import { TbMoodSadDizzy } from 'react-icons/tb'

const SelfCloseForm = () => {
    const [activePage, setActivePage] = useState(101)
    const location = useLocation()
    const registrationId = location?.state?.registration_id || null
    const customerId = location?.state?.customer_id || null
    const [review, setReview] = useState({})
    const [payment, setPayment] = useState({})


    const { data, isLoading, error } = useQuery({
        queryKey: ['self_close', 'review_report', registrationId],
        queryFn: async () => {
            const res = await api.vfTv2Axios.get(`/service/service-form/bill-reviews?registration_id=${registrationId}`)

            return res

        },
        staleTime: 30_000
    })

    useEffect(() => {
        setPayment({
            complement_amount: data?.wallet?.amount || 0
        })

        setReview({
            is_ready_to_pay: data?.is_ready_to_pay,
            is_editable: data?.is_editable,
            current_form_save_time: data?.current_form_save_time,
            registration_id: data?.registration_id,
            customer_id: customerId,
            bills: data?.bills
        })

        // eslint-disable-next-line
    }, [data])


    // loading
    if (isLoading) {
        return <div style={{ marginTop: '25px' }}>
            <SkeletonGrid rows={5} columns={1} height={105} />
        </div>
    }

    // Error
    if (error) {
        return <ErrorState
            hight='70vh'
            title={"Data can't Load!"}
            message={error?.message || 'Something went wrong!'}
            icon={<TbMoodSadDizzy />}
        />
    }

    return (
        <div className="tech-service-form-container">

            <div className="service-form-page-container">
                {activePage === 101 && <Review page={{ index: 101, type: 'page' }} review={review} payment={payment}
                    setReview={setReview} setActivePage={setActivePage} />}

                {activePage === 102 && <Payment page={{ index: 102, type: 'page' }} review={review} payment={payment}
                    setPayment={setPayment}
                />}

            </div>


        </div>
    )
}

export default SelfCloseForm