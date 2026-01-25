import React, { useEffect, useState } from 'react'
import './service-form.scss'
import { TbFileText, TbLoader, } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState'
import FormTopBar from '../../../components/modules/tech/service-form-components/FormTopBar'
import { sfSetting } from '../../../redux/features/persisted/applicationSlice'
import { serviceFormPageRoute, serviceFormSubPageRoute } from '../../../assets/javascript/pre_data/service'
import { api } from '../../../api'
import { buildCustomerPGStretcher } from '../../../utils/services/product_service'
import SfPageOne from '../../../components/modules/tech/service-form-pages/SfPageOne'
import SfSubPageOne from '../../../components/modules/tech/service-form-pages/SfSubPageOne'
import SfSubPageTwo from '../../../components/modules/tech/service-form-pages/SfSubPageTwo'
import SfSubPageThree from '../../../components/modules/tech/service-form-pages/SfSubPageThree'
import SfSubPageFour from '../../../components/modules/tech/service-form-pages/SfSubPageFour'
import SfAdSubPageOne from '../../../components/modules/tech/service-form-pages/SfAdSubPageOne'
import SfAdSubPageTwo from '../../../components/modules/tech/service-form-pages/SfAdSubPageTwo'
import SfAdSubPageThree from '../../../components/modules/tech/service-form-pages/SfAdSubPageThree'
import InputColor from '../../../components/UI_Primitives/inputs/InputColor'

const ServiceForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)
    const [loading, setLoading] = useState('preparation')
    const [customerProducts, setCustomerProducts] = useState([])
    const [customer, setCustomer] = useState({})
    const [regData, setRegData] = useState({})
    const [vesselsEligibilities, setVesselsEligibilities] = useState([])
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
    const [error, setError] = useState({ error: false, title: '', message: '' })


    const fetchApi = async () => {

        try {
            setLoading('preparation')

            const apis = [
                api.vfTv2Axios.get(`/service/service-form/resources?customer_id=${serviceForm?.customer_id}`),
                api.vfTv2Axios.get(`/service/service-form/init?customer_id=${serviceForm?.customer_id}&registration_id=${serviceForm?.registration_id}`),
            ]

            const [resResources, resInit,] = await Promise.all(apis);

            // Form Resources
            setResources(resResources?.form_resources || [])
            setMaterialsList(resResources?.materials || [])
            setBagList(resResources?.bags || [])
            setSpareList(resResources?.spares || [])
            setVesselServiceList(resResources?.vessel_services || [])
            setAddOnServiceList(resResources?.add_on_services || [])
            setAddOnSpareList(resResources?.add_on_spares || [])
            setAvailableAddOns(resResources?.add_ons_list || [])



            // Customer products and packages
            const customerOwnProducts = [...(resInit?.products?.vessels || []), ...(resInit?.products?.add_ons || [])]
            setCustomerProducts(customerOwnProducts)

            // Product Group
            const pgStretcher = buildCustomerPGStretcher(customerOwnProducts)
            setCustomer({ ...resInit?.customer, productStretcher: pgStretcher })

            // Vessel eligibility
            setVesselsEligibilities(resInit?.products?.vessel_eligibility || [])

            // Service Categories
            setServiceCategories(resInit?.service_categories || [])
            setAddOnServiceCategories(resInit?.addOn_service_categories || [])

            // Registration form
            setRegData(resInit?.registration || {})

            // Repeat
            setRepeatWork(resInit?.repeat || { is_repeat: false, repeat_work: {} })







        } catch (error) {

        } finally {
            setLoading('')
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

    // loading
    if (loading === 'preparation') {
        return <div className="tech-service-form-loader-container">
            <TbLoader />
            <p>Preparing...</p>
            <p>It may take a few seconds</p>
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
    return (
        <div className="tech-service-form-container">

            <div className="top-bar-container">
                <FormTopBar refresh={fetchApi} />
            </div>

            <div className="service-form-page-container">
                {/* Pages */}
                {serviceFormSettings?.activePage === 100 && !serviceFormSettings?.activeSubPage &&
                    <SfPageOne page={{ index: 100, type: 'page' }} customer={customer} customerProducts={customerProducts}
                        changeSubmitStatus={changeSubmitStatusIsFalse} availableAddOns={availableAddOns} addOnSpareList={addOnSpareList}
                        resources={resources} repeatWork={repeatWork}
                    />}

                {/* Vessel : Sub Pages  */}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 200 && serviceFormSettings?.activeProduct?.[2] === 'Vessel' &&
                    <SfSubPageOne page={{ index: 200, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse} />}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 201 && serviceFormSettings?.activeProduct?.[2] === 'Vessel' &&
                    <SfSubPageTwo page={{ index: 201, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse} />}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 202 && serviceFormSettings?.activeProduct?.[2] === 'Vessel' &&
                    <SfSubPageThree page={{ index: 202, type: 'subPage' }} categories={serviceCategories}
                        customerProducts={customerProducts} regData={regData} vesselsEligibilities={vesselsEligibilities}
                        materialsList={materialsList} bagList={bagList} spareList={spareList} vesselServiceList={vesselServiceList}
                        changeSubmitStatus={changeSubmitStatusIsFalse} />}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 203 && serviceFormSettings?.activeProduct?.[2] === 'Vessel' &&
                    <SfSubPageFour page={{ index: 203, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse} />}

                {/* Add-On : Sub Pages  */}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 200 && serviceFormSettings?.activeProduct?.[2] === 'Add-On' &&
                    <SfAdSubPageOne page={{ index: 200, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse} />}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 201 && serviceFormSettings?.activeProduct?.[2] === 'Add-On' &&
                    <SfAdSubPageTwo page={{ index: 201, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse}
                        categories={addOnServiceCategories} customerProducts={customerProducts} regData={regData} serviceList={addOnServiceList}
                        spareList={addOnSpareList} />}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 202 && serviceFormSettings?.activeProduct?.[2] === 'Add-On' &&
                    <SfAdSubPageThree page={{ index: 202, type: 'subPage' }} resources={resources} changeSubmitStatus={changeSubmitStatusIsFalse} />}


            </div>
        </div>
    )
}

export default ServiceForm