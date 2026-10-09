import React, { useMemo } from 'react'
import './service-categories.scss'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions, sfSetting } from '../../../../../redux/features/persisted/applicationSlice'
import { TbPlayerSkipForwardFilled } from 'react-icons/tb'
import { setupAvailableServiceCategories } from '../../../../../utils/services/product_service'
import { calculateTaxAmount, toDecimal } from '../../../../../utils/helpers/math-equations'


const ServiceCategories = () => {
    const dispatch = useDispatch();
    const { serviceForm, formResources, serviceFormSettings } = useSelector((state) => state.application)

    const serviceCategories = useMemo(() => {

        const productId = serviceFormSettings?.activeProduct?.[0]

        const product = formResources?.products?.find(p => p?.product_id === productId)
        const packageId = product?.package?.package_id || null

        const serviceEligibility = formResources?.eligibility?.find(e => e?.productId === productId)?.services || []
        let categories = []

        if (packageId) {
            categories = formResources?.service_categories?.filter(c => c?.package_id === packageId)
        } else {
            categories = formResources?.service_categories?.filter(c => c?.product_type === serviceFormSettings?.activeProduct?.[1] && !c?.package_id)
        }

        const stretcher = setupAvailableServiceCategories(categories, serviceEligibility)

        return stretcher;

    }, [formResources, serviceForm?.service_products, serviceFormSettings?.service_categories])


    const skipPage = () => {
        const activePage = serviceFormSettings?.activePage || null

        dispatch(sfSetting.page.next(Number(activePage) + 1))
    }

    const selectCategory = (category) => {
        if (category?.is_disable) {
            return;
        }

        const repeatWork = formResources?.repeat_works?.find(r => r?.product_id === serviceFormSettings?.activeProduct?.[0]) || null

        const updateData = {
            service_data: {
                package_id: category?.package_id || null,
                service_id: category?.service_id || null,
                category_id: category?.category_id,
                mode: category?.mode,
                repeat: {
                    system_say: repeatWork ? true : false,
                    tech_say: repeatWork ? true : false,
                    comment: null
                }
            }
        }

        // service charge
        if (category?.service_charges?.length) {
            updateData.service_data.service_charge = {
                charge_index: 0,
                estimate: category?.service_charges?.[0]?.charge_amount || 0,
                applied: category?.service_charge_applied ? category?.service_charges?.[0]?.charge_amount : 0,
                call: category?.service_charges?.[0]?.call_count || 0,
                remark: null
            }
        }

        // Renewal
        if (category?.mode === 'RENEWAL') {
            let baseRate = 0, tax = 0, totalRate = 0;

            // this can renewal apply without any package charge
            baseRate = category?.target_package?.pricing_config?.base_price || 0;
            const taxRate = category?.target_package?.pricing_config?.gst?.rate || 0
            const taxType = category?.target_package?.pricing_config?.gst?.type || null
            tax = taxRate ? calculateTaxAmount(baseRate, taxRate, taxType) : 0
            totalRate = toDecimal(baseRate + (tax?.total_tax || 0), { precision: 2 })

            updateData.service_data.renewed_package = {
                is_renewed: true,
                package_id: category?.target_package?.package_id,
                package_name: category?.target_package?.name,
                price: {
                    base_rate: baseRate,
                    tax: tax?.total_tax,
                    total_rate: totalRate
                }
            }
        }

        dispatch(sfSetting.productSubmit.resetStatus());
        dispatch(sfActions.updateProduct.innerFields(updateData))
    }

    return (
        <div className="sf-sub-service-categories">
            {/* Skip */}
            <div className="category-border" onClick={skipPage}>
                <div className="icon">
                    <TbPlayerSkipForwardFilled />
                </div>
                <div className="content">
                    <h3>Skip actions</h3>
                    <p>Checkup details will be saved, but no service work or charges will be applied.</p>
                </div>
            </div>

            {/* Categories */}
            {serviceCategories?.map((c, index) => {
                return <div className={`category-border ${c?.is_disable ? 'disable-category' : ''}`} key={c?.service_name + index}
                    onClick={() => selectCategory(c)}>
                    <div className="icon">
                        {c?.icon}
                    </div>
                    <div className="content">
                        <h3>{c?.service_name}</h3>
                        {c?.is_disable ? <p>{c?.disable_reason}</p> : ''}
                    </div>
                </div>
            })}
        </div>
    )
}

export default ServiceCategories