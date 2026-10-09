import React, { useMemo } from 'react'
import './sub-page-style.scss'
import { useDispatch, useSelector } from 'react-redux'
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { containsExactWord, toStandardText } from '../../../../utils/helpers/text-formatting'
import { findFilteredWaterFlowStatus, findPhStatus, findRejectWaterFlowStatus, findTdsStatus } from '../../../../utils/flows/service_form_utils'
import Badge from '../../../UI_Primitives/badge/Badge'

const WpWithNewSpun = ({ pageKey }) => {
    const dispatch = useDispatch();
    const { formResources, serviceFormSettings, serviceForm } = useSelector((state) => state.application)


    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);

    const productInfo = useMemo(() => {
        const thisProduct = formResources?.products?.find(p => p?.product_id === serviceFormSettings?.activeProduct?.[0])

        const hasUV = containsExactWord(thisProduct?.product_name, 'UV')
        const hasAlkaline = containsExactWord(thisProduct?.product_name, 'ALKALINE')
        const hasRo = containsExactWord(thisProduct?.product_name, 'RO')

        const hasUvOnly = hasUV && !hasAlkaline && !hasRo

        return { hasUV, hasAlkaline, hasRo, hasUvOnly }
    }, [formResources])


    const handleChangeTDS = (e) => {
        const { name, value } = e.target;

        let inputValue = 0, outputValue = 0;

        if (name === 'input_tds') {
            inputValue = Number(value)
            outputValue = Number(productInForm?.with_new_spun?.tds?.output_tds || 0)
        } else if (name === 'output_tds') {
            inputValue = Number(productInForm?.with_new_spun?.tds?.input_tds || 0)
            outputValue = Number(value)
        }

        const status = findTdsStatus(inputValue, outputValue, productInfo)

        dispatch(sfActions.updateProduct.innerFields({
            with_new_spun: {
                tds: {
                    ...(productInForm?.with_new_spun?.tds || {}),
                    status,
                    [name]: value || ''
                }
            }
        }))

        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const handleChangeFilteredWaterFlow = (e) => {
        const { value } = e.target;

        const status = findFilteredWaterFlowStatus(Number(value || 0))

        dispatch(sfActions.updateProduct.innerFields({
            with_new_spun: {
                filtered_water: {
                    flow_status: status,
                    flow_value: value || ''
                }
            }
        }))

        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const handleChangeRejectWaterFlow = (e) => {
        const { value } = e.target;

        const status = findRejectWaterFlowStatus(Number(value || 0), Number(productInForm?.current_condition?.fr_value || 0))

        dispatch(sfActions.updateProduct.innerFields({
            with_new_spun: {
                reject_water: {
                    flow_status: status,
                    flow_value: value || ''
                }
            }
        }))

        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const handleChangePh = (e) => {
        const { value } = e.target;

        const status = findPhStatus(Number(value || 0))

        dispatch(sfActions.updateProduct.innerFields({
            with_new_spun: {
                ph: {
                    status: status,
                    value: value || ''
                }
            }
        }))

        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const resetSection = () => {
        dispatch(sfActions.updateProduct.parentValue({
            with_new_spun: undefined,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const withNewSpun = productInForm?.with_new_spun || {}

        // validation
        if (!productInfo?.hasUvOnly && (
            (withNewSpun?.filtered_water?.flow_status && withNewSpun?.filtered_water?.flow_status !== 'NORMAL') ||
            (withNewSpun?.reject_water?.flow_status && withNewSpun?.reject_water?.flow_status !== 'NORMAL') ||
            (withNewSpun?.tds?.status && withNewSpun?.tds?.status === 'HIGH')
        )) {
            // pump & membrane section
            dispatch(sfSetting.page.next(1102))
            return;
        }

        dispatch(sfActions.updateProduct.parentValue({
            membrane_tds: undefined,
            pump_membrane_checkups: undefined
        }))

        // work section
        dispatch(sfSetting.page.next(1103))
    }


    return (
        <div className="tech-service-form-subpage">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.find(p => p.key === pageKey)?.title}</h3>
                <p>{serviceFormPageRoute?.find(p => p.key === pageKey)?.description}</p>
            </div>

            <div className="reset-section">
                <Button label={'Reset section'} size='small' severity={'secondary'} rounded outlined style={{ width: '100px' }}
                    onClick={resetSection} />
            </div>

            <form onSubmit={handleSubmit}>

                {/* TDS */}
                {productInForm?.current_condition?.tds?.status !== 'NORMAL' &&
                    <div className="form-section">
                        <h3 className='subtitle'>TDS</h3>
                        <div className="box-col2">
                            <InputText label={'Input TDS'} id={'input_tds'} name={'input_tds'} required value={productInForm?.with_new_spun?.tds?.input_tds}
                                onChange={handleChangeTDS} type='number' step={0.1} min={0} />
                            <InputText label={'Output TDS'} id={'output_tds'} name={'output_tds'} required value={productInForm?.with_new_spun?.tds?.output_tds}
                                onChange={handleChangeTDS} type='number' min={0}
                                rightIcon={productInForm?.with_new_spun?.tds?.status ? <Badge
                                    value={toStandardText(productInForm?.with_new_spun?.tds?.status)}
                                    severity={productInForm?.with_new_spun?.tds?.status === "NORMAL" ? 'primary' : "danger"}
                                /> : ''} />
                        </div>
                    </div>}

                {/* Water flow */}
                {(productInForm?.current_condition?.filtered_water?.flow_status !== 'NORMAL' ||
                    productInForm?.current_condition?.reject_water?.flow_status !== 'NORMAL') &&
                    <div className="form-section">
                        <h3 className='subtitle'>Water flow</h3>
                        <div className={productInfo?.hasUvOnly ? "box-col1" : "box-col2"}>
                            <InputText label={'Filtered water'} id={'filtered_water'} name={'flow_value'} required
                                value={productInForm?.with_new_spun?.filtered_water?.flow_value}
                                onChange={handleChangeFilteredWaterFlow} type='number' step={0.1} min={0}
                                rightIcon={productInForm?.with_new_spun?.filtered_water?.flow_status ? <Badge
                                    value={toStandardText(productInForm?.with_new_spun?.filtered_water?.flow_status)}
                                    severity={productInForm?.with_new_spun?.filtered_water?.flow_status === "NORMAL" ? 'primary' : "danger"}
                                /> : ''} />

                            {!productInfo?.hasUvOnly &&
                                <InputText label={'Reject water'} id={'reject_water'} name={'flow_value'} required
                                    value={productInForm?.with_new_spun?.reject_water?.flow_value}
                                    onChange={handleChangeRejectWaterFlow} type='number' min={0}
                                    rightIcon={productInForm?.with_new_spun?.reject_water?.flow_status ? <Badge
                                        value={toStandardText(productInForm?.with_new_spun?.reject_water?.flow_status)}
                                        severity={productInForm?.with_new_spun?.reject_water?.flow_status === "NORMAL" ? 'primary' : "danger"}
                                    /> : ''} />}
                        </div>
                    </div>}

                {/* PH */}
                {productInfo?.hasAlkaline && productInForm?.current_condition?.working_status !== 'WORKING' &&
                    <div className="form-section">
                        <h3 className='subtitle'>Potential of Hydrogen (PH)</h3>
                        <div className="box-col1">
                            <InputText label={'PH'} id={'ph'} name={'ph'} required
                                value={productInForm?.with_new_spun?.ph?.value}
                                onChange={handleChangePh} type='number' step={0.1} min={0}
                                rightIcon={productInForm?.with_new_spun?.ph?.status ? <Badge
                                    value={toStandardText(productInForm?.with_new_spun?.ph?.status)}
                                    severity={productInForm?.with_new_spun?.ph?.status === "NORMAL" ? 'primary' : "danger"}
                                /> : ''} />
                        </div>
                    </div>}

                <div className="submit-section">
                    <Button label={'Next'} severity={'secondary'} rounded style={{ width: '100%' }} />
                </div>

            </form>
        </div>
    )
}

export default WpWithNewSpun