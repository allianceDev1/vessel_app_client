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

const ServiceForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)
    const [conflict, setConflict] = useState({ error: false, title: '', message: '' })



    const {
        isLoading,
        isFetching,
        data: {
            resources,
            materialsList,
            bagList,
            spareList,
            vesselServiceList,
            addOnServiceList,
            addOnSpareList,
            availableAddOns,
            serviceCharges,
            customerProducts,
            customer,
            vesselsEligibilities,
            addOnsEligibilities,
            serviceCategories,
            addOnServiceCategories,
            regData,
            repeatWork
        } = {},
        error
    } = useQuery({
        queryKey: ['service_form_resources', serviceForm?.customer_id, serviceForm?.visit_uuid],
        queryFn: async () => {

            const apis = [
                api.vfTv2Axios.get(`/service/service-form/resources?customer_id=${serviceForm?.customer_id}`),
                api.vfTv2Axios.get(`/service/service-form/init?customer_id=${serviceForm?.customer_id}&registration_id=${serviceForm?.registration_id}`)
            ]

            const [resResources, resInit] = await Promise.all(apis);

            const customerOwnProducts = [...(resInit?.products?.vessel_filters || []), ...(resInit?.products?.add_ons || [])]
            const pgStretcher = buildCustomerPGStretcher(customerOwnProducts)

            // Call Log
            dispatch(sfActions.updateVerification({
                otpLogs: resInit?.otp_logs || []
            }))

            return {
                // Form Resources
                resources: resResources?.form_resources || [],
                materialsList: resResources?.v_materials || [],
                bagList: resResources?.v_bags || [],
                spareList: resResources?.v_spares || [],
                vesselServiceList: resResources?.v_services || [],
                addOnServiceList: resResources?.a_services || [],
                addOnSpareList: resResources?.a_spares || [],
                availableAddOns: resResources?.add_on_products || [],
                serviceCharges: resResources?.new_product_service_charges || [],

                // Customer products and packages
                customerProducts: customerOwnProducts,

                // Product Group
                customer: { ...resInit?.customer, productStretcher: pgStretcher },

                //  eligibility
                vesselsEligibilities: resInit?.products?.vessel_filters_eligibility || [],
                addOnsEligibilities: resInit?.products?.add_ons_eligibility || [],


                // Service Categories
                serviceCategories: resInit?.vessel_service_categories || [],
                addOnServiceCategories: resInit?.add_on_service_categories || [],

                // Registration form
                regData: resInit?.registration || {},

                // Repeat
                repeatWork: resInit?.repeat || { is_repeat: false, repeat_work: {} },
            }
        },
        staleTime: 30 * 60_000 // 30 minutes
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

        if (!serviceForm?.customer_id || !serviceForm?.registration_id || !serviceForm?.in_time || !serviceForm?.visit_uuid
            || !serviceForm?.technician_uuid) {
            navigate('/tech');
            return;
        }

        if (!serviceFormSettings?.activePage) {
            dispatch(sfSetting.setActivePage(100))
        }

        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (serviceForm?.customer_id && serviceForm?.registration_id && customer?.customer_id && regData?.registration_id) {
            if (serviceForm?.customer_id !== customer?.customer_id || serviceForm?.registration_id !== regData?.registration_id) {
                setConflict({
                    error: true,
                    title: 'Data Conflict Detected',
                    message: "We found existing service data stored in your cache that may conflict with this action. To continue safely, you need to clear the cached data first."
                })
            }
        }
        // eslint-disable-next-line
    }, [customer, regData])


    // loading
    if (isLoading || isFetching) {
        return <div className="tech-service-form-loader-container">
            <div className="loader-border">
                {/* <TbLoader /> */}
                <p>Setting up the service form</p>
                <p>Loading resources and initial information. This may take a moment.</p>

                <div className="progress-bar">
                    <div className="progress spin"></div>
                </div>
            </div>
        </div>
    }

    // Error
    if (error || conflict?.error) {
        return <ErrorState
            hight='80vh'
            title={conflict?.title || 'Form resources fetching failed'}
            message={conflict?.error || error?.message}
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
                {/* Pages */}
                {serviceFormSettings?.activePage === 100 && !serviceFormSettings?.activeSubPage &&
                    <Home page={{ index: 100, type: 'page' }} customer={customer} customerProducts={customerProducts}
                        changeSubmitStatus={changeSubmitStatusIsFalse} availableAddOns={availableAddOns} addOnSpareList={addOnSpareList}
                        resources={resources} repeatWork={repeatWork} serviceCharges={serviceCharges} />}
                {serviceFormSettings?.activePage === 101 && !serviceFormSettings?.activeSubPage &&
                    <Review page={{ index: 101, type: 'page' }} />}
                {serviceFormSettings?.activePage === 102 && !serviceFormSettings?.activeSubPage &&
                    <Payment page={{ index: 102, type: 'page' }} />}


                {/* Vessel : Sub Pages  */}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 200 && serviceFormSettings?.activeProduct?.[2] === 'VESSEL_FILTER' &&
                    <SfSubPageOne page={{ index: 200, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse} />}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 201 && serviceFormSettings?.activeProduct?.[2] === 'VESSEL_FILTER' &&
                    <SfSubPageTwo page={{ index: 201, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse} />}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 202 && serviceFormSettings?.activeProduct?.[2] === 'VESSEL_FILTER' &&
                    <SfSubPageThree page={{ index: 202, type: 'subPage' }} categories={serviceCategories}
                        customerProducts={customerProducts} regData={regData} vesselsEligibilities={vesselsEligibilities}
                        materialsList={materialsList} bagList={bagList} spareList={spareList} vesselServiceList={vesselServiceList}
                        changeSubmitStatus={changeSubmitStatusIsFalse} />}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 203 && serviceFormSettings?.activeProduct?.[2] === 'VESSEL_FILTER' &&
                    <SfSubPageFour page={{ index: 203, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse} />}


                {/* Add-On : Sub Pages  */}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 200 && serviceFormSettings?.activeProduct?.[2] === 'ADD_ON' &&
                    <SfAdSubPageOne page={{ index: 200, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse} />}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 201 && serviceFormSettings?.activeProduct?.[2] === 'ADD_ON' &&
                    <SfAdSubPageTwo page={{ index: 201, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse}
                        categories={addOnServiceCategories} customerProducts={customerProducts} regData={regData} serviceList={addOnServiceList}
                        spareList={addOnSpareList} addOnsEligibilities={addOnsEligibilities} />}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 202 && serviceFormSettings?.activeProduct?.[2] === 'ADD_ON' &&
                    <SfAdSubPageThree page={{ index: 202, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse} />}

            </div>
        </div>
    )
}

export default ServiceForm