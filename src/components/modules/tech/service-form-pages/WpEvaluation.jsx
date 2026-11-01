import React, { useMemo } from 'react'
import './sub-page-style.scss'
import { useDispatch, useSelector } from 'react-redux'
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import RadioCard from '../../../UI_Primitives/inputs/RadioCard'
import { containsExactWord, toStandardText } from '../../../../utils/helpers/text-formatting'
import { PUMP_BRAND_TYPES } from '../../../../assets/javascript/pre_data/product'
import { findFilteredWaterFlowStatus, findPhStatus, findRejectWaterFlowStatus, findTdsStatus } from '../../../../utils/flows/service_form_utils'
import Badge from '../../../UI_Primitives/badge/Badge'

const WpEvaluation = ({ pageKey }) => {
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

    const updateDirectInputs = (e) => {

        dispatch(sfSetting.productSubmit.resetStatus());

        if (e.target.name === 'fr_value') {
            const status = findRejectWaterFlowStatus(
                Number(productInForm?.evaluation?.reject_water?.flow_value || 0),
                Number(e.target.value || 0)
            )
            dispatch(sfActions.updateProduct.innerFields({
                evaluation: {
                    [e.target.name]: e.target.value || "",
                    reject_water: {
                        flow_status: status,
                        flow_value: productInForm?.evaluation?.reject_water?.flow_value || ''
                    }
                }
            }))

            return;
        }

        dispatch(sfActions.updateProduct.innerFields({
            evaluation: {
                [e.target.name]: e.target.value || ""
            }
        }))
    }

    const handleChangeTDS = (e) => {
        const { name, value } = e.target;

        let inputValue = 0, outputValue = 0;

        if (name === 'input_tds') {
            inputValue = Number(value)
            outputValue = Number(productInForm?.evaluation?.tds?.output_tds || 0)
        } else if (name === 'output_tds') {
            inputValue = Number(productInForm?.evaluation?.tds?.input_tds || 0)
            outputValue = Number(value)
        }

        const status = findTdsStatus(inputValue, outputValue, productInfo)

        dispatch(sfActions.updateProduct.innerFields({
            evaluation: {
                tds: {
                    ...(productInForm?.evaluation?.tds || {}),
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
            evaluation: {
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

        const status = findRejectWaterFlowStatus(Number(value || 0), Number(productInForm?.evaluation?.fr_value || 0))

        dispatch(sfActions.updateProduct.innerFields({
            evaluation: {
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
            evaluation: {
                ph: {
                    status: status,
                    value: value || ''
                }
            }
        }))

        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const updateWaterQuality = (e) => {

        if (e.target.name === 'status') {
            dispatch(sfActions.updateProduct.innerFields({
                evaluation: {
                    water_quality: {
                        status: e.target.value,
                        comment: ''
                    }
                }
            }))
        } else {
            dispatch(sfActions.updateProduct.innerFields({
                evaluation: {
                    water_quality: {
                        ...(productInForm?.evaluation?.water_quality || {}),
                        [e.target.name]: e.target.value || null
                    }
                }
            }))
        }

        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const resetSection = () => {
        dispatch(sfActions.updateProduct.parentValue({
            evaluation: undefined,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const productId = serviceFormSettings?.activeProduct?.[0]

        dispatch(sfSetting.productSubmit.setStatus({ product_id: productId, is_submitted: true }))
        dispatch(sfSetting.setActiveProduct(null))
        dispatch(sfSetting.page.next(1000))

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
                
                {!productInfo?.hasUvOnly && <div className="form-section">
                    <h3 className='subtitle'>Pump & FR</h3>
                    <div className="box-col2" >
                        <Select label={'Pump brand'} id={'pump_brand'} name={'pump_brand'} required value={productInForm?.evaluation?.pump_brand}
                            onChange={updateDirectInputs} options={[{}, ...PUMP_BRAND_TYPES?.map(i => ({ label: toStandardText(i), value: i })), { label: "Other", value: '_input_write_' }]} />
                        <InputText label={'FR'} id={'fr_value'} name={'fr_value'} required value={productInForm?.evaluation?.fr_value}
                            onChange={updateDirectInputs} type='number' min={100} />
                    </div>
                </div>}


                {/* TDS */}
                <div className="form-section">
                    <h3 className='subtitle'>TDS</h3>
                    <div className="box-col2">
                        <InputText label={'Input TDS'} id={'input_tds'} name={'input_tds'} required value={productInForm?.evaluation?.tds?.input_tds}
                            onChange={handleChangeTDS} type='number' step={0.1} min={0} />
                        <InputText label={'Output TDS'} id={'output_tds'} name={'output_tds'} required value={productInForm?.evaluation?.tds?.output_tds}
                            onChange={handleChangeTDS} type='number' min={0}
                            rightIcon={productInForm?.evaluation?.tds?.status ? <Badge
                                value={toStandardText(productInForm?.evaluation?.tds?.status)}
                                severity={productInForm?.evaluation?.tds?.status === "NORMAL" ? 'primary' : "danger"}
                            /> : ''} />
                    </div>
                </div>

                {/* Water flow */}
                <div className="form-section">
                    <h3 className='subtitle'>Water flow</h3>
                    <div className={productInfo?.hasUvOnly ? "box-col1" : "box-col2"}>
                        <InputText label={'Filtered water'} id={'filtered_water'} name={'flow_value'} required
                            value={productInForm?.evaluation?.filtered_water?.flow_value}
                            onChange={handleChangeFilteredWaterFlow} type='number' step={0.1} min={0}
                            rightIcon={productInForm?.evaluation?.filtered_water?.flow_status ? <Badge
                                value={toStandardText(productInForm?.evaluation?.filtered_water?.flow_status)}
                                severity={productInForm?.evaluation?.filtered_water?.flow_status === "NORMAL" ? 'primary' : "danger"}
                            /> : ''} />

                        {!productInfo?.hasUvOnly &&
                            <InputText label={'Reject water'} id={'reject_water'} name={'flow_value'} required
                                value={productInForm?.evaluation?.reject_water?.flow_value}
                                onChange={handleChangeRejectWaterFlow} type='number' min={0}
                                rightIcon={productInForm?.evaluation?.reject_water?.flow_status ? <Badge
                                    value={toStandardText(productInForm?.evaluation?.reject_water?.flow_status)}
                                    severity={productInForm?.evaluation?.reject_water?.flow_status === "NORMAL" ? 'primary' : "danger"}
                                /> : ''} />}
                    </div>
                </div>

                {/* PH */}
                {productInfo?.hasAlkaline &&
                    <div className="form-section">
                        <h3 className='subtitle'>Potential of Hydrogen (PH)</h3>
                        <div className="box-col1">
                            <InputText label={'PH'} id={'ph'} name={'ph'} required
                                value={productInForm?.evaluation?.ph?.value}
                                onChange={handleChangePh} type='number' step={0.1} min={0}
                                rightIcon={productInForm?.evaluation?.ph?.status ? <Badge
                                    value={toStandardText(productInForm?.evaluation?.ph?.status)}
                                    severity={productInForm?.evaluation?.ph?.status === "NORMAL" ? 'primary' : "danger"}
                                /> : ''} />
                        </div>
                    </div>}


                {/* UV status */}
                {productInfo?.hasUV &&
                    <div className="form-section">
                        <h3 className='subtitle'>UV Filter Status</h3>
                        <div className="box-col2">
                            <RadioCard
                                label="Working"
                                description="No compliant"
                                name="uv_status"
                                id="uv_ok"
                                radioValue="WORKING"
                                onChange={updateDirectInputs}
                                checked={productInForm?.evaluation?.uv_status === 'WORKING'}
                                required
                            />
                            <RadioCard
                                label="Not working"
                                description="Have a complaint"
                                name="uv_status"
                                id="uv_not_ok"
                                radioValue="NOT_WORKING"
                                onChange={updateDirectInputs}
                                checked={productInForm?.evaluation?.uv_status === 'NOT_WORKING'}
                                required
                            />
                        </div>
                    </div>}

                <div className="form-section">
                    <h3 className='subtitle'>Water quality</h3>
                    <div className="box-col2">
                        <RadioCard
                            label="Good"
                            description="Complaint fixed / Service completed"
                            name="status"
                            id="condition_ok"
                            radioValue="Good"
                            onChange={updateWaterQuality}
                            checked={productInForm?.evaluation?.water_quality?.status === 'Good'}
                            required
                        />
                        <RadioCard
                            label="Bad"
                            description="The complaint still existed"
                            name="status"
                            id="condition_not_ok"
                            radioValue="Bad"
                            onChange={updateWaterQuality}
                            checked={productInForm?.evaluation?.water_quality?.status === 'Bad'}
                            required
                        />
                    </div>
                    {productInForm?.evaluation?.water_quality?.status === 'Bad' &&
                        <div className="box-col1" style={{ marginTop: '10px' }}>
                            <InputText label={'Comments'} id={'comment'} name={'comment'}
                                value={productInForm?.evaluation?.water_quality?.comment}
                                onChange={updateWaterQuality} required />
                        </div>}
                </div>

                <div className="submit-section">
                    <Button label={'Submit Service'} severity={'primary'} rounded style={{ width: '100%' }} />
                </div>

            </form>
        </div>
    )
}

export default WpEvaluation