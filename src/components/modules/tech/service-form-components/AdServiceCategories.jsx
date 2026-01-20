import React, { useEffect, useState } from 'react'
import './vf-service-categories.scss'
import { useDispatch } from 'react-redux';
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice';
import { TbPlayerSkipForwardFilled } from 'react-icons/tb';
import { setupAddOnServiceCategories } from '../../../../utils/services/product_service';
import { normalizeDate } from '../../../../utils/helpers/date-helpers';

const AdServiceCategories = ({ categories, product, regData, changeSubmitStatus }) => {
    const dispatch = useDispatch();
    const [serviceCategories, setServiceCategories] = useState([])

    const skipPage = () => {
        dispatch(sfSetting.setActiveSubPage(202))
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

        const isWarrantyProduct = product?.product?.wr_expire_date &&
            normalizeDate(new Date(product?.product?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false

        // service charge
        if (category?.service_charges?.length) {
            updateData.service_data.service_charge = {
                estimate: category?.service_charges?.[0]?.charge_amount || 0,
                applied: isWarrantyProduct ? 0 : category?.service_charges?.[0]?.charge_amount,
                call: category?.service_charges?.[0]?.call_count || 0,
                remark: null
            }
        }

        changeSubmitStatus(false)

        dispatch(sfActions.updateProduct(updateData))
    }

    useEffect(() => {
        let list = []

        list = setupAddOnServiceCategories(categories, regData)

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
                    <p>No add-ons action required. Add-Ons details will not be included in the bill.</p>
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

export default AdServiceCategories