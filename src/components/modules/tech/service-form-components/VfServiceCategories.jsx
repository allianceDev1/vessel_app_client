import React, { useEffect, useMemo, useState } from 'react'
import './vf-service-categories.scss'
import { useDispatch, useSelector } from 'react-redux'
import { serviceFormSubPageRoute } from '../../../../assets/javascript/pre_data/service'
import Select from '../../../UI_Primitives/inputs/Select'
import Radio from '../../../UI_Primitives/inputs/Radio'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import Button from '../../../UI_Primitives/buttons/Button'
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect'
import { toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { TbPlayerSkipForwardFilled, TbTrash } from 'react-icons/tb'
import { setupAvailableServiceCategories } from '../../../../utils/services/product_service'



const VfServiceCategories = ({ categories, product }) => {
    const dispatch = useDispatch();
    const { serviceFormSettings, serviceForm } = useSelector((state) => state.application)
    const orderId = serviceFormSettings?.activeProduct?.[1] || null
    const [natures, setNatures] = useState([])
    const [reasons, setReasons] = useState([])
    const [solutions, setSolutions] = useState([])
    const [form, setForm] = useState({ nature: null, reasons: [], solutions: [] })
    const [serviceCategories, setServiceCategories] = useState([])


    useEffect(() => {
        let list = []
        
        const packageId = product?.package?.package_id || null

        if (packageId) {
            list = categories?.filter(c => c?.package_id === packageId)?.sort((a, b) => a.mode - b.mode)
        } else {
            list = categories?.filter(c => !c?.package_id)?.sort((a, b) => a.mode - b.mode)
        }
        console.log(product,'a')
        list = setupAvailableServiceCategories(list, product)
      
        setServiceCategories(list)

    }, [product])

    return (
        <div className="sf-sub-vf-service-categories">
            <div className="category-border">
                <div className="icon">
                    <TbPlayerSkipForwardFilled />
                </div>
                <div className="content">
                    <h3>Skip Actions</h3>
                    <p>No vessel action required. Vessel details will not be included in the bill.</p>
                </div>
            </div>
            {serviceCategories?.map((c, index) => {
                return <div className={`category-border ${c?.is_disable ? 'disable-category' : ''}`} key={c?.service_name + index}>
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