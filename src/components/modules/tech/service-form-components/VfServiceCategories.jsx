import React, { useEffect, useState } from 'react'
import './vf-service-categories.scss'
import { useDispatch } from 'react-redux'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import { TbPlayerSkipForwardFilled } from 'react-icons/tb'
import { setupAvailableServiceCategories } from '../../../../utils/services/product_service'
import { calculateTaxAmount, toDecimal } from '../../../../utils/helpers/math-equations'



const VfServiceCategories = ({ categories, product, productEligibility, regData, changeSubmitStatus }) => {
    const dispatch = useDispatch();
    const [serviceCategories, setServiceCategories] = useState([])

    const skipPage = () => {
        dispatch(sfSetting.setActiveSubPage(203))
    }

    const selectCategory = (category) => {
        if (category?.is_disable) {
            return;
        }

        const updateData = {
            service_data: {
                service_id: category?.service_id || null,
                category_id: category?.category_id,
                mode: category?.mode
            }
        }

        // service charge
        if (category?.service_charges?.length) {
            updateData.service_data.service_charge = {
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
            if (category?.package_charge_applied) {
                baseRate = category?.target_package?.pricing_config?.base_price;
                const taxRate = category?.target_package?.pricing_config?.gst?.rate || 0
                const taxType = category?.target_package?.pricing_config?.gst?.type || null
                tax = taxRate ? calculateTaxAmount(baseRate, taxRate, taxType) : 0
                totalRate = toDecimal(baseRate + (tax?.total_tax || 0), { precision: 2 })
            }

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

            // The package fund_distribution not handled, currently not allow th distribution. 
        }

        changeSubmitStatus(false)

        dispatch(sfActions.updateProduct(updateData))
    }

    useEffect(() => {
        let list = []

        const packageId = product?.package?.package_id || null

        if (packageId) {
            list = categories?.filter(c => c?.package_id === packageId)?.sort((a, b) => a.mode - b.mode)
        } else {
            list = categories?.filter(c => !c?.package_id)?.sort((a, b) => a.mode - b.mode)
        }

        list = setupAvailableServiceCategories(list, product, productEligibility, regData)

        setServiceCategories(list)
        // eslint-disable-next-line
    }, [product])

    return (
        <div className="sf-sub-vf-service-categories">
            <div className="category-border" onClick={skipPage}>
                <div className="icon">
                    <TbPlayerSkipForwardFilled />
                </div>
                <div className="content">
                    <h3>Skip Actions</h3>
                    <p>No vessel action required. Vessel details will not be included in the bill.</p>
                </div>
            </div>
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

export default VfServiceCategories