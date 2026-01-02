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

const ServiceForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)
    const [loading, setLoading] = useState('preparation')
    const [customerProducts, setCustomerProducts] = useState([])
    const [custPG, setCustPG] = useState({})
    const [productPackages, SetProductPackages] = useState([])
    const [productEligibility, setProductEligibility] = useState([])
    const [availableProducts, setAvailableProducts] = useState([])
    const [availablePackages, setAvailablePackages] = useState([])
    const [resources, setResources] = useState([])
    const [error, setError] = useState({ error: false, title: '', message: '' })


    const fetchApi = async () => {

        try {
            setLoading('preparation')

            const apis = [
                api.vfTv2Axios.get(`/customer/${serviceForm?.customer_id}/product-group/products`),
                api.vfTv2Axios.get(`/customer/${serviceForm?.customer_id}/product-group/packages`),
                api.vfTv2Axios.get('/service/form-resources?titles=water_color_variants,water_odor_variants,service_analyze_natures')
            ]

            // Customer products
            const [resCusProducts, resCusPackages, resResources] = await Promise.all(apis);
            const { vessels, add_ons, customer_id, ...restPG } = resCusProducts;
            const ownProducts = [...(vessels || []), ...(add_ons || [])]
            setCustomerProducts(ownProducts)

            // Product Group
            const pgStretcher = buildCustomerPGStretcher(ownProducts)
            setCustPG({ ...restPG, productStretcher: pgStretcher })

            // Customer package
            SetProductPackages(resCusPackages)

            // Resources
            setResources(resResources)


        } catch (error) {

        } finally {
            setLoading('')
        }
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
                    <SfPageOne page={{ index: 100, type: 'page' }} custPG={custPG} customerProducts={customerProducts}
                        customerPackages={productPackages} />}

                {/* Sub Pages */}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 200 &&
                    <SfSubPageOne page={{ index: 200, type: 'subPage' }} resources={resources} />}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 201 &&
                    <SfSubPageTwo page={{ index: 201, type: 'subPage' }} resources={resources} />}
                {serviceFormSettings?.activePage === 100 && serviceFormSettings?.activeSubPage === 202 &&
                    <SfSubPageThree page={{ index: 202, type: 'subPage' }} resources={resources} />}
            </div>
        </div>
    )
}

export default ServiceForm