import React, { useEffect, useMemo, useState } from 'react'
import './sub-page-style.scss'
import { useDispatch, useSelector } from 'react-redux'
import { serviceFormSubPageRoute } from '../../../../assets/javascript/pre_data/service'
import Select from '../../../UI_Primitives/inputs/Select'
import Radio from '../../../UI_Primitives/inputs/Radio'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import Button from '../../../UI_Primitives/buttons/Button'
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect'
import { toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { TbTrash } from 'react-icons/tb'
import VfServiceCategories from '../service-form-components/VfServiceCategories'


const SfSubPageThree = ({ page, categories, customerProducts, regData }) => {
  const dispatch = useDispatch();
  const { serviceFormSettings, serviceForm } = useSelector((state) => state.application)
  const orderId = serviceFormSettings?.activeProduct?.[1] || null
  const [natures, setNatures] = useState([])
  const [reasons, setReasons] = useState([])
  const [solutions, setSolutions] = useState([])
  const [form, setForm] = useState({ nature: null, reasons: [], solutions: [] })

  const productInForm = useMemo(() => {
    const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
    return current || {}
  }, [serviceForm?.service_products]);

  const product = useMemo(() => {
    if (!customerProducts || !serviceFormSettings?.activeProduct?.[0]) return null;

    return customerProducts.find(
      p => p.product_id === serviceFormSettings?.activeProduct?.[0]
    ) || null;
  }, [customerProducts, serviceFormSettings?.activeProduct?.[0]]);



  return (
    <div className="tech-service-form-subpage sf-subpage-three">
      {/* Title */}
      <div className="title-section">
        <h3>{orderId ? `${orderId} : ` : ''}{serviceFormSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
        <p>{serviceFormSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
      </div>

      {/* Service Categories */}
      {(!productInForm?.service_data?.category_id || !productInForm?.service_data?.mode) &&
        <VfServiceCategories categories={categories} product={product} />}


      {/* {(productInForm?.service_data?.category_id && productInForm?.service_data?.mode) && <VfServiceCategories />} */}

    </div>
  )
}

export default SfSubPageThree