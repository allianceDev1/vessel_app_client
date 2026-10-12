import React, { useMemo } from 'react'
import './service-list.scss'
import Button from '../../../../UI_Primitives/buttons/Button'
import { TbCheck, TbTools } from 'react-icons/tb'
import EmptyState from '../../../../UI_Primitives/ui-states/EmptyState'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions } from '../../../../../redux/features/persisted/applicationSlice'
import { findSpareTypeAmount } from '../../../../../utils/flows/service_form_utils'
import { toStandardText } from '../../../../../utils/helpers/text-formatting'

const ServiceList = ({ setWorkMenu, productInForm, workMenu, serviceCategory, product, }) => {
  const dispatch = useDispatch();
  const { formResources, serviceFormSettings } = useSelector((state) => state.application);


  const coverage = useMemo(() => {
    return serviceCategory?.coverage?.find(c => {
      if (workMenu === 'RENEWAL_SERVICE') {
        return c.coverage_id === 'SERVICE_WORK' && c.position === 'TARGET';
      } else {
        return c.coverage_id === 'SERVICE_WORK' && c.position === 'CURRENT';
      }
    }) || null;
  }, [serviceCategory, workMenu])


  const allServiceWorks = useMemo(() => {
    const activeProductType = serviceFormSettings?.activeProduct?.[1] || null

    if (!activeProductType) {
      return [];
    }

    let works = formResources?.service_work_list?.filter(s => s?.applicable_for.includes(activeProductType) && s?.work_uuid)
    works = works?.sort((a, b) => a.work_name.localeCompare(b.work_name))

    works = works?.map((work) => {

      const selectedItem = productInForm?.work?.services_list?.find(c => c?.work_uuid === work?.work_uuid);

      // For package coverage the additional_spare price_type default is SELLING_RATE
      const priceType = product?.package?.package_id && workMenu === 'ADDITIONAL_SERVICE' ? 'SELLING_RATE' : coverage?.price_type

      const priceObject = findSpareTypeAmount(
        (work?.pricing || {}),
        priceType || 'SELLING_RATE',
        product?.package?.package_id || null,
        false
      )

      return {
        work_uuid: work?.work_uuid,
        work_id: work?.work_id,
        work_name: work?.work_name,
        is_active: work?.is_active !== undefined ? work?.is_active : true,
        disabled: work?.disabled !== undefined ? work?.disabled : (work?.is_active === false),
        is_selected: selectedItem ? true : false,
        is_warranty_item: false,
        selection_context: workMenu,
        selection_info: {
          selected_context: selectedItem ? selectedItem?.selection_context : null,
          charged_amount: selectedItem?.pricing?.charged || 0,
        },
        pricing: priceObject
      }
    });

    return works;

  }, [serviceFormSettings, formResources, coverage, productInForm])

  const selectService = (item) => {

    const isExisted = productInForm?.work?.services_list?.find(s => s?.work_uuid === item?.work_uuid && s?.selection_context === workMenu)

    // if existed then remove form service list
    // if not existed then add to service list

    if (isExisted) {
      dispatch(sfActions.updateProduct.innerFields({
        work: {
          ...(productInForm?.work || {}),
          services_list: productInForm?.work?.services_list?.filter(s => !(s?.work_uuid === item?.work_uuid && s?.selection_context === workMenu))
        }
      }))
    } else {
      dispatch(sfActions.updateProduct.innerFields({
        work: {
          ...(productInForm?.work || {}),
          services_list: [
            ...(productInForm?.work?.services_list || []),
            {
              selection_context: item?.selection_context,
              work_uuid: item?.work_uuid,
              is_warranty_item: item?.is_warranty_item,
              pricing: item?.pricing
            }
          ]
        }
      }))
    }

    // Service charge enable / disable
    if (!productInForm?.work?.services_list?.length && !isExisted) {
      // disable
      dispatch(sfActions.updateProduct.innerFields({
        service_data: {
          ...(productInForm?.service_data || {}),
          service_charge_applied: false
        }
      }))
    } else if (productInForm?.work?.services_list?.length === 1 && isExisted) {
      // enable
      dispatch(sfActions.updateProduct.innerFields({
        service_data: {
          ...(productInForm?.service_data || {}),
          service_charge_applied: true
        }
      }))
    }

  }

  if (!coverage?.access) {
    return (
      <EmptyState
        size='sm'
        icon={<TbTools />}
        title='No access'
        hight='calc(100vh - 300px)'
        footer={<Button size='small' outlined label={'Close tab'} severity={'secondary'} rounded style={{ width: '150px' }} onClick={() => setWorkMenu('')} />}
      />
    )
  }

  return (
    <div className="service-list-comp-container">
      <div className="service-list-border">
        <div className="title">
          <h3>{toStandardText(workMenu + ' Works')}</h3>
        </div>

        {!allServiceWorks?.length &&
          <EmptyState
            size='sm'
            icon={<TbTools />}
            title='No service works found'
            hight='calc(100vh - 300px)'
          />}
        {allServiceWorks?.length > 0 &&
          <div className="service-list">
            {allServiceWorks?.map((item) => {
              const isSelected = Boolean(item?.is_selected)
              const isDisabled = Boolean(item?.is_selected && item?.selection_context !== item?.selection_info?.selected_context)
              const actualPrice = Number(item?.pricing?.charged ?? 0)
              const mrpPrice = Number(item?.pricing?.list_price ?? 0)
              const hasDiscount = mrpPrice > actualPrice

              return (
                <div
                  className={`item ${isSelected ? 'is-selected active' : ''} ${isDisabled ? 'is-disabled disabled' : ''}`}
                  key={item?.work_uuid || item?.work_id}
                  onClick={() => {
                    if (isDisabled) return
                    selectService(item)
                  }}
                  aria-disabled={isDisabled}
                >
                  <div className="checkbox-section">
                    <div className={`checkbox ${isSelected ? 'active' : ''}`}>
                      <TbCheck className="check-icon" />
                    </div>
                  </div>
                  <div className="item-content">
                    <div className="title-row">
                      <h4 className="work-name" title={item?.work_name}>{item?.work_name}</h4>
                    </div>
                    {item?.work_id && (
                      <div className="meta-row">
                        <span className="work-id-code">#{item?.work_id}</span>
                      </div>
                    )}
                  </div>
                  <div className="price">
                    {hasDiscount && <p className="hash-price">₹{mrpPrice}</p>}
                    <p className={`real-price ${actualPrice === 0 ? 'free-price' : ''}`}>
                      {actualPrice === 0 ? '₹0' : `₹${actualPrice}`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>}
      </div>

      <div className="fixed-section">
        <div className="submit-button">
          <Button label={'Done'} rounded severity={'secondary'} style={{ width: '100%' }} onClick={() => setWorkMenu('')} />
        </div>
      </div>
    </div>
  )
}

export default ServiceList