import React, { useEffect, useState } from 'react'
import './service-form.scss'
import { TbFileText } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { sfActions, sfSetting } from '../../../redux/features/persisted/applicationSlice'
import { api } from '../../../api'
import { buildCustomerPGStretcher } from '../../../utils/services/product_service'

import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState'
import FormTopBar from '../../../components/modules/tech/service-form-components/FormTopBar'
import Home from '../../../components/modules/tech/service-form-pages/Home'
import SfSubPageOne from '../../../components/modules/tech/service-form-pages/SfSubPageOne'
import SfSubPageTwo from '../../../components/modules/tech/service-form-pages/SfSubPageTwo'
import SfSubPageThree from '../../../components/modules/tech/service-form-pages/SfSubPageThree'
import SfSubPageFour from '../../../components/modules/tech/service-form-pages/SfSubPageFour'
import SfAdSubPageOne from '../../../components/modules/tech/service-form-pages/SfAdSubPageOne'
import SfAdSubPageTwo from '../../../components/modules/tech/service-form-pages/SfAdSubPageTwo'
import SfAdSubPageThree from '../../../components/modules/tech/service-form-pages/SfAdSubPageThree'
import Review from '../../../components/modules/tech/service-form-pages/Review'
import Payment from '../../../components/modules/tech/service-form-pages/Payment'
import { useQuery } from '@tanstack/react-query'
import { serviceFormResourcesVerification } from '../../../utils/services/service-form-services'

const ServiceForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { formResources, serviceForm, serviceFormSettings } = useSelector((state) => state.application)
    const [isVerifying, setIsVerifying] = useState(false)
    const [verification, setVerification] = useState({ success: true, message: null })


    const {
        isLoading,
        isFetching,
        data,
        error
    } = useQuery({
        queryKey: ['service_form_resources', serviceForm?.work_key],
        queryFn: async () => {

            const { otp_logs, ...res } = await api.vfTv2Axios.get(`/service/service-job/form-resources?work_key=${serviceForm?.work_key}`)

            const pgStretcher = buildCustomerPGStretcher(res?.products)

            // add to redux
            dispatch(sfActions.updateVerification({
                otpLogs: otp_logs || []
            }))

            dispatch(sfActions.setUpFormResources({
                hasResources: true,
                ...res,
                product_stretcher: pgStretcher
            }))

            return { status: "COMPLETED" }
        },
        enabled: true
    })

    const changeSubmitStatusIsFalse = () => {
        if (!serviceFormSettings?.activeProduct?.[0]) return;

        if (!serviceFormSettings?.products?.[serviceFormSettings?.activeProduct?.[0]]?.is_submitted) return;

        dispatch(sfSetting.updateSubmitStatus({
            product_id: serviceFormSettings?.activeProduct?.[0],
            is_submitted: false,
            is_saved: false
        }))
        dispatch(sfSetting.update({
            form_saved: false,
            form_saved_time: null
        }))
    }

    useEffect(() => {

        if (!serviceForm?.customer_id || !serviceForm?.work_key || !serviceForm?.start_time) {
            navigate('/tech');
            return;
        }

        if (!serviceFormSettings?.activePage) {
            dispatch(sfSetting.setActivePage(100))
        }

        if (!formResources?.hasResources || !serviceForm) return;

        setIsVerifying(true);

        const result = serviceFormResourcesVerification(
            formResources,
            serviceForm
        );
        setVerification(result)
        setIsVerifying(false);


        // eslint-disable-next-line
    }, [formResources, serviceForm])


    // loading
    if (isLoading || isFetching || isVerifying) {
        return <div className="tech-service-form-loader-container">
            <div className="loader-border">
                <p>{isVerifying
                    ? "Resources verifying.."
                    : "Loading Resources..."
                }</p>
                <p>Loading form resources. This may take a moment.</p>

                <div className="progress-bar">
                    <div className="progress spin"></div>
                </div>
            </div>
        </div>
    }

    // Error
    if (error || !verification?.success) {
        return <ErrorState
            hight='80vh'
            title={!verification?.success ? 'Verification failed' : 'Service form setup failed!'}
            message={verification?.message || error?.message}
            icon={<TbFileText />}
        />
    }

    // Page
    return (
        <div className="tech-service-form-container">

            <div className="top-bar-container">
                <FormTopBar />
            </div>

            <div className="service-form-page-container">

                {/* Main pages */}
                {serviceFormSettings?.activePage === 100 && !serviceFormSettings?.activeSubPage &&
                    <Home page={{ index: 100, type: 'page' }} resource={data} changeSubmitStatus={changeSubmitStatusIsFalse} />}

            </div>

        </div>
    )
}

export default ServiceForm