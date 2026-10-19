import { useMemo } from 'react'
import './work-home.scss'
import InputText from '../../../../UI_Primitives/inputs/InputText'
import Select from '../../../../UI_Primitives/inputs/Select'
import Button from '../../../../UI_Primitives/buttons/Button'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions, sfSetting } from '../../../../../redux/features/persisted/applicationSlice'
import { doDialog } from '../../../../../redux/features/non_persisted/miniSystemSlice'
import Message from '../../../../UI_Primitives/message/Message'
import { TbComponents, TbTools, TbPlus } from 'react-icons/tb'
import SelectedWorkSummary from './SelectedWorkSummary'
import RadioCard from '../../../../UI_Primitives/inputs/RadioCard'

const WorkHome = ({ setWorkMenu }) => {
  const dispatch = useDispatch()
  const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)

  const productInForm = useMemo(() => {
    const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]

    return current || {}
    // eslint-disable-next-line
  }, [serviceForm?.service_products])

  const workAccess = useMemo(() => {

    let targetSpare = false, targetService = false;
    let currentSpare = false, currentService = false;

    if (productInForm?.service_category) {
      if (productInForm?.service_category?.coverage?.find((f) => f?.coverage_id === 'SPARE_PARTS' && f?.position === 'TARGET')?.access) {
        targetSpare = true
      }
      if (productInForm?.service_category?.coverage?.find((f) => f?.coverage_id === 'SERVICE_WORK' && f?.position === 'TARGET')?.access) {
        targetService = true;
      }
      if (productInForm?.service_category?.coverage?.find((f) => f?.coverage_id === 'SPARE_PARTS' && f?.position === 'CURRENT')?.access) {
        currentSpare = true
      }
      if (productInForm?.service_category?.coverage?.find((f) => f?.coverage_id === 'SERVICE_WORK' && f?.position === 'CURRENT')?.access) {
        currentService = true
      }
    }

    return {
      targetSpare, targetService, currentSpare, currentService
    }


  }, [productInForm?.service_category])

  const handelChangeServiceCharge = (e) => {

    dispatch(sfSetting.productSubmit.resetStatus())

    if (e.target.name === 'service_charge') {

      const chargeIndex = productInForm?.service_category?.service_charges?.findIndex(c => Number(c?.charge_amount) === Number(e.target.value))

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
      dispatch(sfSetting.productSubmit.resetStatus());
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
    e.preventDefault();

    const componentsLength = productInForm?.work?.components_list?.length || 0
    const workLength = productInForm?.work?.services_list?.length || 0

    // If choose any work or components , then show the warming alert
    const nextPageNumber = serviceFormSettings?.activePage + 1

    if (!componentsLength && !workLength) {
      dispatch(
        doDialog.confirm({
          message: 'You have not selected any work or spares, Are you sure to continue without work or spare?',
          accept: {
            onClick: () => {
              dispatch(sfSetting.page.next(nextPageNumber))
            }
          }
        })
      )
      return
    }

    dispatch(sfSetting.page.next(nextPageNumber))
  }

  const clickWorkMenu = (type) => {
    setWorkMenu(type)
  }

  return (
    <div className="sf-sub-service-work-home">

      {!workAccess?.currentSpare && !workAccess?.currentService && !workAccess?.targetSpare && !workAccess?.targetService &&
        <Message head={'Access Restricted'}
          message={'Spare changes and additional service work are disabled for this service category. The applicable service charge will still be applied. To add spares or select additional service work, you must change to a service category that allows these options.'}
          type='warning' iconDisable
        />}

      {/* Mobile Choosing Buttons */}
      <div className="choosing-menus-wrapper">

        {/* Renewal Section */}
        <div className="choosing-buttons-grid" style={{ gridTemplateColumns: (!workAccess?.targetSpare || !workAccess?.targetService) ? '1fr' : '1fr 1fr' }}>
          {productInForm?.service_category?.mode === 'RENEWAL' && (
            <>
              {workAccess?.targetSpare && (
                <button
                  type="button"
                  className="mobile-choose-btn"
                  onClick={() => clickWorkMenu('RENEWAL_SPARE')}
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
              {workAccess?.targetService && (
                <button
                  type="button"
                  className="mobile-choose-btn"
                  onClick={() => clickWorkMenu('RENEWAL_SERVICE')}
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
                </button>)}
            </>
          )}
        </div>

        {/* Package Section */}
        <div className="choosing-buttons-grid" style={{ gridTemplateColumns: (!workAccess?.currentSpare || !workAccess?.currentService) ? '1fr' : '1fr 1fr' }}>
          {productInForm?.service_category?.package_id && (
            <>
              {workAccess?.currentSpare && (<button
                type="button"
                className="mobile-choose-btn"
                onClick={() => clickWorkMenu('PACKAGE_SPARE')}
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
              </button>)}

              {workAccess?.currentService && <button
                type="button"
                className="mobile-choose-btn"
                onClick={() => clickWorkMenu('PACKAGE_SERVICE')}
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
              </button>}
            </>
          )}
        </div>

        {/* Additional Section */}
        <div className="choosing-buttons-grid" style={{ gridTemplateColumns: (!workAccess?.currentSpare || !workAccess?.currentService) ? '1fr' : '1fr 1fr' }}>
          {workAccess?.currentSpare && <button
            type="button"
            className="mobile-choose-btn"
            onClick={() => clickWorkMenu('ADDITIONAL_SPARE')}
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
          </button>}

          {workAccess?.currentService && <button
            type="button"
            className="mobile-choose-btn"
            onClick={() => clickWorkMenu('ADDITIONAL_SERVICE')}
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
          </button>}
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
              ...(productInForm?.service_category?.service_charges?.map((s) => ({
                label: s?.charge_amount,
                value: s?.charge_amount
              })) || [])
            ]}
            onChange={handelChangeServiceCharge}
            required
          />

          {productInForm?.service_data?.service_charge?.charge_index !==
            productInForm?.service_data?.service_charge?.start_index && (
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
        {productInForm?.service_data?.repeat?.system_say && (
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