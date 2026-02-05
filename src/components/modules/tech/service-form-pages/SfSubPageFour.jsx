import React, { useEffect, useMemo, useState } from 'react'
import './sub-page-style.scss'
import { useDispatch, useSelector } from 'react-redux'
import { serviceFormSubPageRoute } from '../../../../assets/javascript/pre_data/service'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import Radio from '../../../UI_Primitives/inputs/Radio'
import Button from '../../../UI_Primitives/buttons/Button'

const SfSubPageFour = ({ page, resources, changeSubmitStatus }) => {
    const dispatch = useDispatch();
    const { serviceFormSettings, serviceForm } = useSelector((state) => state.application)
    const orderId = serviceFormSettings?.activeProduct?.[1] || null
    const [waterColors, setWaterColors] = useState([])
    const [waterOdors, setWaterOdors] = useState([])

    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);


    const updateEvaluation = (e, subKey) => {
        const { name, value } = e.target;

        changeSubmitStatus(false)

        dispatch(sfActions.updateProduct({
            evaluation: {
                [subKey]: {
                    ...(productInForm?.evaluation?.[subKey] || {}),
                    [name]: value || null
                }
            }
        }))
    }

    const updateWaterQuality = (e) => {
        changeSubmitStatus(false)
        if (e.target.name === 'status') {
            dispatch(sfActions.updateProduct({
                evaluation: {
                    water_quality: {
                        status: e.target.value,
                        comment: ''
                    }
                }
            }))
        } else {
            dispatch(sfActions.updateProduct({
                evaluation: {
                    water_quality: {
                        ...(productInForm?.evaluation?.water_quality || {}),
                        [e.target.name]: e.target.value || null
                    }
                }
            }))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const productId = serviceFormSettings?.activeProduct?.[0]

        dispatch(sfSetting.updateSubmitStatus({ product_id: productId, is_submitted: true }))
        dispatch(sfSetting.setActiveSubPage(null))
        dispatch(sfSetting.setActiveProduct(null))
    }

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
        <div className="tech-service-form-subpage sf-subpage-four">
            {/* Title */}
            <div className="title-section">
                <h3>{orderId ? `${orderId} : ` : ''}{serviceFormSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
                <p>{serviceFormSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
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
                        <InputText label={'Iron ferrous'} id={'dw_i_ferrous'} name={'i_ferrous'} required value={productInForm?.evaluation?.filtered_water?.i_ferrous}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Iron ferric'} id={'dw_i_ferric'} name={'i_ferric'} required value={productInForm?.evaluation?.filtered_water?.i_ferric}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'PH'} id={'dw_ph'} name={'ph'} required value={productInForm?.evaluation?.filtered_water?.ph}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'TDS'} id={'dw_tds'} name={'tds'} required value={productInForm?.evaluation?.filtered_water?.tds}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Flow'} id={'dw_flow'} name={'flow'} required value={productInForm?.evaluation?.filtered_water?.flow}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} type='number' step={0.1} min={0} />
                        <InputText label={'Other contaminants'} id={'dw_contaminants'} name={'contaminants'} value={productInForm?.evaluation?.filtered_water?.contaminants}
                            onChange={(e) => updateEvaluation(e, 'filtered_water')} />
                    </div>
                </div>

                <div className="form-section filtered-water-section">
                    <h3 className='subtitle'>Water Quality</h3>
                    <div className="box-col1">
                        <Radio label={"Good Quality"} name={'status'} radioValue={'Good'} onChange={updateWaterQuality}
                            checked={productInForm?.evaluation?.water_quality?.status === 'Good'} required />
                        <Radio label={"Poor Quality"} name={'status'} radioValue={'Bad'} onChange={updateWaterQuality}
                            checked={productInForm?.evaluation?.water_quality?.status === 'Bad'} required />
                        {productInForm?.evaluation?.water_quality?.status === 'Bad' &&
                            <InputText label={'Comments'} id={'comment'} name={'comment'} value={productInForm?.evaluation?.water_quality?.comment}
                                onChange={updateWaterQuality} required />}
                    </div>
                </div>

                <div className="submit-section">
                    <Button label={'Save Report'} severity={'primary'} rounded style={{ width: '100%' }} />
                </div>

            </form>
        </div>
    )
}

export default SfSubPageFour