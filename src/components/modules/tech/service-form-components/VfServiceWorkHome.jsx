import React, { useMemo, useState } from 'react'
import './vf-service-work-home.scss'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Select from '../../../UI_Primitives/inputs/Select'
import Button from '../../../UI_Primitives/buttons/Button'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import { doDialog } from '../../../../redux/features/non_persisted/miniSystemSlice'

const VfServiceWorkHome = ({ category, setWorkMenu }) => {
  const dispatch = useDispatch();
  const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)
  const [form, setForm] = useState({ estimate: 0, applied: 0, call: 0, remark: null })
  const [menuMeta, setMenuMeta] = useState({ materials: 0, bags: 0, spares: 0, services: 0 })

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
      services: current?.work?.services_list?.length
    })

    return current || {}

    // eslint-disable-next-line
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

  const resetWorkCategory = () => {

    const resetAction = () => {
      dispatch(sfActions.resetService({ product_id: serviceFormSettings?.activeProduct?.[0] }))
    }

    dispatch(doDialog.confirm({
      message: 'Are you sure to reset work category?',
      accept: { onClick: () => resetAction() }
    }))
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

    // If choose any work or components , then show the warming alert
    if (!menuMeta?.materials && !menuMeta?.bags && !menuMeta?.spares && !menuMeta?.services) {
      dispatch(doDialog.confirm({
        message: 'You have not selected any work or components, Are you sure to continue without work or components?',
        accept: {
          onClick: () => {
            dispatch(sfSetting.setActiveSubPage(203))
          }
        }
      }))

      return;
    }

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

        <div className={`menu-item ${menuMeta?.services ? 'item-selected' : ''} ${!category?.service_policy?.access ? 'item-disable' : ''}`}
          onClick={() => category?.service_policy?.access ? clickServicesMenu() : null} >
          <h3>Services</h3>
          <p>{menuMeta?.services ? `${menuMeta?.services} items selected` : !category?.service_policy?.access ? "No access" : "Choose service works"}</p>
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
          <Button type='button' label={'Reset Work'} rounded severity={'danger'} onClick={resetWorkCategory} />
          <Button label={'Next'} rounded />
        </div>
      </form>
    </div>
  )
}

export default VfServiceWorkHome