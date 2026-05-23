import React from 'react'
import './vf-service-list.scss'
import Button from '../../../UI_Primitives/buttons/Button'
import { TbCheck, TbComponents } from 'react-icons/tb'
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState'
import { useDispatch } from 'react-redux'
import { sfActions } from '../../../../redux/features/persisted/applicationSlice'

const VfServiceList = ({ setWorkMenu, subPage, itemsList, productInForm, changeSubmitStatus, workMenu }) => {
  const dispatch = useDispatch();

  const selectService = (item) => {

    const isExisted = productInForm?.work?.services_list?.filter(s => s?.service_id === item?.service_id && s?.service_type === workMenu?.type)?.[0]

    // if existed then remove form service list
    // if not existed then add to service list

    changeSubmitStatus(false)

    if (isExisted) {
      dispatch(sfActions.updateProduct({
        work: {
          ...productInForm?.work,
          services_list: productInForm?.work?.services_list?.filter(s => s?.service_id !== item?.service_id || s?.service_type !== workMenu?.type)
        }
      }))
    } else {
      dispatch(sfActions.updateProduct({
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

  return (
    <div className="vf-service-list-comp-container">
      <div className="service-list-border">
        <div className="title">
          <h3>{subPage?.title}</h3>
        </div>

        {!itemsList?.length &&
          <EmptyState
            size='sm'
            icon={<TbComponents />}
            title={'No Access'}
            hight='250px'
          />}
        {itemsList?.length > 0 &&
          <div className="service-list">
            {itemsList?.map((item) => {
              return <div className="item" key={item?.service_id} onClick={() => selectService(item)}>
                <div className="checkbox-section">
                  <div className={item?.selected ? "checkbox active" : "checkbox"}>
                    <TbCheck />
                  </div>
                </div>
                <div className="item-content">
                  <h4>{item?.service_name}</h4>
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
          <Button label={'Done'} rounded style={{ width: '100%' }} onClick={() => setWorkMenu({ type: null, id: null })} />
        </div>
      </div>
    </div>
  )
}

export default VfServiceList