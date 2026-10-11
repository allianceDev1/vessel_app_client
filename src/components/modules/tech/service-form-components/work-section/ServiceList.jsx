import React, { useMemo, useState } from 'react'
import './service-list.scss'
import Button from '../../../../UI_Primitives/buttons/Button'
import { TbCheck, TbTools } from 'react-icons/tb'
import EmptyState from '../../../../UI_Primitives/ui-states/EmptyState'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions } from '../../../../../redux/features/persisted/applicationSlice'
import { findSpareTypeAmount } from '../../../../../utils/flows/service_form_utils'
import { toStandardText } from '../../../../../utils/helpers/text-formatting'

const ServiceList = ({ setWorkMenu, productInForm, changeSubmitStatus, workMenu, serviceCategory, product, }) => {
  const dispatch = useDispatch();
  const { formResources, serviceFormSettings } = useSelector((state) => state.application);
  const [searchText, setSearchText] = useState('')
  const [enableSearch, setEnableSearch] = useState(false)

  const coverage = useMemo(() => {
    return serviceCategory?.coverage?.find(c => {
      if (workMenu === 'RENEWAL_SERVICE') {
        return c.coverage_id === 'SERVICE_WORK' && c.position === 'TARGET';
      } else {
        return c.coverage_id === 'SERVICE_WORK' && c.position === 'CURRENT';
      }
    }) || null;
  }, [serviceCategory, workMenu])







  const selectService = (item) => {

    const isExisted = productInForm?.work?.services_list?.filter(s => s?.service_id === item?.service_id && s?.service_type === workMenu?.type)?.[0]

    // if existed then remove form service list
    // if not existed then add to service list

    changeSubmitStatus(false)

    if (isExisted) {
      dispatch(sfActions.updateProduct.innerFields({
        work: {
          ...productInForm?.work,
          services_list: productInForm?.work?.services_list?.filter(s => s?.service_id !== item?.service_id || s?.service_type !== workMenu?.type)
        }
      }))
    } else {
      dispatch(sfActions.updateProduct.innerFields({
        work: {
          ...productInForm?.work,
          services_list: [
            ...(productInForm?.work?.services_list || []),
            {
              ...item,
              selected: true
            }
          ]
        }
      }))
    }

  }



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
        is_active: true,
        is_selected: selectedItem ? true : false,
        pricing: priceObject
      }
    });

    return works;

  }, [serviceFormSettings, searchText, formResources, coverage, productInForm])


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
              return <div className="item" key={item?.work_id} onClick={() => selectService(item)}>
                <div className="checkbox-section">
                  <div className={item?.selected ? "checkbox active" : "checkbox"}>
                    <TbCheck />
                  </div>
                </div>
                <div className="item-content">
                  <h4>{item?.work_name}</h4>
                  <div className="price">
                    {item?.pricing?.list_price !== item?.pricing?.charged && <p className="hash-price">₹{item?.pricing?.list_price}</p>}
                    <p className="real-price">₹{item?.pricing?.charged}</p>
                  </div>
                </div>
              </div>
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