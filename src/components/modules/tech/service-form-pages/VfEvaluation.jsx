import React, { useEffect, useMemo, useState } from 'react'
import './sub-page-style.scss'
import { useDispatch, useSelector } from 'react-redux'
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import Button from '../../../UI_Primitives/buttons/Button'
import RadioCard from '../../../UI_Primitives/inputs/RadioCard'

const VfEvaluation = ({ pageKey }) => {
    const dispatch = useDispatch();
    const { formResources, serviceFormSettings, serviceForm } = useSelector((state) => state.application)
    const [waterColors, setWaterColors] = useState([])
    const [waterOdors, setWaterOdors] = useState([])

    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);

    const updateEvaluation = (e, subKey) => {
        const { name, value } = e.target;

        dispatch(sfActions.updateProduct.innerFields({
            evaluation: {
                [subKey]: {
                    ...(productInForm?.evaluation?.[subKey] || {}),
                    [name]: value || null
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const productId = serviceFormSettings?.activeProduct?.[0]

        dispatch(sfSetting.productSubmit.setStatus({ product_id: productId, is_submitted: true }))
        dispatch(sfSetting.setActiveProduct(null))
        dispatch(sfSetting.page.next(1000))
    }

    useEffect(() => {

        if (formResources?.input_resources?.length) {
            let colorOptions = formResources?.input_resources?.find(r => r.title === 'water_color_variants')?.values || []
            colorOptions = colorOptions.map(v => ({ label: v?.data?.[0], value: v?.data?.[0] }))
            setWaterColors(colorOptions)

            let odorOptions = formResources?.input_resources?.find(r => r.title === 'water_odor_variants')?.values || []
            odorOptions = odorOptions.map(v => ({ label: v?.data?.[0], value: v?.data?.[0] }))
            setWaterOdors(odorOptions)
        }

    }, [formResources])


    return (
        <div className="tech-service-form-subpage sf-subpage-four">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.find(p => p.key === pageKey)?.title}</h3>
                <p>{serviceFormPageRoute?.find(p => p.key === pageKey)?.description}</p>
            </div>

            <form onSubmit={handleSubmit}>

                {/* Filtered water */}
                <div className="form-section filtered-water-section">
                    <h3 className='subtitle'>Filtered Water</h3>
                    <div className="box-col2">
                        <Select label={'Color'} id={'dw_color'} name={'color'} required value={productInForm?.evaluation?.filtered_water?.color}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} options={[{}, ...waterColors]} />
                        <Select label={'Smell / Odor'} id={'dw_odor'} name={'odor'} required value={productInForm?.evaluation?.filtered_water?.odor}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} options={[{}, ...waterOdors]} />
                        <InputText label={'Iron ferrous (mg/L)'} id={'dw_i_ferrous'} name={'i_ferrous'} required value={productInForm?.evaluation?.filtered_water?.i_ferrous}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Iron ferric (mg/L)'} id={'dw_i_ferric'} name={'i_ferric'} required value={productInForm?.evaluation?.filtered_water?.i_ferric}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'PH (mg/L)'} id={'dw_ph'} name={'ph'} required value={productInForm?.evaluation?.filtered_water?.ph}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'TDS (mg/L)'} id={'dw_tds'} name={'tds'} required value={productInForm?.evaluation?.filtered_water?.tds}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Flow (L/min)'} id={'dw_flow'} name={'flow'} required value={productInForm?.evaluation?.filtered_water?.flow}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Other contaminants'} id={'dw_contaminants'} name={'contaminants'} value={productInForm?.evaluation?.filtered_water?.contaminants}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} />
                    </div>
                </div>

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

export default VfEvaluation