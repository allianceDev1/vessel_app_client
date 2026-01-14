import React, { useEffect, useMemo, useState } from 'react'
import InputText from '../../../UI_Primitives/inputs/InputText'
import './vf-service-work-home.scss'
import Select from '../../../UI_Primitives/inputs/Select'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import Button from '../../../UI_Primitives/buttons/Button'

const VfServiceWorkHome = ({ category, setWorkMenu }) => {
  const dispatch = useDispatch();
  const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)
  const [form, setForm] = useState({ estimate: 0, applied: 0, call: 0, remark: null })
  const [menuMeta, setMenuMeta] = useState()

  const productInForm = useMemo(() => {
    const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]

    setForm({
      estimate: current?.service_data?.service_charge?.estimate,
      applied: current?.service_data?.service_charge?.applied,
      call: current?.service_data?.service_charge?.call,
      remark: current?.service_data?.service_charge?.remark
    })

    setMenuMeta({
      materials: current?.work?.components_list?.filter(s => s.spare_type === 'materials')?.length,
      bags: current?.work?.components_list?.filter(s => s.spare_type === 'bags')?.length,
      spares: current?.work?.components_list?.filter(s => s.spare_type === 'spares')?.length,
      services: 0
    })

    return current || {}
  }, [serviceForm?.service_products]);



  const handelChange = (e) => {

    if (e.target.name === 'service_charge') {
      const chargeDetail = category?.service_charges?.filter(c => c.charge_amount === Number(e.target.value))?.[0]
      setForm({
        estimate: chargeDetail?.charge_amount || 0,
        applied: category?.service_charge_applied ? chargeDetail?.charge_amount : 0,
        call: chargeDetail?.call_count || 0,
        remark: ''
      })

      return;
    }

    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const updateData = {
      service_data: {
        service_charge: {
          ...(productInForm?.service_data?.service_charge || {}),
          estimate: form?.estimate || 0,
          applied: form?.applied || 0,
          call: form?.call || 0,
          remark: form?.remark || ''
        }
      }
    }

    dispatch(sfActions.updateProduct(updateData))

    // Next
    dispatch(sfSetting.setActiveSubPage(203))
  }

  const clickComponentsMenu = (id) => {
    setWorkMenu({ type: 'components', id })
  }

  const clickServicesMenu = () => {
    setWorkMenu({ type: 'services' })
  }





  return (
    <div className="sf-sub-vf-service-work-home">

      <div className="menus">
        <div className={`menu-item ${menuMeta?.materials ? 'item-selected' : ''} ${!category?.spare_policies?.materials?.access ? 'item-disable' : ''}`}
          onClick={() => category?.spare_policies?.materials?.access ? clickComponentsMenu('materials') : null}>
          <h3>Materials</h3>
          <p>{menuMeta?.materials ? `${menuMeta?.materials} items selected` : !category?.spare_policies?.materials?.access ? "No access" : "Choose component items"}</p>
        </div>

        <div className={`menu-item ${menuMeta?.bags ? 'item-selected' : ''} ${!category?.spare_policies?.bag?.access ? 'item-disable' : ''}`}
          onClick={() => category?.spare_policies?.bag?.access ? clickComponentsMenu('bags') : null}>
          <h3>Bags</h3>
          <p>{menuMeta?.bags ? `${menuMeta?.bags} items selected` : !category?.spare_policies?.bag?.access ? "No access" : "Choose component items"}</p>
        </div>

        <div className={`menu-item ${menuMeta?.spares ? 'item-selected' : ''} ${!category?.spare_policies?.primary_spare?.access ? 'item-disable' : ''}`}
          onClick={() => category?.spare_policies?.primary_spare?.access ? clickComponentsMenu('spares') : null}>
          <h3>Spares</h3>
          <p>{menuMeta?.spares ? `${menuMeta?.spares} items selected` : !category?.spare_policies?.primary_spare?.access ? "No access" : "Choose component items"}</p>
        </div>

        <div className={`menu-item `} onClick={clickServicesMenu} >
          <h3>Services</h3>
          <p>Choose service items</p>
        </div>

      </div>


      <form action="" onSubmit={handleSubmit}>
        {/* Service charge */}
        <h4>Service Charge</h4>
        <Select label={'Service Charge'} name={'service_charge'} value={form?.estimate}
          options={[{}, ...category?.service_charges?.map(s => ({ label: s?.charge_amount, value: s?.charge_amount }))]}
          onChange={handelChange} required />

        {category?.service_charges?.[0]?.charge_amount !== form?.estimate &&
          <InputText label={'Extra Charge Reason'} name={'remark'} value={form?.remark} onChange={handelChange} required />}

        <div className="buttons">
          <Button label={'Reset Work'} rounded severity={'danger'} />
          <Button label={'Next'} rounded />
        </div>
      </form>
    </div>
  )
}

export default VfServiceWorkHome