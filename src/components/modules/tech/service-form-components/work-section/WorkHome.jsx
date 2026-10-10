import React, { useMemo } from 'react'
import './work-home.scss'
import InputText from '../../../../UI_Primitives/inputs/InputText'
import Select from '../../../../UI_Primitives/inputs/Select'
import Button from '../../../../UI_Primitives/buttons/Button'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions, sfSetting } from '../../../../../redux/features/persisted/applicationSlice'
import { doDialog, toast } from '../../../../../redux/features/non_persisted/miniSystemSlice'
import Message from '../../../../UI_Primitives/message/Message'
import { TbComponents, TbTools, TbPlus } from 'react-icons/tb'
import SelectedWorkSummary from './SelectedWorkSummary'
import RadioCard from '../../../../UI_Primitives/inputs/RadioCard'

const WorkHome = ({ setWorkMenu }) => {
  const dispatch = useDispatch()
  const { serviceForm, formResources, serviceFormSettings } = useSelector((state) => state.application)

  const productInForm = useMemo(() => {
    const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]

    return current || {}
    // eslint-disable-next-line
  }, [serviceForm?.service_products])

  const serviceCategory = useMemo(() => {
    const category = formResources?.service_categories?.find(
      (c) =>
        c?.category_id === productInForm?.service_data?.category_id &&
        (!productInForm?.service_data?.package_id || c?.package_id === productInForm?.service_data?.package_id)
    )

    return category
  }, [formResources?.service_categories, productInForm?.service_data])

  const handelChangeServiceCharge = (e) => {

    dispatch(sfSetting.productSubmit.resetStatus())

    if (e.target.name === 'service_charge') {

      const chargeIndex = serviceCategory?.service_charges?.findIndex(c => Number(c?.charge_amount) === Number(e.target.value))

      if (productInForm?.service_data?.service_charge?.start_index > chargeIndex) {
        return;
      }

      dispatch(
        sfActions.updateProduct.innerFields({
          service_data: {
            service_charge: {
              charge_index: chargeIndex,
              start_index: productInForm?.service_data?.service_charge?.start_index,
              estimate: Number(e.target.value),
              remark: ''
            }
          }
        })
      )
      return
    }

    dispatch(
      sfActions.updateProduct.innerFields({
        service_data: {
          service_charge: {
            ...(productInForm?.service_data?.service_charge || {}),
            remark: e.target.value
          }
        }
      })
    )
  }

  const resetWorkCategory = () => {
    const resetAction = () => {
      dispatch(sfActions.resetService())
      dispatch(sfSetting.productSubmit.resetStatus())
    }

    dispatch(
      doDialog.confirm({
        message: 'Are you sure to reset work category?',
        accept: { onClick: () => resetAction() }
      })
    )
  }

  const handleChangeRepeat = (e) => {
    const { name, value } = e.target

    dispatch(sfSetting.productSubmit.resetStatus())

    if (name === 'repeat_status') {
      dispatch(
        sfActions.updateProduct.innerFields({
          service_data: {
            repeat: {
              ...(productInForm?.service_data?.repeat || {}),
              tech_say: value === 'Yes',
              comment: ''
            }
          }
        })
      )
      return
    }

    if (name === 'repeat_comment') {
      dispatch(
        sfActions.updateProduct.innerFields({
          service_data: {
            repeat: {
              ...(productInForm?.service_data?.repeat || {}),
              comment: e.target.value || ''
            }
          }
        })
      )
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // // if renewal not select any fund distribution items : error
    // if (serviceCategory?.mode === 'RENEWAL') {
    //   if (!menuMeta?.renewal_spares && !menuMeta?.renewal_services) {
    //     const FdInSpare = serviceCategory?.target_package?.pricing_config?.fund_distribution?.find(
    //       (f) => f?.fund_type === 'SPARE_PARTS'
    //     )
    //     const FdInWork = serviceCategory?.target_package?.pricing_config?.fund_distribution?.find(
    //       (f) => f?.fund_type === 'SERVICE_WORK'
    //     )

    //     if (FdInSpare && !menuMeta?.package_spares) {
    //       dispatch(
    //         toast.push({
    //           type: 'danger',
    //           message: 'You have not selected any renewal components'
    //         })
    //       )
    //       return
    //     }

    //     if (FdInWork && !menuMeta?.package_services) {
    //       dispatch(
    //         toast.push({
    //           type: 'danger',
    //           message: 'You have not selected any renewal services'
    //         })
    //       )
    //       return
    //     }
    //   }
    // }

    // // If choose any work or components , then show the warming alert
    // if ('') {
    //   dispatch(
    //     doDialog.confirm({
    //       message: 'You have not selected any work or components, Are you sure to continue without work or components?',
    //       accept: {
    //         onClick: () => {
    //           dispatch(sfSetting.setActiveSubPage(203))
    //         }
    //       }
    //     })
    //   )
    //   return
    // }

    // dispatch(sfSetting.setActiveSubPage(203))
  }

  const clickWorkMenu = (type) => {
    setWorkMenu(type)
  }

  return (
    <div className="sf-sub-service-work-home">
      {/* Mobile Choosing Buttons */}
      <div className="choosing-menus-wrapper">
        <div className="choosing-buttons-grid">
          {/* Renewal Section */}
          {serviceCategory?.mode === 'RENEWAL' && (
            <>
              {serviceCategory?.target_package?.pricing_config?.fund_distribution?.find(
                (f) => f?.fund_type === 'SPARE_PARTS'
              ) && (
                  <button
                    type="button"
                    className="mobile-choose-btn"
                    onClick={() => clickWorkMenu('RENEWAL_SPARE_PARTS')}
                  >
                    <div className="btn-icon spares">
                      <TbComponents />
                    </div>
                    <div className="btn-content">
                      <span className="btn-tag tag-renewal">Renewal</span>
                      <span className="btn-title">Spares</span>
                    </div>
                    <div className="btn-action-icon">
                      <TbPlus />
                    </div>
                  </button>
                )}

              {serviceCategory?.target_package?.pricing_config?.fund_distribution?.find(
                (f) => f?.fund_type === 'SERVICE_WORK'
              ) && (
                  <button
                    type="button"
                    className="mobile-choose-btn"
                    onClick={() => clickWorkMenu('RENEWAL_SERVICE_WORKS')}
                  >
                    <div className="btn-icon works">
                      <TbTools />
                    </div>
                    <div className="btn-content">
                      <span className="btn-tag tag-renewal">Renewal</span>
                      <span className="btn-title">Services</span>
                    </div>
                    <div className="btn-action-icon">
                      <TbPlus />
                    </div>
                  </button>
                )}
            </>
          )}

          {/* Package Section */}
          {serviceCategory?.package_id && (
            <>
              <button
                type="button"
                className="mobile-choose-btn"
                onClick={() => clickWorkMenu('PACKAGE_SPARE_PARTS')}
              >
                <div className="btn-icon spares">
                  <TbComponents />
                </div>
                <div className="btn-content">
                  <span className="btn-tag tag-package">Package</span>
                  <span className="btn-title">Spares</span>
                </div>
                <div className="btn-action-icon">
                  <TbPlus />
                </div>
              </button>

              <button
                type="button"
                className="mobile-choose-btn"
                onClick={() => clickWorkMenu('PACKAGE_SERVICE_WORKS')}
              >
                <div className="btn-icon works">
                  <TbTools />
                </div>
                <div className="btn-content">
                  <span className="btn-tag tag-package">Package</span>
                  <span className="btn-title">Services</span>
                </div>
                <div className="btn-action-icon">
                  <TbPlus />
                </div>
              </button>
            </>
          )}

          {/* Additional Section */}
          <button
            type="button"
            className="mobile-choose-btn"
            onClick={() => clickWorkMenu('ADDITIONAL_SPARE_PARTS')}
          >
            <div className="btn-icon spares">
              <TbComponents />
            </div>
            <div className="btn-content">
              <span className="btn-tag tag-additional">Additional</span>
              <span className="btn-title">Spares</span>
            </div>
            <div className="btn-action-icon">
              <TbPlus />
            </div>
          </button>

          <button
            type="button"
            className="mobile-choose-btn"
            onClick={() => clickWorkMenu('ADDITIONAL_SERVICE_WORKS')}
          >
            <div className="btn-icon works">
              <TbTools />
            </div>
            <div className="btn-content">
              <span className="btn-tag tag-additional">Additional</span>
              <span className="btn-title">Services</span>
            </div>
            <div className="btn-action-icon">
              <TbPlus />
            </div>
          </button>
        </div>
      </div>

      {/* Selected Items Summary Card Component */}
      <SelectedWorkSummary productInForm={productInForm} />

      {/* Form Details */}
      <form action="" onSubmit={handleSubmit}>

        {/* Service charge */}
        {productInForm?.service_data?.service_charge_applied && <>
          <h4>Service charge</h4>
          <Select
            label={'Service Charge'}
            name={'service_charge'}
            value={productInForm?.service_data?.service_charge?.estimate}
            options={[
              {},
              ...(serviceCategory?.service_charges?.map((s) => ({
                label: s?.charge_amount,
                value: s?.charge_amount
              })) || [])
            ]}
            onChange={handelChangeServiceCharge}
            required
          />

          {serviceCategory?.service_charges?.[0]?.charge_amount !==
            productInForm?.service_data?.service_charge?.estimate && (
              <InputText
                label={'Extra Charge Reason'}
                name={'remark'}
                value={productInForm?.service_data?.service_charge?.remark}
                onChange={handelChangeServiceCharge}
                required
              />
            )}
        </>}

        {/* Repeat */}
        {serviceForm?.repeat?.system_say && (
          <>
            <h4 style={{ marginTop: '15px' }}>Repeat work</h4>
            <div className="form-section">
              <div className="box-col2">
                <RadioCard
                  label="Yes"
                  description="It is repeat work"
                  name="repeat_status"
                  id="ok"
                  radioValue="Yes"
                  onChange={handleChangeRepeat}
                  checked={productInForm?.service_data?.repeat?.tech_say}
                  required
                />
                <RadioCard
                  label="No"
                  description="Not repeat work"
                  name="repeat_status"
                  id="not_ok"
                  radioValue="No"
                  onChange={handleChangeRepeat}
                  checked={!productInForm?.service_data?.repeat?.tech_say}
                  required
                />
              </div>

              {!productInForm?.service_data?.repeat?.tech_say && (
                <InputText
                  label={'Comments'}
                  id={'comment'}
                  name={'repeat_comment'}
                  value={productInForm?.service_data?.repeat?.comment}
                  onChange={handleChangeRepeat}
                  required
                />
              )}

              {productInForm?.service_data?.repeat?.same_registration &&
                <Message type='info' iconDisable
                  head={'Repeat Service – Previous Bill Adjustment'}
                  message={'This repeat work is linked to the same service registration (Reg. No.). The service charge on the previous bill is set to ₹0, and the current service charge remains applicable.'}
                />
              }
            </div>

          </>
        )}

        <div className="buttons">
          <Button type="button" label={'Reset Work'} rounded severity={'danger'} onClick={resetWorkCategory} />
          <Button label={'Next'} severity={'secondary'} rounded />
        </div>
      </form>
    </div>
  )
}

export default WorkHome