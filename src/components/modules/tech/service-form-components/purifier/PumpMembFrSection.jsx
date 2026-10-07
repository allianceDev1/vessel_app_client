import React, { useMemo } from 'react'
import InputText from '../../../../UI_Primitives/inputs/InputText'
import Badge from '../../../../UI_Primitives/badge/Badge'
import { toStandardText } from '../../../../../utils/helpers/text-formatting'
import { findFilteredWaterFlowStatus, findRejectWaterFlowStatus } from '../../../../../utils/flows/service_form_utils'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions, sfSetting } from '../../../../../redux/features/persisted/applicationSlice'

const PumpMembFrSection = ({ title, index, sectionType, criteria }) => {
    const dispatch = useDispatch();
    const { serviceFormSettings, serviceForm } = useSelector((state) => state.application)

    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);

    const sectionData = productInForm?.pump_membrane_checkups?.[index] || {}

    const handleChangeFilteredWaterFlow = (e) => {
        const { value } = e.target;

        const status = findFilteredWaterFlowStatus(Number(value || 0), Number(criteria?.filtered || 0))

        let data = [...(productInForm?.pump_membrane_checkups || [])]

        data[index] = {
            ...(data[index] || {}),
            index,
            type: sectionType,
            filtered_water: {
                flow_status: status,
                flow_value: value || ''
            }
        }

        if (status === 'NORMAL' && data[index]?.reject_water?.flow_status === 'NORMAL') {
            data = data.slice(0, index + 1)
        }

        dispatch(sfActions.updateProduct.parentValue({
            pump_membrane_checkups: data
        }))

        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const handleChangeRejectWaterFlow = (e) => {
        const { value } = e.target;

        const status = findRejectWaterFlowStatus(Number(value || 0), Number(criteria?.rejected))

        let data = [...(productInForm?.pump_membrane_checkups || [])]

        data[index] = {
            ...(data[index] || {}),
            index,
            type: sectionType,
            reject_water: {
                flow_status: status,
                flow_value: value || ''
            }
        }

        if (status === 'NORMAL' && data[index]?.filtered_water?.flow_status === 'NORMAL') {
            data = data.slice(0, index + 1)
        }

        dispatch(sfActions.updateProduct.parentValue({
            pump_membrane_checkups: data
        }))

        dispatch(sfSetting.productSubmit.resetStatus());
    }



    return (
        <div className="pump-memb-fr-checking-section">
            <div className="form-section">
                <h3 className='subtitle'>{title}</h3>
                <div className="box-col-auto-80">
                    <InputText label={'Filtered water flow'} id={sectionType + 'filtered_water'} name={'flow_value'} required
                        value={sectionData?.filtered_water?.flow_value} type='number' step={0.1} min={0}
                        onChange={handleChangeFilteredWaterFlow} />
                    <div className="info-section"
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: "center", justifyContent: 'space-around',
                            padding: "5px"
                        }}>
                        {sectionData?.filtered_water?.flow_status && <Badge
                            value={toStandardText(sectionData?.filtered_water?.flow_status)}
                            severity={sectionData?.filtered_water?.flow_status === "NORMAL" ? 'primary' : "danger"}
                        />}
                        <p style={{ fontWeight: "500", fontSize: '12px' }}>{criteria?.filtered || 0} Ltr</p>
                    </div>
                </div>
                <div className="box-col-auto-80" style={{ marginTop: "10px" }}>
                    <InputText label={'Reject water flow'} id={sectionType + 'reject_water'} name={'flow_value'} required
                        value={sectionData?.reject_water?.flow_value} type='number' step={0.1} min={0}
                        onChange={handleChangeRejectWaterFlow} />
                    <div className="info-section"
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: "center", justifyContent: 'space-around',
                            padding: "5px"
                        }}>
                        {sectionData?.reject_water?.flow_status && <Badge
                            value={toStandardText(sectionData?.reject_water?.flow_status)}
                            severity={sectionData?.reject_water?.flow_status === "NORMAL" ? 'primary' : "danger"}
                        />}
                        <p style={{ fontWeight: "500", fontSize: '12px' }}>{criteria?.rejected || 0} ml</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PumpMembFrSection