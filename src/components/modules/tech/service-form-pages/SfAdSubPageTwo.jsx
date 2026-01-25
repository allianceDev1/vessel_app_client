import React, { useEffect, useMemo, useState } from 'react'
import './sub-page-style.scss'
import { serviceFormAddOnSubPageRoute } from '../../../../assets/javascript/pre_data/service'
import { useSelector } from 'react-redux'
import { findSpareTypeAmount } from '../../../../utils/flows/service_form_utils'
import { normalizeDate } from '../../../../utils/helpers/date-helpers'
import AdServiceCategories from '../service-form-components/AdServiceCategories'
import AdServiceWorkHome from '../service-form-components/AdServiceWorkHome'
import VfComponentsList from '../service-form-components/VfComponentsList'
import AdServiceList from '../service-form-components/AdServiceList'


const SfAdSubPageTwo = ({ page, categories, customerProducts, regData, spareList, serviceList, changeSubmitStatus }) => {
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)
    const [workMenu, setWorkMenu] = useState({ type: null, id: null })
    const [componentsList, setComponentsList] = useState([])
    const [servicesList, setServicesList] = useState([])
    const [componentsPage, setComponentsPage] = useState({ title: null, id: null, max: 0, deleteItem: false })

    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);

    const product = useMemo(() => {
        if (!customerProducts || !serviceFormSettings?.activeProduct?.[0]) return null;

        return customerProducts.find(
            p => p.product_id === serviceFormSettings?.activeProduct?.[0]
        ) || null;

        // eslint-disable-next-line
    }, [customerProducts, serviceFormSettings?.activeProduct?.[0]]);

    const category = useMemo(() => {
        const workServiceId = productInForm?.service_data?.service_id || null
        const workCategoryId = productInForm?.service_data?.category_id

        if (!workServiceId && !workCategoryId) return null;

        const currentCategory = categories?.filter(c => (c?.service_id || null) === workServiceId && c?.category_id === workCategoryId)?.[0]

        return currentCategory

        // eslint-disable-next-line
    }, [categories, productInForm])



    useEffect(() => {
        if (!workMenu?.type) return;

        // components 
        if (workMenu?.type === 'components') {

            if (workMenu?.id === 'spares') {

                setComponentsList(spareList?.map(i => {
                    const inForm = productInForm?.work?.components_list?.filter(s => s?.spare_id === i?.spare_uuid)?.[0]
                    if (inForm) return inForm

                    const spareInCustomer = product?.product?.spares?.filter(s => s?.spare_uuid === i?.spare_uuid)?.[0]
                    const spareInRemoveList = productInForm?.work?.removed_components_list?.filter(s => s?.spare_id === i?.spare_uuid)?.[0] ? true : false

                    const warrantySpare = spareInCustomer?.wr_expire_date &&
                        normalizeDate(new Date(spareInCustomer?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false

                    const { reason, ...amountObj } = findSpareTypeAmount(i, category?.spare_policies?.primary_spare?.price_type, warrantySpare)
                        || { list_price: 0, charged: 0, ledger_cost: 0 }

                    let obj = {
                        spare_id: i?.spare_uuid,
                        spare_name: i?.brand_name ? `${i?.spare_name} - ${i?.brand_name}` : i?.spare_name,
                        spare_type: 'spares',
                        pricing: amountObj,
                        qty: 0,
                        qty_type: i?.qty_type,
                        under_warranty: warrantySpare,
                        non_receivable_reason: (!amountObj?.charged && warrantySpare) ? 'Spare warranty override' : reason,
                        warranty_period_months: amountObj?.charged > 0 ? (i?.warranty_period_months || 0) : 0,
                        is_customer_product: i?.spare_uuid === spareInCustomer?.spare_uuid,
                        is_removed: spareInRemoveList
                    }

                    return obj
                }))
                setComponentsPage({ title: 'Spares', id: 'spares', max: 0, deleteItem: true })
                return;
            }
        }

        if (workMenu?.type === 'services') {
            setServicesList(serviceList?.filter(s => !(s?.rent_renewal_included && !product?.rental?.has_rental))?.map(i => {
                const inForm = productInForm?.work?.services_list?.filter(s => s?.service_id === i?.work_uuid)?.[0]

                const warrantyItem = product?.product?.wr_expire_date &&
                    normalizeDate(new Date(product?.product?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false
                const warrantyEnabled = !i?.reinstallation_included && warrantyItem
                let itemPrice = {};

                switch (i.pricing_source) {
                    case 'SERVICE_WORK':
                        itemPrice = findSpareTypeAmount(i, category?.service_policy?.price_type, warrantyEnabled)
                            || { list_price: 0, charged: 0, ledger_cost: 0, reason: null }
                        break;

                    case 'PRODUCT_RENTAL':
                        itemPrice = {
                            list_price: product?.rental?.renewal_charge,
                            charged: product?.rental?.renewal_charge,
                            ledger_cost: product?.rental?.renewal_charge,
                            reason: !product?.rental?.renewal_charge ? 'Zero free renewal charge' : null
                        }
                        break;

                    default:
                        break;
                }

                let obj = {
                    service_id: i?.work_uuid,
                    service_name: i?.work_name,
                    pricing: {
                        list_price: itemPrice?.list_price,
                        charged: itemPrice?.charged,
                        ledger_cost: itemPrice?.ledger_cost,
                    },
                    call_rate: i?.call_rate,
                    rent_renewal_included: i?.rent_renewal_included,
                    refill_included: i?.refill_included,
                    reinstallation_included: i?.reinstallation_included,
                    selected: inForm ? true : false,
                    under_warranty: warrantyEnabled,
                    non_receivable_reason: (!itemPrice?.charged && warrantyEnabled) ? 'Product warranty override' : itemPrice?.reason,
                }

                return obj
            }))

            setComponentsPage({ title: 'Service Works', id: 'services', max: 0, deleteItem: false })
        }

        // eslint-disable-next-line
    }, [workMenu, productInForm])

    return (
        <div className="tech-service-form-subpage">
            {/* Title */}
            <div className="title-section">
                <h3>AD : {serviceFormAddOnSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
                <p>{serviceFormAddOnSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
            </div>

            {/* Service Categories */}
            {(!productInForm?.service_data?.category_id || !productInForm?.service_data?.mode) &&
                <AdServiceCategories categories={categories} product={product} regData={regData} changeSubmitStatus={changeSubmitStatus} />
            }

            {(productInForm?.service_data?.category_id && productInForm?.service_data?.mode) &&
                <>{workMenu?.type
                    ? <>
                        {workMenu?.type === 'components' &&
                            <VfComponentsList setWorkMenu={setWorkMenu} componentsList={componentsList} componentsPage={componentsPage}
                                productInForm={productInForm} changeSubmitStatus={changeSubmitStatus} />}
                        {workMenu?.type === 'services' &&
                            <AdServiceList setWorkMenu={setWorkMenu} componentsPage={componentsPage} servicesList={servicesList}
                                productInForm={productInForm} changeSubmitStatus={changeSubmitStatus} />}
                    </>
                    : <AdServiceWorkHome category={category} setWorkMenu={setWorkMenu} product={product} changeSubmitStatus={changeSubmitStatus} />}
                </>
            }

        </div>
    )
}

export default SfAdSubPageTwo