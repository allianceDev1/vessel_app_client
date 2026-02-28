import React, { useEffect, useState } from 'react'
import './service-form.scss'
import { TbFileText } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { sfActions, sfSetting } from '../../../redux/features/persisted/applicationSlice'
import { api } from '../../../api'
import { buildCustomerPGStretcher } from '../../../utils/services/product_service'
import { createBatchProgress } from '../../../utils/services/event-service'
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

const ServiceForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)
    const [loading, setLoading] = useState('preparation')
    const [customerProducts, setCustomerProducts] = useState([])
    const [customer, setCustomer] = useState({})
    const [regData, setRegData] = useState({})
    const [vesselsEligibilities, setVesselsEligibilities] = useState([])
    const [addOnsEligibilities,setAddOnsEligibilities] = useState([])
    const [materialsList, setMaterialsList] = useState([])
    const [bagList, setBagList] = useState([])
    const [spareList, setSpareList] = useState([])
    const [vesselServiceList, setVesselServiceList] = useState([])
    const [resources, setResources] = useState([])
    const [serviceCategories, setServiceCategories] = useState([])
    const [addOnServiceCategories, setAddOnServiceCategories] = useState([])
    const [addOnServiceList, setAddOnServiceList] = useState([])
    const [addOnSpareList, setAddOnSpareList] = useState([])
    const [availableAddOns, setAvailableAddOns] = useState([])
    const [repeatWork, setRepeatWork] = useState(false)
    const [serviceCharges, setServiceCharges] = useState([])
    const [error, setError] = useState({ error: false, title: '', message: '' })
    const [apiProgress, setApiProgress] = useState(0);


    const fetchApi = async () => {

        try {
            setLoading('preparation')
            setApiProgress(0);
            setError({ error: false, title: '', message: '' })

            const updateBatchProgress = createBatchProgress(setApiProgress);

            const apis = [
                api.vfTv2Axios.get(`/service/service-form/resources?customer_id=${serviceForm?.customer_id}`, {
                    onDownloadProgress: (e) => {
                        if (!e.total) return; // sometimes server doesn't send content-length
                        const percent = Math.round((e.loaded * 100) / e.total);
                        updateBatchProgress("resources", percent);
                    }
                }),
                api.vfTv2Axios.get(`/service/service-form/init?customer_id=${serviceForm?.customer_id}&registration_id=${serviceForm?.registration_id}`, {
                    onDownloadProgress: (e) => {
                        if (!e.total) return;
                        const percent = Math.round((e.loaded * 100) / e.total);
                        updateBatchProgress("init", percent);
                    }
                }),
            ]

            const [resResources, resInit] = await Promise.all(apis);

            // Form Resources
            setResources(resResources?.form_resources || [])
            setMaterialsList(resResources?.v_materials || [])
            setBagList(resResources?.v_bags || [])
            setSpareList(resResources?.v_spares || [])
            setVesselServiceList(resResources?.v_services || [])
            setAddOnServiceList(resResources?.a_services || [])
            setAddOnSpareList(resResources?.a_spares || [])
            setAvailableAddOns(resResources?.add_on_products || [])
            setServiceCharges(resResources?.new_product_service_charges || [])

            // Customer products and packages
            const customerOwnProducts = [...(resInit?.products?.vessel_filters || []), ...(resInit?.products?.add_ons || [])]
            setCustomerProducts(customerOwnProducts)

            // Product Group
            const pgStretcher = buildCustomerPGStretcher(customerOwnProducts)
            setCustomer({ ...resInit?.customer, productStretcher: pgStretcher })

            //  eligibility
            setVesselsEligibilities(resInit?.products?.vessel_filters_eligibility || [])
            setAddOnsEligibilities(resInit?.products?.add_ons_eligibility || [])


            // Service Categories
            setServiceCategories(resInit?.vessel_service_categories || [])
            setAddOnServiceCategories(resInit?.add_on_service_categories || [])

            // Registration form
            setRegData(resInit?.registration || {})

            // Repeat
            setRepeatWork(resInit?.repeat || { is_repeat: false, repeat_work: {} })

            // Call Log
            dispatch(sfActions.updateVerification({
                otpLogs: resInit?.otp_logs || []
            }))

        } catch (error) {
            setError({
                error: true,
                title: 'Preparation Failed',
                message: error?.message ? `${error?.message}, Please tye again!` : "Please tye again!"
            })
        } finally {
            setLoading('')
            setApiProgress(0)
        }
    }

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

        // initial fetch
        fetchApi()
    }, [])

    useEffect(() => {
        if (serviceForm?.customer_id && serviceForm?.registration_id && customer?.customer_id && regData?.registration_id) {
            if (serviceForm?.customer_id !== customer?.customer_id || serviceForm?.registration_id !== regData?.registration_id) {
                setError({
                    error: true,
                    title: 'Data Conflict Detected',
                    message: "We found existing service data stored in your cache that may conflict with this action. To continue safely, you need to clear the cached data first."
                })
            }
        }
    }, [customer, regData])


    // loading
    if (loading === 'preparation') {
        return <div className="tech-service-form-loader-container">
            <div className="loader-border">
                {/* <TbLoader /> */}
                <p>Setting up the service form</p>
                <p>Loading resources and initial information. This may take a moment.</p>

                <div className="progress-bar">
                    {(apiProgress && apiProgress < 100)
                        ? <div className="progress" style={{ width: `${apiProgress}%` }}></div>
                        : <div className="progress spin"></div>}
                </div>
            </div>
        </div>
    }

    // Error
    if (error?.error) {
        return <ErrorState
            hight='70vh'
            title={error?.title}
            message={error?.message}
            icon={<TbFileText />}
        />
    }


    // Page
    return (
        <div className="tech-service-form-container">

            <div className="top-bar-container">
                <FormTopBar refresh={fetchApi} />
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