import React, { useMemo, useState } from 'react'
import './vf-service-work-home.scss'
import { useDispatch, useSelector } from 'react-redux';
import Select from '../../../UI_Primitives/inputs/Select';
import InputText from '../../../UI_Primitives/inputs/InputText';
import Button from '../../../UI_Primitives/buttons/Button';
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers';
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice';
import { doDialog } from '../../../../redux/features/non_persisted/miniSystemSlice';

const AdServiceWorkHome = ({ category, setWorkMenu, changeSubmitStatus }) => {
    const dispatch = useDispatch();
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)
    const [menuMeta, setMenuMeta] = useState({ materials: 0, bags: 0, spares: 0, services: 0 })

    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]

        setMenuMeta({
            additional_spares: current?.work?.components_list?.filter(s => s.spare_type === 'ADDITIONAL_SPARE')?.length,
            additional_services: current?.work?.services_list?.filter(s => s.service_type === 'ADDITIONAL_SERVICE')?.length
        })

        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);

    const clickWorkMenu = (type, id) => {
        setWorkMenu({ type, id: id || null })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        // If choose any work or components , then show the warming alert
        if (!menuMeta?.additional_spares && !menuMeta?.additional_services) {
            dispatch(doDialog.confirm({
                message: 'You have not selected any work or components, Are you sure to continue without work or components?',
                accept: {
                    onClick: () => {
                        dispatch(sfSetting.setActiveSubPage(202))
                    }
                }
            }))

            return;
        }

        dispatch(sfSetting.setActiveSubPage(202))
    }

    const handelChange = (e) => {

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

    const handleChangeServiceData = (e) => {

        changeSubmitStatus(false)

        const updateData = {
            service_data: {
                next_service_date: e.target.value || null
            }
        }

        dispatch(sfActions.updateProduct(updateData))

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

    return (
        <div className="sf-sub-vf-service-work-home">
            <div className="menus">
                <div className="menu-section">
                    <div className={`menu-item ${menuMeta?.additional_spares ? 'item-selected' : ''}`}
                        onClick={() => clickWorkMenu('ADDITIONAL_SPARE', "SPARE_SECTION")}>
                        <h3>Additional<br></br>Components</h3>
                        <p>{menuMeta?.additional_spares ? `${menuMeta?.additional_spares} items selected` : "Choose component items"}</p>
                    </div>

                    <div className={`menu-item ${menuMeta?.additional_services ? 'item-selected' : ''}`}
                        onClick={() => clickWorkMenu('ADDITIONAL_SERVICE')} >
                        <h3>Additional<br></br>Services</h3>
                        <p>{menuMeta?.additional_services ? `${menuMeta?.additional_services} items selected` : "Choose service works"}</p>
                    </div>
                </div>

            </div>

            <form action="" onSubmit={handleSubmit}>
                {/* Service charge */}
                <h4>Service Charge</h4>
                <Select label={'Service Charge'} name={'service_charge'} value={productInForm?.service_data?.service_charge?.estimate}
                    options={[{}, ...category?.service_charges?.map(s => ({ label: s?.charge_amount, value: s?.charge_amount }))]}
                    onChange={handelChange} required />

                {category?.service_charges?.[0]?.charge_amount !== productInForm?.service_data?.service_charge?.estimate &&
                    <InputText label={'Extra Charge Reason'} name={'remark'} value={productInForm?.service_data?.service_charge?.remark}
                        onChange={handelChange} required />}


                {/* Assign Visit Date */}
                <h4 style={{ marginTop: '20px' }}>Assign Visit Date</h4>
                <InputText label={'Next Visit Date'} type={'date'} name={'service_date'} value={productInForm?.service_data?.next_service_date}
                    onChange={handleChangeServiceData} helperText={'Set the next visit date if you want to schedule the next service.'}
                    min={isoToYYYYMMDD(new Date())} />

                <div className="buttons">
                    <Button type='button' label={'Reset Work'} rounded severity={'danger'} onClick={resetWorkCategory} />
                    <Button label={'Next'} rounded />
                </div>
            </form>

        </div>
    )
}

export default AdServiceWorkHome