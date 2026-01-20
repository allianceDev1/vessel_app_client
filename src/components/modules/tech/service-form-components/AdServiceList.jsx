import React from 'react'
import './vf-service-list.scss'
import Button from '../../../UI_Primitives/buttons/Button'
import { TbCheck, TbComponents } from 'react-icons/tb'
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState'
import { useDispatch } from 'react-redux'
import { sfActions } from '../../../../redux/features/persisted/applicationSlice'

const AdServiceList = ({ setWorkMenu, componentsPage, servicesList, productInForm, changeSubmitStatus, product }) => {
    const dispatch = useDispatch();

    const selectService = (item) => {

        const isExisted = productInForm?.work?.services_list?.filter(s => s?.service_id === item?.service_id)?.[0]

        // if existed then remove form service list
        // if not existed then add to service list

        changeSubmitStatus(false)

        if (isExisted) {
            dispatch(sfActions.updateProduct({
                work: {
                    ...productInForm?.work,
                    services_list: productInForm?.work?.services_list?.filter(s => s?.service_id !== item?.service_id)
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

    const selectRentRenewal = () => {

        const item = {
            service_id: 'rent_renewal',
            service_name: 'Rent Renewal',
            pricing: {
                list_price: product?.rental?.renewal_charge,
                charged: product?.rental?.renewal_charge,
                ledger_cost: product?.rental?.renewal_charge
            },
            call_rate: 0,
            refill_included: false,
            reinstallation_included: false,
            under_warranty: false,
            non_receivable_reason: ''
        }

        const isExisted = productInForm?.work?.services_list?.filter(s => s?.service_id === 'rent_renewal')?.[0]
        changeSubmitStatus(false)

        if (isExisted) {
            dispatch(sfActions.updateProduct({
                work: {
                    services_list: productInForm?.work?.services_list?.filter(s => s?.service_id !== 'rent_renewal')
                },
                service_data: {
                    is_rent_renewed: false
                }
            }))
        } else {
            dispatch(sfActions.updateProduct({
                work: {
                    services_list: [
                        ...(productInForm?.work?.services_list || []),
                        {
                            ...item,
                            selected: true
                        }
                    ]
                },
                service_data: {
                    is_rent_renewed: true
                }
            }))
        }
    }

    return (
        <div className="vf-service-list-comp-container">
            <div className="service-list-border">
                <div className="title">
                    <h3>{componentsPage?.title}</h3>
                </div>

                <div className="service-list">
                    {product?.rental?.has_rental && <div className="item" onClick={() => selectRentRenewal()}>
                        <div className="checkbox-section">
                            <div className={productInForm?.work?.services_list?.filter((s => s.service_id === 'rent_renewal'))?.[0] ? "checkbox active" : "checkbox"}>
                                <TbCheck />
                            </div>
                        </div>
                        <div className="item-content">
                            <h4>Rent Renewal</h4>
                            <div className="price">
                                <p className="real-price">₹{product?.rental?.renewal_charge}</p>
                            </div>
                        </div>
                    </div>}

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