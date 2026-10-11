import React, { useEffect, useMemo, useState } from 'react'
import './sub-page-style.scss'
import { useSelector } from 'react-redux'
import { SERVICE_SECTIONS, serviceFormSubPageRoute, SPARE_SECTIONS } from '../../../../assets/javascript/pre_data/service.js'
import ServiceCategories from '../service-form-components/work-section/ServiceCategories.jsx'
import WorkHome from '../service-form-components/work-section/WorkHome.jsx'
import ComponentsList from '../service-form-components/work-section/ComponentsList.jsx'
import { findSpareTypeAmount } from '../../../../utils/flows/service_form_utils'
import { normalizeDate } from '../../../../utils/helpers/date-helpers'
import ServiceList from '../service-form-components/work-section/ServiceList.jsx'


const WorkSection = ({
    page, categories, customerProducts, regData, vesselsEligibilities,
    materialsList, bagList, spareList, vesselServiceList, changeSubmitStatus
}) => {

    const { serviceFormSettings, serviceForm, formResources } = useSelector((state) => state.application)
    const orderId = serviceFormSettings?.activeProduct?.[1] || null
    const [workMenu, setWorkMenu] = useState('')
    const [itemsList, setItemList] = useState([])
    const [subPage, setSubPage] = useState({ title: null, id: null, max: 0, deleteItem: false })


    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);

    const product = useMemo(() => {
        if (!serviceFormSettings?.activeProduct?.[0]) return null;

        return formResources?.products?.find(
            p => p.product_id === serviceFormSettings?.activeProduct?.[0]
        ) || null;

        // eslint-disable-next-line
    }, [formResources?.products, serviceFormSettings?.activeProduct?.[0]]);

    const productEligibility = useMemo(() => {
        if (!vesselsEligibilities || !serviceFormSettings?.activeProduct?.[0]) return null;

        return vesselsEligibilities.find(
            e => e.product_id === serviceFormSettings?.activeProduct?.[0]
        ) || null;

        // eslint-disable-next-line
    }, [vesselsEligibilities, serviceFormSettings?.activeProduct?.[0]]);

    const serviceCategory = useMemo(() => {
        const category = formResources?.service_categories?.find(
            (c) =>
                c?.category_id === productInForm?.service_data?.category_id &&
                (!productInForm?.service_data?.package_id || c?.package_id === productInForm?.service_data?.package_id)
        )

        return category
    }, [formResources?.service_categories, productInForm?.service_data])

    const category = useMemo(() => {
        const workServiceId = productInForm?.service_data?.service_id || null
        const workCategoryId = productInForm?.service_data?.category_id

        if (!workServiceId && !workCategoryId) return null;

        const currentCategory = categories?.filter(c => (c?.service_id || null) === workServiceId && c?.category_id === workCategoryId)?.[0]

        return currentCategory

        // eslint-disable-next-line
    }, [categories, productInForm])


    useEffect(() => {
        if (!workMenu) return;

        let priceType = null, pricePackageId = null;

        // components
        if (SPARE_SECTIONS.includes(workMenu?.type)) {

            switch (workMenu?.id) {
                case 'MATERIALS_SECTION':

                    setSubPage({ title: 'Materials', id: 'MATERIALS_SECTION', max: 0, deleteItem: false })

                    if (!category?.coverage?.find(c => c.coverage_id === 'MATERIAL')?.access) {
                        setItemList([])
                        return;
                    };

                    priceType = ['PACKAGE_SPARE', 'RENEWAL_SPARE'].includes(workMenu?.type)
                        ? category?.coverage?.find(c => c.coverage_id === 'MATERIAL')?.price_type : "SELLING_RATE"
                    pricePackageId = 'RENEWAL_SPARE' === workMenu?.type ? category?.target_package?.package_id :
                        'PACKAGE_SPARE' === workMenu?.type ? category?.package_id : null

                    setItemList(materialsList?.map(i => {
                        const inForm = productInForm?.work?.components_list?.filter(s => s?.spare_id === i?.spare_id && s?.spare_type === workMenu?.type)?.[0]
                        if (inForm) return inForm

                        const spareInCustomer = product?.product?.spares?.filter(s => s?.spare_uuid === i?.spare_uuid)?.[0]
                        const warrantySpare = spareInCustomer?.wr_expire_date &&
                            normalizeDate(new Date(spareInCustomer?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false

                        const { reason, ...amountObj } = findSpareTypeAmount(i, priceType, pricePackageId, warrantySpare) || { list_price: 0, charged: 0, ledger_cost: 0 }

                        let obj = {
                            spare_id: i?.spare_id,
                            spare_uuid: i?.spare_uuid,
                            spare_name: i?.spare_name,
                            spare_category: i?.spare_category,
                            spare_section: 'MATERIALS_SECTION',
                            spare_type: workMenu?.type,
                            pricing: amountObj,
                            qty: 0,
                            unit: i?.unit,
                            under_warranty: warrantySpare,
                            non_receivable_reason: (!amountObj?.charged && warrantySpare) ? 'Spare warranty override' : reason,
                            is_customer_product: false,
                            is_removed: false
                        }

                        return obj
                    }))

                    break;

                case 'BAG_SECTION':

                    setSubPage({ title: 'Bags', id: 'BAG_SECTION', max: 1, deleteItem: false })

                    if (!category?.coverage?.find(c => c.coverage_id === 'MATERIALS_BAG')?.access) {
                        setItemList([])
                        return;
                    };

                    priceType = ['PACKAGE_SPARE', 'RENEWAL_SPARE'].includes(workMenu?.type)
                        ? category?.coverage?.find(c => c.coverage_id === 'MATERIALS_BAG')?.price_type : "SELLING_RATE"
                    pricePackageId = 'RENEWAL_SPARE' === workMenu?.type ? category?.target_package?.package_id :
                        'PACKAGE_SPARE' === workMenu?.type ? category?.package_id : null

                    const customerBag = product?.product?.spares?.find(s => s.spare_category === 'MATERIALS_BAG') || {}
                    const warrantyBag = customerBag?.wr_expire_date &&
                        normalizeDate(new Date(customerBag?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false

                    setItemList(bagList?.map(i => {
                        const inForm = productInForm?.work?.components_list?.filter(s => s?.spare_id === i?.spare_id && s?.spare_type === workMenu?.type)?.[0]
                        if (inForm) return inForm

                        const { reason, ...amountObj } = findSpareTypeAmount(i, priceType, pricePackageId, warrantyBag) || { list_price: 0, charged: 0, ledger_cost: 0 }

                        let obj = {
                            spare_id: i?.spare_id,
                            spare_uuid: i?.spare_uuid,
                            spare_name: i?.spare_name,
                            spare_category: i?.spare_category,
                            spare_section: 'BAG_SECTION',
                            spare_type: workMenu?.type,
                            pricing: amountObj,
                            qty: 0,
                            unit: i?.unit,
                            under_warranty: warrantyBag,
                            non_receivable_reason: (!amountObj?.charged && warrantyBag) ? 'Bag warranty override' : reason,
                            warranty_period_months: amountObj?.charged > 0 ? (i?.warranty_period || 0) : 0,
                            is_customer_product: i?.spare_uuid === customerBag?.spare_uuid,
                            is_removed: false
                        }

                        return obj
                    }))

                    break;

                case 'SPARE_SECTION':

                    setSubPage({ title: 'Spares', id: 'SPARE_SECTION', max: 0, deleteItem: true })

                    if (!category?.coverage?.find(c => c.coverage_id === 'PRIMARY_SPARES')?.access) {
                        setItemList([])
                        return;
                    };

                    priceType = ['PACKAGE_SPARE', 'RENEWAL_SPARE'].includes(workMenu?.type)
                        ? category?.coverage?.find(c => c.coverage_id === 'PRIMARY_SPARES')?.price_type : "SELLING_RATE"
                    pricePackageId = 'RENEWAL_SPARE' === workMenu?.type ? category?.target_package?.package_id :
                        'PACKAGE_SPARE' === workMenu?.type ? category?.package_id : null

                    setItemList(spareList?.map(i => {
                        const inForm = productInForm?.work?.components_list?.filter(s => s?.spare_id === i?.spare_id && s?.spare_type === workMenu?.type)?.[0]
                        if (inForm) return inForm

                        const spareInCustomer = product?.product?.spares?.filter(s => s?.spare_uuid === i?.spare_uuid)?.[0]
                        const spareInRemoveList = productInForm?.work?.removed_components_list?.filter(s => s?.spare_uuid === i?.spare_uuid && s?.spare_type === workMenu?.type)?.[0] ? true : false

                        const warrantySpare = spareInCustomer?.wr_expire_date &&
                            normalizeDate(new Date(spareInCustomer?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false

                        const { reason, ...amountObj } = findSpareTypeAmount(i, priceType, pricePackageId, warrantySpare) || { list_price: 0, charged: 0, ledger_cost: 0 }

                        let obj = {
                            spare_id: i?.spare_id,
                            spare_uuid: i?.spare_uuid,
                            spare_name: i?.spare_name,
                            spare_category: i?.spare_category,
                            spare_section: 'SPARE_SECTION',
                            spare_type: workMenu?.type,
                            pricing: amountObj,
                            qty: 0,
                            unit: i?.unit,
                            under_warranty: warrantySpare,
                            non_receivable_reason: (!amountObj?.charged && warrantySpare) ? 'Spare warranty override' : reason,
                            warranty_period_months: amountObj?.charged > 0 ? (i?.warranty_period || 0) : 0,
                            is_customer_product: i?.spare_uuid === spareInCustomer?.spare_uuid,
                            is_removed: spareInRemoveList
                        }

                        return obj
                    }))

                    break;

                default:
                    break;
            }
        }

        // Service work
        if (SERVICE_SECTIONS.includes(workMenu?.type)) {

            setSubPage({ title: 'Service Works', id: 'SERVICE', max: 0, deleteItem: false })

            if (!category?.coverage?.find(c => c.coverage_id === 'SERVICE_WORK')?.access) {
                setItemList([])
                return;
            };

            priceType = ['PACKAGE_SERVICE', 'RENEWAL_SERVICE'].includes(workMenu?.type)
                ? category?.coverage?.find(c => c.coverage_id === 'SERVICE_WORK')?.price_type : "SELLING_RATE"
            pricePackageId = 'RENEWAL_SERVICE' === workMenu?.type ? category?.target_package?.package_id :
                'PACKAGE_SERVICE' === workMenu?.type ? category?.package_id : null

            const customerBag = product?.product?.spares?.find(s => s.spare_category === 'MATERIALS_BAG') || {}
            const warrantyBag = customerBag?.wr_expire_date &&
                normalizeDate(new Date(customerBag?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false


            setItemList(vesselServiceList?.map(i => {
                const inForm = productInForm?.work?.services_list?.filter(s => s?.service_id === i?.work_id && s?.service_type === workMenu?.type)?.[0]

                const warrantyEnabled = !i?.reinstallation_included && warrantyBag

                const { reason, ...amountObj } = findSpareTypeAmount(i, priceType, pricePackageId, warrantyEnabled)
                    || { list_price: 0, charged: 0, ledger_cost: 0 }

                let obj = {
                    service_id: i?.work_id,
                    service_uuid: i?.work_uuid,
                    service_name: i?.work_name,
                    service_type: workMenu?.type,
                    pricing: amountObj,
                    call_rate: i?.call_rate,
                    refill_included: i?.refill_included,
                    reinstallation_included: i?.reinstallation_included,
                    selected: inForm ? true : false,
                    under_warranty: warrantyEnabled,
                    non_receivable_reason: (!amountObj?.charged && warrantyEnabled) ? 'Bag warranty override' : reason
                }

                return obj
            }))
        }

        // eslint-disable-next-line
    }, [workMenu, productInForm])


    return (
        <div className="tech-service-form-subpage">

            {/* Title */}
            <div className="title-section">
                <h3>Action Taken</h3>
                <p>Record the solution or repair performed during the service</p>
            </div>

            {/* Service Categories */}
            {(!productInForm?.service_data?.category_id || !productInForm?.service_data?.mode) &&
                <ServiceCategories />}

            {(productInForm?.service_data?.category_id && productInForm?.service_data?.mode) &&
                <>{workMenu
                    ? <>
                        {SPARE_SECTIONS.includes(workMenu) &&
                            <ComponentsList setWorkMenu={setWorkMenu} product={product} serviceCategory={serviceCategory}
                                productInForm={productInForm} workMenu={workMenu} />}
                        {SERVICE_SECTIONS.includes(workMenu) &&
                            <ServiceList setWorkMenu={setWorkMenu} productInForm={productInForm} workMenu={workMenu}
                                product={product} serviceCategory={serviceCategory} />}
                    </>
                    : <WorkHome setWorkMenu={setWorkMenu} />}
                </>}

        </div>
    )
}

export default WorkSection