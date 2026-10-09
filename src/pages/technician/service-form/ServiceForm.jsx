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
import WpCurrentCondition from '../../../components/modules/tech/service-form-pages/WpCurrentCondition'
import WpWithNewSpun from '../../../components/modules/tech/service-form-pages/WpWithNewSpun'
import VfCurrentCondition from '../../../components/modules/tech/service-form-pages/VfCurrentCondition'
import VfInspection from '../../../components/modules/tech/service-form-pages/VfInspection'
// import SfSubPageThree from '../../../components/modules/tech/service-form-pages/SfSubPageThree'
// import SfSubPageFour from '../../../components/modules/tech/service-form-pages/SfSubPageFour'
// import SfAdSubPageTwo from '../../../components/modules/tech/service-form-pages/SfAdSubPageTwo'
// import SfAdSubPageThree from '../../../components/modules/tech/service-form-pages/SfAdSubPageThree'
// import Review from '../../../components/modules/tech/service-form-pages/Review'
// import Payment from '../../../components/modules/tech/service-form-pages/Payment'
import AdCurrentCondition from '../../../components/modules/tech/service-form-pages/AdCurrentCondition'
import { useQuery } from '@tanstack/react-query'
import { serviceFormResourcesVerification } from '../../../utils/services/service-form-services'
import WpPumpMembrane from '../../../components/modules/tech/service-form-pages/WpPumpMembrane'
import WpInspection from '../../../components/modules/tech/service-form-pages/WpInspection'
import WorkSection from '../../../components/modules/tech/service-form-pages/WorkSection'

const ServiceForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { formResources, serviceForm, serviceFormSettings } = useSelector((state) => state.application)
    const [isVerifying, setIsVerifying] = useState(false)
    const [verification, setVerification] = useState({ success: true, message: null })


    const {
        isLoading,
        isFetching,
        refetch,
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
        enabled: !formResources?.hasResources
    })

    useEffect(() => {

        if (!serviceForm?.customer_id || !serviceForm?.work_key || !serviceForm?.start_time) {
            navigate('/tech');
            return;
        }

        if (!serviceFormSettings?.activePage) {
            dispatch(sfSetting.page.next(1000))
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

    // Page
    return (
        <div className="tech-service-form-container">

            <div className="top-bar-container">
                <FormTopBar refreshResources={refetch} isSyncing={isLoading || isFetching || isVerifying} />
            </div>

            {(isLoading || isFetching || isVerifying) ?
                <div className="loader-section">
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
                : (error || !verification?.success) ?
                    <ErrorState
                        hight='80vh'
                        title={!verification?.success ? 'Verification failed' : 'Service form setup failed!'}
                        message={verification?.message || error?.message}
                        icon={<TbFileText />}
                    />
                    : <div className="service-form-page-container">

                        {/* Main pages */}
                        {serviceFormSettings?.activePage === 1000 && <Home pageKey={1000} />}

                        {/* {serviceFormSettings?.activePage === 101 && !serviceFormSettings?.activeSubPage &&
                            <Review page={{ index: 101, type: 'page' }} />}
                        {serviceFormSettings?.activePage === 102 && !serviceFormSettings?.activeSubPage &&
                            <Payment page={{ index: 102, type: 'page' }} />} */}

                        {/* Water purifier */}
                        {serviceFormSettings?.activePage === 1100 && <WpCurrentCondition pageKey={1100} />}
                        {serviceFormSettings?.activePage === 1101 && <WpWithNewSpun pageKey={1101} />}
                        {serviceFormSettings?.activePage === 1102 && <WpPumpMembrane pageKey={1102} />}
                        {serviceFormSettings?.activePage === 1103 && <WpInspection pageKey={1103} />}


                        {/* Vessel Filter  */}
                        {serviceFormSettings?.activePage === 1200 && <VfCurrentCondition pageKey={1200} />}
                        {serviceFormSettings?.activePage === 1201 && <VfInspection pageKey={1201} />}
                        {/* {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 202 && serviceFormSettings?.activeProduct?.[2] === 'VESSEL_FILTER' &&
                            <SfSubPageThree page={{ index: 202, type: 'subPage' }} categories={serviceCategories}
                                customerProducts={customerProducts} regData={regData} vesselsEligibilities={vesselsEligibilities}
                                materialsList={materialsList} bagList={bagList} spareList={spareList} vesselServiceList={vesselServiceList}
                                changeSubmitStatus={changeSubmitStatusIsFalse} />}
                        {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 203 && serviceFormSettings?.activeProduct?.[2] === 'VESSEL_FILTER' &&
                            <SfSubPageFour page={{ index: 203, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse} />} */}


                        {/* Add-On  */}
                        {serviceFormSettings?.activePage === 1300 && <AdCurrentCondition pageKey={1300} />}
                        {/* {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 201 && serviceFormSettings?.activeProduct?.[2] === 'ADD_ON' &&
                            <SfAdSubPageTwo page={{ index: 201, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse}
                                categories={addOnServiceCategories} customerProducts={customerProducts} regData={regData} serviceList={addOnServiceList}
                                spareList={addOnSpareList} addOnsEligibilities={addOnsEligibilities} />}
                        {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 202 && serviceFormSettings?.activeProduct?.[2] === 'ADD_ON' &&
                            <SfAdSubPageThree page={{ index: 202, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse} />} */}

                        {/* Work */}
                        {[1104, 1202, 1301].includes(serviceFormSettings?.activePage) && <WorkSection  />}

                    </div>}
        </div>
    )
}

export default ServiceForm