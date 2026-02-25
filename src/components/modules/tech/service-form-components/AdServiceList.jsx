import React from 'react'
import './vf-service-list.scss'
import Button from '../../../UI_Primitives/buttons/Button'
import { TbCheck, TbComponents } from 'react-icons/tb'
import { useDispatch } from 'react-redux'
import { sfActions } from '../../../../redux/features/persisted/applicationSlice'

const AdServiceList = ({ setWorkMenu, componentsPage, servicesList, productInForm, changeSubmitStatus }) => {
    const dispatch = useDispatch();

    const selectService = (item) => {

        const isExisted = productInForm?.work?.services_list?.filter(s => s?.service_id === item?.service_id)?.[0]

        // if existed then remove form service list
        // if not existed then add to service list

        changeSubmitStatus(false)

        let updateData = {}

        if (isExisted) {
            updateData = {
                work: {
                    ...productInForm?.work,
                    services_list: productInForm?.work?.services_list?.filter(s => s?.service_id !== item?.service_id)
                }
            }

            if (item?.rent_renewal_included) {
                updateData.service_data = {
                    is_rent_renewed: false
                }
            }

            dispatch(sfActions.updateProduct(updateData))
        } else {

            updateData = {
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
            }

            if (item?.rent_renewal_included) {
                updateData.service_data = {
                    is_rent_renewed: true
                }
            }

            dispatch(sfActions.updateProduct(updateData))
        }

    }
    return (
        <div className="vf-service-list-comp-container">
            <div className="service-list-border">
                <div className="title">
                    <h3>{componentsPage?.title}</h3>
                </div>

                <div className="service-list">
                    {servicesList?.map((item) => {
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
                </div>


            </div>
            <div className="fixed-section">
                <div className="submit-button">
                    <Button label={'Done'} rounded style={{ width: '100%' }} onClick={() => setWorkMenu({ type: null, id: null })} />
                </div>
            </div>
        </div>
    )
}

export default AdServiceList