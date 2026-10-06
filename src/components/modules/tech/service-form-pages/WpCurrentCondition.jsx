import React, { useMemo } from 'react'
import './sub-page-style.scss'
import { useDispatch, useSelector } from 'react-redux'
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import RadioCard from '../../../UI_Primitives/inputs/RadioCard'
import Textarea from '../../../UI_Primitives/inputs/TextArea'
import { containsExactWord, toStandardText } from '../../../../utils/helpers/text-formatting'
import { PUMP_BRAND_TYPES } from '../../../../assets/javascript/pre_data/product'
import { findFilteredWaterFlowStatus, findPhStatus, findRejectWaterFlowStatus, findTdsStatus } from '../../../../utils/flows/service_form_utils'
import Badge from '../../../UI_Primitives/badge/Badge'

const WpCurrentCondition = ({ pageKey }) => {
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
                Number(productInForm?.current_condition?.reject_water?.flow_value || 0),
                Number(e.target.value || 0)
            )
            dispatch(sfActions.updateProduct.innerFields({
                current_condition: {
                    [e.target.name]: e.target.value || "",
                    reject_water: {
                        flow_status: status,
                        flow_value: productInForm?.current_condition?.reject_water?.flow_value || 0
                    }
                }
            }))

            return;
        }

        if (e.target.name === 'working_status') {

            dispatch(sfActions.updateProduct.innerFields({
                current_condition: {
                    [e.target.name]: e.target.value || "",
                    tds: undefined,
                    filtered_water: undefined,
                    reject_water: undefined,
                    leak_status: undefined,
                    leak_comment: undefined,
                    scratch_crack_status: undefined,
                    scratch_crack_comment: undefined,
                }
            }))

            return;
        }

        dispatch(sfActions.updateProduct.innerFields({
            current_condition: {
                [e.target.name]: e.target.value || ""
            }
        }))
    }

    const handleChangeTDS = (e) => {
        const { name, value } = e.target;

        let inputValue = 0, outputValue = 0;

        if (name === 'input_tds') {
            inputValue = Number(value)
            outputValue = Number(productInForm?.current_condition?.tds?.output_tds || 0)
        } else if (name === 'output_tds') {
            inputValue = Number(productInForm?.current_condition?.tds?.input_tds || 0)
            outputValue = Number(value)
        }

        const status = findTdsStatus(inputValue, outputValue, productInfo)

        dispatch(sfActions.updateProduct.innerFields({
            current_condition: {
                tds: {
                    ...(productInForm?.current_condition?.tds || {}),
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
            current_condition: {
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
            current_condition: {
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
            current_condition: {
                ph: {
                    status: status,
                    value: value || ''
                }
            }
        }))

        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const updateLeakStatus = (e) => {
        const { value } = e.target;

        if (value === 'YES') {
            dispatch(sfActions.updateProduct.innerFields({
                current_condition: {
                    leak_status: true
                }
            }))
        } else {
            dispatch(sfActions.updateProduct.innerFields({
                current_condition: {
                    leak_status: false,
                    leak_comment: ''
                }
            }))
        }


        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const updateScratchStatus = (e) => {
        const { value } = e.target;

        if (value === 'YES') {
            dispatch(sfActions.updateProduct.innerFields({
                current_condition: {
                    scratch_crack_status: true
                }
            }))
        } else {
            dispatch(sfActions.updateProduct.innerFields({
                current_condition: {
                    scratch_crack_status: false,
                    scratch_crack_comment: ''
                }
            }))
        }

        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const currentCondition = productInForm?.current_condition || {}

        // validation
        if (!productInfo?.hasUvOnly) {
            if (currentCondition?.filtered_water?.flow_status !== 'NORMAL' ||
                currentCondition?.reject_water?.flow_status !== 'NORMAL'
            ) {
                // spun section
                dispatch(sfSetting.page.next(1101))
                return;
            } else if (currentCondition?.tds?.status !== 'NORMAL') {
                // pump & membrane section
                dispatch(sfActions.updateProduct.parentValue({
                    with_new_spun: undefined
                }))
                dispatch(sfSetting.page.next(1102))

                return;
            }
        }

        dispatch(sfActions.updateProduct.parentValue({
            with_new_spun: undefined,
            membrane_tds: undefined,
            pump_membrane_checkups: undefined
        }))
        dispatch(sfSetting.page.next(1103))
    }


    return (
        <div className="tech-service-form-subpage sf-subpage-one">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.find(p => p.key === pageKey)?.title}</h3>
                <p>{serviceFormPageRoute?.find(p => p.key === pageKey)?.description}</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Working Status */}
                <div className="form-section">
                    <h3 className='subtitle'>Purifier Status</h3>
                    <div className="box-col2">
                        <RadioCard
                            label="Working"
                            description="Ready to check"
                            name="working_status"
                            id="ok"
                            radioValue="WORKING"
                            onChange={updateDirectInputs}
                            checked={productInForm?.current_condition?.working_status === 'WORKING'}
                            required
                        />
                        <RadioCard
                            label="Not working"
                            description="Have a complaint"
                            name="working_status"
                            id="not_ok"
                            radioValue="NOT_WORKING"
                            onChange={updateDirectInputs}
                            checked={productInForm?.current_condition?.working_status === 'NOT_WORKING'}
                            required
                        />
                    </div>

                    {!productInfo?.hasUvOnly &&
                        <div className="box-col2" style={{ marginTop: '30px' }}>
                            <Select label={'Pump brand'} id={'pump_brand'} name={'pump_brand'} required value={productInForm?.current_condition?.pump_brand}
                                onChange={updateDirectInputs} options={[{}, ...PUMP_BRAND_TYPES?.map(i => ({ label: toStandardText(i), value: i })), { label: "Other", value: '_input_write_' }]} />
                            <InputText label={'FR'} id={'fr_value'} name={'fr_value'} required value={productInForm?.current_condition?.fr_value}
                                onChange={updateDirectInputs} type='number' min={100} />
                        </div>}

                </div>

                {productInForm?.current_condition?.working_status === 'WORKING' && <>

                    {/* TDS */}
                    <div className="form-section">
                        <h3 className='subtitle'>TDS</h3>
                        <div className="box-col2">
                            <InputText label={'Input TDS'} id={'input_tds'} name={'input_tds'} required value={productInForm?.current_condition?.tds?.input_tds}
                                onChange={handleChangeTDS} type='number' step={0.1} min={0} />
                            <InputText label={'Output TDS'} id={'output_tds'} name={'output_tds'} required value={productInForm?.current_condition?.tds?.output_tds}
                                onChange={handleChangeTDS} type='number' min={0}
                                rightIcon={productInForm?.current_condition?.tds?.status ? <Badge
                                    value={toStandardText(productInForm?.current_condition?.tds?.status)}
                                    severity={productInForm?.current_condition?.tds?.status === "NORMAL" ? 'primary' : "danger"}
                                /> : ''} />
                        </div>
                    </div>

                    {/* Water flow */}
                    <div className="form-section">
                        <h3 className='subtitle'>Water flow</h3>
                        <div className={productInfo?.hasUvOnly ? "box-col1" : "box-col2"}>
                            <InputText label={'Filtered water'} id={'filtered_water'} name={'flow_value'} required
                                value={productInForm?.current_condition?.filtered_water?.flow_value}
                                onChange={handleChangeFilteredWaterFlow} type='number' step={0.1} min={0}
                                rightIcon={productInForm?.current_condition?.filtered_water?.flow_status ? <Badge
                                    value={toStandardText(productInForm?.current_condition?.filtered_water?.flow_status)}
                                    severity={productInForm?.current_condition?.filtered_water?.flow_status === "NORMAL" ? 'primary' : "danger"}
                                /> : ''} />

                            {!productInfo?.hasUvOnly &&
                                <InputText label={'Reject water'} id={'reject_water'} name={'flow_value'} required
                                    value={productInForm?.current_condition?.reject_water?.flow_value}
                                    onChange={handleChangeRejectWaterFlow} type='number' min={0}
                                    rightIcon={productInForm?.current_condition?.reject_water?.flow_status ? <Badge
                                        value={toStandardText(productInForm?.current_condition?.reject_water?.flow_status)}
                                        severity={productInForm?.current_condition?.reject_water?.flow_status === "NORMAL" ? 'primary' : "danger"}
                                    /> : ''} />}
                        </div>
                    </div>

                    {/* PH */}
                    {productInfo?.hasAlkaline &&
                        <div className="form-section">
                            <h3 className='subtitle'>Potential of Hydrogen (PH)</h3>
                            <div className="box-col1">
                                <InputText label={'PH'} id={'ph'} name={'ph'} required
                                    value={productInForm?.current_condition?.ph?.value}
                                    onChange={handleChangePh} type='number' step={0.1} min={0}
                                    rightIcon={productInForm?.current_condition?.ph?.status ? <Badge
                                        value={toStandardText(productInForm?.current_condition?.ph?.status)}
                                        severity={productInForm?.current_condition?.ph?.status === "NORMAL" ? 'primary' : "danger"}
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
                                    checked={productInForm?.current_condition?.uv_status === 'WORKING'}
                                    required
                                />
                                <RadioCard
                                    label="Not working"
                                    description="Have a complaint"
                                    name="uv_status"
                                    id="uv_not_ok"
                                    radioValue="NOT_WORKING"
                                    onChange={updateDirectInputs}
                                    checked={productInForm?.current_condition?.uv_status === 'NOT_WORKING'}
                                    required
                                />
                            </div>
                        </div>}


                    {/* Leak */}
                    <div className="form-section">
                        <h3 className='subtitle'>Leak</h3>
                        <div className="box-col2">
                            <RadioCard
                                label="Yes"
                                description="Have a complaint"
                                name="leak_status"
                                id="leak_yes"
                                radioValue="YES"
                                onChange={updateLeakStatus}
                                checked={productInForm?.current_condition?.leak_status === true}
                                required
                            />
                            <RadioCard
                                label="No"
                                description="Leak not detected"
                                name="leak_status"
                                id="leak_no"
                                radioValue="NO"
                                onChange={updateLeakStatus}
                                checked={productInForm?.current_condition?.leak_status === false}
                                required
                            />
                        </div>
                        {productInForm?.current_condition?.leak_status &&
                            <div className="box-col1" style={{ marginTop: '10px' }}>
                                <InputText label={'Describe leak'} id={'leak_comment'} name={'leak_comment'} required
                                    value={productInForm?.current_condition?.leak_comment}
                                    onChange={updateDirectInputs} />
                            </div>}
                    </div>

                    {/* Scratch and crack */}
                    <div className="form-section">
                        <h3 className='subtitle'>Scratch and Crack</h3>
                        <div className="box-col2">
                            <RadioCard
                                label="Yes"
                                description="Have a complaint"
                                name="scratch_crack_status"
                                id="scratch_yes"
                                radioValue="YES"
                                onChange={updateScratchStatus}
                                checked={productInForm?.current_condition?.scratch_crack_status === true}
                                required
                            />
                            <RadioCard
                                label="No"
                                description="Leak not detected"
                                name="scratch_crack_status"
                                id="scratch_no"
                                radioValue="NO"
                                onChange={updateScratchStatus}
                                checked={productInForm?.current_condition?.scratch_crack_status === false}
                                required
                            />
                        </div>
                        {productInForm?.current_condition?.scratch_crack_status &&
                            <div className="box-col1" style={{ marginTop: '10px' }}>
                                <InputText label={'Describe scratch & crack'} id={'scratch_crack_comment'} name={'scratch_crack_comment'} required
                                    value={productInForm?.current_condition?.scratch_crack_comment}
                                    onChange={updateDirectInputs} />
                            </div>}
                    </div>
                </>}

                {/* Other */}
                <div className="form-section">
                    <h3 className='subtitle'>Other contaminants <Badge value={'Optional'} /></h3>
                    <div className="box-col1">
                        <Textarea label={'Describe'} id={'contaminants'} name={'contaminants'}
                            value={productInForm?.current_condition?.contaminants}
                            onChange={updateDirectInputs} />
                    </div>
                </div>

                <div className="submit-section">
                    <Button label={'Next'} severity={'secondary'} rounded style={{ width: '100%' }} />
                </div>

            </form>
        </div>
    )
}

export default WpCurrentCondition