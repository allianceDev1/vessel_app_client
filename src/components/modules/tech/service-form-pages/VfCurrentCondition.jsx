import React, { useEffect, useMemo, useState } from 'react'
import './sub-page-style.scss'
import { useDispatch, useSelector } from 'react-redux'
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Checkbox from '../../../UI_Primitives/inputs/Checkbox'
import Button from '../../../UI_Primitives/buttons/Button'

const VfCurrentCondition = ({ pageKey }) => {
    const dispatch = useDispatch();
    const { formResources, serviceFormSettings, serviceForm } = useSelector((state) => state.application)
    const [waterColors, setWaterColors] = useState([])
    const [waterOdors, setWaterOdors] = useState([])


    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);

    const handleAdditionalTankStatus = () => {

        dispatch(sfActions.updateProduct.innerFields({
            current_condition: {
                storage_tank: productInForm?.current_condition?.storage_tank ? null : {}
            }
        }))

        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const updateCurrentCondition = (e, subKey) => {
        const { name, value } = e.target;

        dispatch(sfActions.updateProduct.innerFields({
            current_condition: {
                [subKey]: {
                    ...(productInForm?.current_condition?.[subKey] || {}),
                    [name]: value || null
                }
            }
        }))

        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        dispatch(sfSetting.page.next(1201))
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
        <div className="tech-service-form-subpage sf-subpage-one">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.find(p => p.key === pageKey)?.title}</h3>
                <p>{serviceFormPageRoute?.find(p => p.key === pageKey)?.description}</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Direct water */}
                <div className="form-section direct-water-section">
                    <h3 className='subtitle'>Direct Water</h3>
                    <div className="box-col2">
                        <Select label={'Color'} id={'dw_color'} name={'color'} required value={productInForm?.current_condition?.direct_water?.color}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} options={[{}, ...waterColors]} />
                        <Select label={'Smell / Odor'} id={'dw_odor'} name={'odor'} required value={productInForm?.current_condition?.direct_water?.odor}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} options={[{}, ...waterOdors]} />
                        <InputText label={'Iron ferrous (mg/L)'} id={'dw_i_ferrous'} name={'i_ferrous'} required value={productInForm?.current_condition?.direct_water?.i_ferrous}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Iron ferric (mg/L)'} id={'dw_i_ferric'} name={'i_ferric'} required value={productInForm?.current_condition?.direct_water?.i_ferric}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} type='number' step={0.1} min={0} />
                        <InputText label={'PH (mg/L)'} id={'dw_ph'} name={'ph'} required value={productInForm?.current_condition?.direct_water?.ph}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} type='number' step={0.1} min={0} />
                        <InputText label={'TDS (mg/L)'} id={'dw_tds'} name={'tds'} required value={productInForm?.current_condition?.direct_water?.tds}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Flow (L/min)'} id={'dw_flow'} name={'flow'} required value={productInForm?.current_condition?.direct_water?.flow}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Other contaminants'} id={'dw_contaminants'} name={'contaminants'} value={productInForm?.current_condition?.direct_water?.contaminants}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} />
                    </div>
                </div>

                {/* Filtered water */}
                <div className="form-section filtered-water-section">
                    <h3 className='subtitle'>Filtered Water</h3>
                    <div className="box-col2">
                        <Select label={'Color'} id={'dw_color'} name={'color'} required value={productInForm?.current_condition?.filtered_water?.color}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} options={[{}, ...waterColors]} />
                        <Select label={'Smell / Odor'} id={'dw_odor'} name={'odor'} required value={productInForm?.current_condition?.filtered_water?.odor}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} options={[{}, ...waterOdors]} />
                        <InputText label={'Iron ferrous (mg/L)'} id={'dw_i_ferrous'} name={'i_ferrous'} required value={productInForm?.current_condition?.filtered_water?.i_ferrous}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Iron ferric (mg/L)'} id={'dw_i_ferric'} name={'i_ferric'} required value={productInForm?.current_condition?.filtered_water?.i_ferric}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'PH (mg/L)'} id={'dw_ph'} name={'ph'} required value={productInForm?.current_condition?.filtered_water?.ph}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'TDS (mg/L)'} id={'dw_tds'} name={'tds'} required value={productInForm?.current_condition?.filtered_water?.tds}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Flow (L/min)'} id={'dw_flow'} name={'flow'} required value={productInForm?.current_condition?.filtered_water?.flow}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Other contaminants'} id={'dw_contaminants'} name={'contaminants'} value={productInForm?.current_condition?.filtered_water?.contaminants}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} />
                    </div>
                </div>

                {/* Check Storage tank available */}
                <div className="note">
                    <Checkbox label={'Additional storage tank available'} onChange={handleAdditionalTankStatus}
                        checked={productInForm?.current_condition?.storage_tank} />
                </div>

                {/* Storage Tank water */}
                {productInForm?.current_condition?.storage_tank &&
                    <div className="form-section storage-tank-water-section">
                        <h3 className='subtitle'>Storage Tank Water</h3>
                        <div className="box-col2">
                            <Select label={'Color'} id={'dw_color'} name={'color'} required value={productInForm?.current_condition?.storage_tank?.color}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} options={[{}, ...waterColors]} />
                            <Select label={'Smell / Odor'} id={'dw_odor'} name={'odor'} required value={productInForm?.current_condition?.storage_tank?.odor}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} options={[{}, ...waterOdors]} />
                            <InputText label={'Iron ferrous (mg/L)'} id={'dw_i_ferrous'} name={'i_ferrous'} required value={productInForm?.current_condition?.storage_tank?.i_ferrous}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} type='number' step={0.1} min={0} />
                            <InputText label={'Iron ferric (mg/L)'} id={'dw_i_ferric'} name={'i_ferric'} required value={productInForm?.current_condition?.storage_tank?.i_ferric}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} type='number' step={0.1} min={0} />
                            <InputText label={'PH (mg/L)'} id={'dw_ph'} name={'ph'} required value={productInForm?.current_condition?.storage_tank?.ph}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} type='number' step={0.1} min={0} />
                            <InputText label={'TDS (mg/L)'} id={'dw_tds'} name={'tds'} required value={productInForm?.current_condition?.storage_tank?.tds}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} type='number' step={0.1} min={0} />
                            <InputText label={'Flow (L/min)'} id={'dw_flow'} name={'flow'} required value={productInForm?.current_condition?.storage_tank?.flow}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} type='number' step={0.1} min={0} />
                            <InputText label={'Other contaminants'} id={'dw_contaminants'} name={'contaminants'} value={productInForm?.current_condition?.storage_tank?.contaminants}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} />
                        </div>
                    </div>}

                <div className="submit-section">
                    <Button label={'Next'} severity={'secondary'} rounded style={{ width: '100%' }} />
                </div>

            </form>
        </div>
    )
}

export default VfCurrentCondition