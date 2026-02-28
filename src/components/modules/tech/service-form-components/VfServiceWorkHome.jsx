import React, { useMemo, useState } from 'react'
import './vf-service-work-home.scss'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Select from '../../../UI_Primitives/inputs/Select'
import Button from '../../../UI_Primitives/buttons/Button'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import { doDialog } from '../../../../redux/features/non_persisted/miniSystemSlice'

const VfServiceWorkHome = ({ category, setWorkMenu, changeSubmitStatus }) => {
  const dispatch = useDispatch();
  const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)
  const [menuMeta, setMenuMeta] = useState({ renewal_spares: 0, package_spares: 0, additional_spares: 0, renewal_services: 0, package_services: 0, additional_services: 0 })

  const productInForm = useMemo(() => {
    const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]

    setMenuMeta({
      renewal_spares: current?.work?.components_list?.filter(s => s.spare_type === 'RENEWAL_SPARE')?.length,
      package_spares: current?.work?.components_list?.filter(s => s.spare_type === 'PACKAGE_SPARE')?.length,
      additional_spares: current?.work?.components_list?.filter(s => s.spare_type === 'ADDITIONAL_SPARE')?.length,
      renewal_services: current?.work?.services_list?.filter(s => s.service_type === 'RENEWAL_SERVICE')?.length,
      package_services: current?.work?.services_list?.filter(s => s.service_type === 'PACKAGE_SERVICE')?.length,
      additional_services: current?.work?.services_list?.filter(s => s.service_type === 'ADDITIONAL_SERVICE')?.length
    })

    return current || {}

    // eslint-disable-next-line
  }, [serviceForm?.service_products]);


  const handelChangeServiceCharge = (e) => {
    changeSubmitStatus(false)
    if (e.target.name === 'service_charge') {
      dispatch(sfActions.updateProduct({
        service_data: {
          service_charge: {
            estimate: Number(e.target.value),
            remark: ""
          }
        }
      }))

      return;
    }

    dispatch(sfActions.updateProduct({
      service_data: {
        service_charge: {
          ...(productInForm?.service_data?.service_charge || {}),
          remark: e.target.value
        }
      }
    }))
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

    // If choose any work or components , then show the warming alert
    if (!menuMeta?.renewal_spares && !menuMeta?.package_spares && !menuMeta?.additional_spares && !menuMeta?.renewal_services && !menuMeta?.package_services && !menuMeta?.additional_services) {
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

  const clickWorkMenu = (type, id) => {
    setWorkMenu({ type, id: id || null })
  }


  return (
    <div className="sf-sub-vf-service-work-home">

      <div className="menus">
        {/* Renewal */}
        {category?.mode === 'RENEWAL' &&
          <div className="menu-section">
            <div className={`menu-item ${menuMeta?.renewal_spares ? 'item-selected' : ''}`}
              onClick={() => clickWorkMenu('RENEWAL_SPARE', "SPARE_SECTION")}>
              <h3>Package Renewal <br></br> Components</h3>
              <p>{menuMeta?.renewal_spares ? `${menuMeta?.renewal_spares} items selected` : "Choose component items"}</p>
            </div>

            <div className={`menu-item ${menuMeta?.renewal_services ? 'item-selected' : ''}`}
              onClick={() => clickWorkMenu('RENEWAL_SERVICE')}>
              <h3>Package Renewal <br></br> Services</h3>
              <p>{menuMeta?.renewal_services ? `${menuMeta?.renewal_services} items selected` : "Choose service works"}</p>
            </div>
          </div>}

        {/* Package */}
        {category?.package_id &&
          <div className="menu-section">
            <div className={`menu-item ${menuMeta?.package_spares ? 'item-selected' : ''}`}
              onClick={() => clickWorkMenu('PACKAGE_SPARE', "SPARE_SECTION")}>
              <h3>Service Package <br></br> Components</h3>
              <p>{menuMeta?.package_spares ? `${menuMeta?.package_spares} items selected` : "Choose component items"}</p>
            </div>

            <div className={`menu-item ${menuMeta?.package_services ? 'item-selected' : ''}`}
              onClick={() => clickWorkMenu('PACKAGE_SERVICE')}>
              <h3>Service Package <br></br> Services</h3>
              <p>{menuMeta?.package_services ? `${menuMeta?.package_services} items selected` : "Choose service works"}</p>
            </div>
          </div>}

        {/* Additional */}
        <div className="menu-section">
          <div className={`menu-item ${menuMeta?.additional_spares ? 'item-selected' : ''}`}
            onClick={() => clickWorkMenu('ADDITIONAL_SPARE', "SPARE_SECTION")}>
            <h3>Additional <br></br> Components</h3>
            <p>{menuMeta?.additional_spares ? `${menuMeta?.additional_spares} items selected` : "Choose component items"}</p>
          </div>

          <div className={`menu-item ${menuMeta?.additional_services ? 'item-selected' : ''}`}
            onClick={() => clickWorkMenu('ADDITIONAL_SERVICE')}>
            <h3>Additional <br></br> Services</h3>
            <p>{menuMeta?.additional_services ? `${menuMeta?.additional_services} items selected` : "Choose service works"}</p>
          </div>
        </div>

      </div>


      <form action="" onSubmit={handleSubmit}>
        {/* Service charge */}
        <h4>Service Charge</h4>
        <Select label={'Service Charge'} name={'service_charge'} value={productInForm?.service_data?.service_charge?.estimate}
          options={[{}, ...category?.service_charges?.map(s => ({ label: s?.charge_amount, value: s?.charge_amount }))]}
          onChange={handelChangeServiceCharge} required />

        {category?.service_charges?.[0]?.charge_amount !== productInForm?.service_data?.service_charge?.estimate &&
          <InputText label={'Extra Charge Reason'} name={'remark'} value={productInForm?.service_data?.service_charge?.remark}
            onChange={handelChangeServiceCharge} required />}

        <div className="buttons">
          <Button type='button' label={'Reset Work'} rounded severity={'danger'} onClick={resetWorkCategory} />
          <Button label={'Next'} rounded />
        </div>
      </form>
    </div>
  )
}

export default VfServiceWorkHome