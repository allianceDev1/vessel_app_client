import React, { useEffect, useMemo, useState } from 'react'
import './sub-page-style.scss'
import { useDispatch, useSelector } from 'react-redux'
import { serviceFormSubPageRoute } from '../../../../assets/javascript/pre_data/service'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Checkbox from '../../../UI_Primitives/inputs/Checkbox'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import Button from '../../../UI_Primitives/buttons/Button'

const SfSubPageOne = ({ page, resources }) => {
    const dispatch = useDispatch();
    const { serviceFormSettings, serviceForm } = useSelector((state) => state.application)
    const orderId = serviceFormSettings?.activeProduct?.[1] || null
    const [waterColors, setWaterColors] = useState([])
    const [waterOdors, setWaterOdors] = useState([])


    const handleAdditionalTankStatus = (e) => {
        dispatch(sfSetting.update({
            storageTankAvailable: !serviceFormSettings?.storageTankAvailable
        }))

        if (serviceFormSettings?.storageTankAvailable) {
            dispatch(sfActions.updateProduct({
                current_condition: {
                    storage_tank: null
                }
            }))
        }
    }

    const updateCurrentCondition = (e, subKey) => {
        const { name, value } = e.target;

        dispatch(sfActions.updateProduct({
            current_condition: {
                [subKey]: {
                    ...(product?.current_condition?.[subKey] || {}),
                    [name]: value || null
                }
            }
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        dispatch(sfSetting.setActiveSubPage(201))
    }

    const product = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}
    }, [serviceForm?.service_products]);

    useEffect(() => {
        let colorOptions = resources?.filter(r => r.title === 'water_color_variants')?.[0]?.values || []
        colorOptions = colorOptions.sort((a, b) => a.order - b.order)
        colorOptions = colorOptions.map(v => ({ label: v?.data?.[0], value: v?.data?.[0] }))
        setWaterColors(colorOptions)

        let odorOptions = resources?.filter(r => r.title === 'water_odor_variants')?.[0]?.values || []
        odorOptions = odorOptions.sort((a, b) => a.order - b.order)
        odorOptions = odorOptions.map(v => ({ label: v?.data?.[0], value: v?.data?.[0] }))
        setWaterOdors(odorOptions)

    }, [resources])


    return (
        <div className="tech-service-form-subpage sf-subpage-one">
            {/* Title */}
            <div className="title-section">
                <h3>{orderId ? `${orderId} : ` : ''}{serviceFormSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
                <p>{serviceFormSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Direct water */}
                <div className="form-section direct-water-section">
                    <h3 className='subtitle'>Direct Water</h3>
                    <div className="box-col2">
                        <Select label={'Color'} id={'dw_color'} name={'color'} required value={product?.current_condition?.direct_water?.color}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} options={[{}, ...waterColors]} />
                        <Select label={'Smell / Odor'} id={'dw_odor'} name={'odor'} required value={product?.current_condition?.direct_water?.odor}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} options={[{}, ...waterOdors]} />
                        <InputText label={'Iron ferrous'} id={'dw_i_ferrous'} name={'i_ferrous'} required value={product?.current_condition?.direct_water?.i_ferrous}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Iron ferric'} id={'dw_i_ferric'} name={'i_ferric'} required value={product?.current_condition?.direct_water?.i_ferric}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} type='number' step={0.1} min={0} />
                        <InputText label={'PH'} id={'dw_ph'} name={'ph'} required value={product?.current_condition?.direct_water?.ph}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} type='number' step={0.1} min={0} />
                        <InputText label={'TDS'} id={'dw_tds'} name={'tds'} required value={product?.current_condition?.direct_water?.tds}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Flow'} id={'dw_flow'} name={'flow'} required value={product?.current_condition?.direct_water?.flow}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Other contaminants'} id={'dw_contaminants'} name={'contaminants'} value={product?.current_condition?.direct_water?.contaminants}
                            onChange={(e) => updateCurrentCondition(e, 'direct_water')} />
                    </div>
                </div>

                {/* Filtered water */}
                <div className="form-section filtered-water-section">
                    <h3 className='subtitle'>Filtered Water</h3>
                    <div className="box-col2">
                        <Select label={'Color'} id={'dw_color'} name={'color'} required value={product?.current_condition?.filtered_water?.color}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} options={[{}, ...waterColors]} />
                        <Select label={'Smell / Odor'} id={'dw_odor'} name={'odor'} required value={product?.current_condition?.filtered_water?.odor}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} options={[{}, ...waterOdors]} />
                        <InputText label={'Iron ferrous'} id={'dw_i_ferrous'} name={'i_ferrous'} required value={product?.current_condition?.filtered_water?.i_ferrous}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Iron ferric'} id={'dw_i_ferric'} name={'i_ferric'} required value={product?.current_condition?.filtered_water?.i_ferric}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'PH'} id={'dw_ph'} name={'ph'} required value={product?.current_condition?.filtered_water?.ph}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'TDS'} id={'dw_tds'} name={'tds'} required value={product?.current_condition?.filtered_water?.tds}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Flow'} id={'dw_flow'} name={'flow'} required value={product?.current_condition?.filtered_water?.flow}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Other contaminants'} id={'dw_contaminants'} name={'contaminants'} value={product?.current_condition?.filtered_water?.contaminants}
                            onChange={(e) => updateCurrentCondition(e, 'filtered_water')} />
                    </div>
                </div>

                {/* Check Storage tank available */}
                <div className="note">
                    <Checkbox label={'Additional storage tank available'} onChange={handleAdditionalTankStatus}
                        checked={serviceFormSettings?.storageTankAvailable} />
                </div>

                {/* Storage Tank water */}
                {serviceFormSettings?.storageTankAvailable &&
                    <div className="form-section storage-tank-water-section">
                        <h3 className='subtitle'>Storage Tank Water</h3>
                        <div className="box-col2">
                            <Select label={'Color'} id={'dw_color'} name={'color'} required value={product?.current_condition?.storage_tank?.color}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} options={[{}, ...waterColors]} />
                            <Select label={'Smell / Odor'} id={'dw_odor'} name={'odor'} required value={product?.current_condition?.storage_tank?.odor}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} options={[{}, ...waterOdors]} />
                            <InputText label={'Iron ferrous'} id={'dw_i_ferrous'} name={'i_ferrous'} required value={product?.current_condition?.storage_tank?.i_ferrous}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} type='number' step={0.1} min={0} />
                            <InputText label={'Iron ferric'} id={'dw_i_ferric'} name={'i_ferric'} required value={product?.current_condition?.storage_tank?.i_ferric}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} type='number' step={0.1} min={0} />
                            <InputText label={'PH'} id={'dw_ph'} name={'ph'} required value={product?.current_condition?.storage_tank?.ph}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} type='number' step={0.1} min={0} />
                            <InputText label={'TDS'} id={'dw_tds'} name={'tds'} required value={product?.current_condition?.storage_tank?.tds}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} type='number' step={0.1} min={0} />
                            <InputText label={'Flow'} id={'dw_flow'} name={'flow'} required value={product?.current_condition?.storage_tank?.flow}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} type='number' step={0.1} min={0} />
                            <InputText label={'Other contaminants'} id={'dw_contaminants'} name={'contaminants'} value={product?.current_condition?.storage_tank?.contaminants}
                                onChange={(e) => updateCurrentCondition(e, 'storage_tank')} />
                        </div>
                    </div>}

                <div className="submit-section">
                    <Button label={'Next'} rounded style={{ width: '100%' }} />
                </div>

            </form>
        </div>
    )
}

export default SfSubPageOne