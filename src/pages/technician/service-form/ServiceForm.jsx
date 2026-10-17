import React, { useEffect, useRef, useState } from 'react'
import './service-form.scss'
import { TbAlertCircle, TbAlertTriangle, TbFileText, TbRotate2 } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { sfActions, sfSetting } from '../../../redux/features/persisted/applicationSlice'
import { api } from '../../../api'
import { buildCustomerPGStretcher } from '../../../utils/services/product_service'
import { useQuery } from '@tanstack/react-query'
import { serviceFormResourcesVerification } from '../../../utils/services/service-form-services'

import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState'
import Button from '../../../components/UI_Primitives/buttons/Button'
import Badge from '../../../components/UI_Primitives/badge/Badge'
import FormTopBar from '../../../components/modules/tech/service-form-components/FormTopBar'
import Home from '../../../components/modules/tech/service-form-pages/Home'
import WpCurrentCondition from '../../../components/modules/tech/service-form-pages/WpCurrentCondition'
import WpWithNewSpun from '../../../components/modules/tech/service-form-pages/WpWithNewSpun'
import VfCurrentCondition from '../../../components/modules/tech/service-form-pages/VfCurrentCondition'
import VfInspection from '../../../components/modules/tech/service-form-pages/VfInspection'
import Payment from '../../../components/modules/tech/service-form-pages/Payment'
import AdCurrentCondition from '../../../components/modules/tech/service-form-pages/AdCurrentCondition'
import WpPumpMembrane from '../../../components/modules/tech/service-form-pages/WpPumpMembrane'
import WpInspection from '../../../components/modules/tech/service-form-pages/WpInspection'
import WorkSection from '../../../components/modules/tech/service-form-pages/WorkSection'
import VfEvaluation from '../../../components/modules/tech/service-form-pages/VfEvaluation'
import AdEvaluation from '../../../components/modules/tech/service-form-pages/AdEvaluation'
import WpEvaluation from '../../../components/modules/tech/service-form-pages/WpEvaluation'
import ReviewSection from '../../../components/modules/tech/service-form-pages/ReviewSection'
import BillReview from '../../../components/modules/tech/service-form-pages/BillReview'
import Verification from '../../../components/modules/tech/service-form-pages/Verification'



const ServiceForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { formResources, serviceForm, serviceFormSettings, verification } = useSelector((state) => state.application)
    const [isVerifying, setIsVerifying] = useState(false)
    const [resourcesVerification, setResourcesVerification] = useState({ success: true, message: null })
    const [openedBill, setOpenedBill] = useState({})


    const serviceFormRef = useRef(serviceForm)
    useEffect(() => {
        serviceFormRef.current = serviceForm
    }, [serviceForm])

    const handleVerify = (resources, currentForm) => {
        if (!resources?.hasResources || !currentForm) return
        setIsVerifying(true)
        const result = serviceFormResourcesVerification(resources, currentForm)

        setResourcesVerification(result)
        setIsVerifying(false)
    }

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

            const resourcesData = {
                hasResources: true,
                ...res,
                product_stretcher: pgStretcher
            }

            // add to redux
            dispatch(sfActions.updateVerification({
                otpLogs: otp_logs || []
            }))

            dispatch(sfActions.setUpFormResources(resourcesData))

            // Run resourcesVerification whenever resources are loaded from API
            handleVerify(resourcesData, serviceFormRef.current || serviceForm)

            return { status: "COMPLETED" }
        },
        enabled: !formResources?.hasResources
    })

    // Navigation and initial page routing
    useEffect(() => {
        if (!serviceForm?.customer_id || !serviceForm?.work_key || !serviceForm?.start_time) {
            navigate('/tech');
            return;
        }

        if (!serviceFormSettings?.activePage) {
            dispatch(sfSetting.page.next(1000))
        }
    }, [serviceForm?.customer_id, serviceForm?.work_key, serviceForm?.start_time, serviceFormSettings?.activePage, navigate, dispatch])

    // Run resourcesVerification once on initial mount if resources are already cached
    const initialVerifiedRef = useRef(false)
    useEffect(() => {
        if (!initialVerifiedRef.current && formResources?.hasResources && (serviceFormRef.current || serviceForm)) {
            initialVerifiedRef.current = true
            handleVerify(formResources, serviceFormRef.current || serviceForm)
        }
        // eslint-disable-next-line
    }, [formResources?.hasResources])

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
                : error ? (
                    <ErrorState
                        hight='80vh'
                        title='Service form setup failed!'
                        message={error?.message}
                        icon={<TbFileText />}
                    />
                ) : !resourcesVerification?.success ? (
                    <div className="resourcesVerification-error-container">
                        <div className="error-header">
                            <TbAlertTriangle className="alert-icon" />
                            <h2>Verification Conflicts Detected</h2>
                            <p>
                                Stored service data conflicts with updated resources.
                                Please review the issues by product below before proceeding.
                            </p>
                        </div>

                        <div className="product-error-cards">
                            {/* Product-based error cards */}
                            {Object.values(resourcesVerification?.products || {})
                                .filter((prod) => !prod?.success || (prod?.errors && prod?.errors.length > 0))
                                .map((prod) => (
                                    <div key={prod.product_id} className="product-error-card">
                                        <div className="card-top">
                                            <div className="product-title-group">
                                                <Badge value={prod.product_id} severity="danger" size="small" />
                                                <h4>{prod.product_name}</h4>
                                            </div>
                                            {prod.product_type && (
                                                <span className="product-type-label">
                                                    {prod.product_type.replace(/_/g, ' ')}
                                                </span>
                                            )}
                                        </div>

                                        <ul className="error-list">
                                            {[...new Set(prod.errors || [])].map((errMessage, index) => (
                                                <li key={index} className="error-item">
                                                    <TbAlertCircle />
                                                    <span>{errMessage}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}

                            {/* General non-product errors if any */}
                            {resourcesVerification?.general_errors?.length > 0 && (
                                <div className="product-error-card general-error-card">
                                    <div className="card-top">
                                        <div className="product-title-group">
                                            <Badge value="General" severity="warning" size="small" />
                                            <h4>System & Configuration</h4>
                                        </div>
                                    </div>
                                    <ul className="error-list">
                                        {[...new Set(resourcesVerification.general_errors || [])].map((errMessage, index) => (
                                            <li key={index} className="error-item">
                                                <TbAlertCircle />
                                                <span>{errMessage}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="action-footer">
                            <Button
                                label="Re-sync Resources"
                                icon={<TbRotate2 />}
                                severity="primary"
                                rounded
                                onClick={() => refetch()}
                            />
                        </div>
                    </div>
                )
                    : <div className="service-form-page-container">

                        {/* Main pages */}

                        {serviceFormSettings?.activePage === 1000 && !serviceFormSettings?.activeProduct?.[0]
                            && ![1001, 1002, 1003].includes(serviceFormSettings?.activePage) &&
                            < Home pageKey={1000} />}

                        {serviceFormSettings?.activePage === 1001 && <>
                            {!openedBill?.service_srl_no && <ReviewSection setOpenedBill={setOpenedBill} pageKey={1001} />}
                            {openedBill?.service_srl_no && <BillReview bill={openedBill} setOpenedBill={setOpenedBill} />}
                        </>}

                        {serviceFormSettings?.activePage === 1002 && <>
                            {verification?.is_verified && <Payment pageKey={1002} />}
                            {!verification?.is_verified && <Verification />}
                        </>}

                        {/* Water purifier */}
                        {serviceFormSettings?.activePage === 1100 && <WpCurrentCondition pageKey={1100} />}
                        {serviceFormSettings?.activePage === 1101 && <WpWithNewSpun pageKey={1101} />}
                        {serviceFormSettings?.activePage === 1102 && <WpPumpMembrane pageKey={1102} />}
                        {serviceFormSettings?.activePage === 1103 && <WpInspection pageKey={1103} />}
                        {serviceFormSettings?.activePage === 1105 && <WpEvaluation pageKey={1105} />}


                        {/* Vessel Filter  */}
                        {serviceFormSettings?.activePage === 1200 && <VfCurrentCondition pageKey={1200} />}
                        {serviceFormSettings?.activePage === 1201 && <VfInspection pageKey={1201} />}
                        {serviceFormSettings?.activePage === 1203 && <VfEvaluation pageKey={1203} />}


                        {/* Add-On  */}
                        {serviceFormSettings?.activePage === 1300 && <AdCurrentCondition pageKey={1300} />}
                        {serviceFormSettings?.activePage === 1302 && <AdEvaluation pageKey={1302} />}


                        {/* Work */}
                        {[1104, 1202, 1301].includes(serviceFormSettings?.activePage) && <WorkSection />}

                    </div>}
        </div>
    )
}

export default ServiceForm