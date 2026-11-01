import React from 'react'
import './style.scss'
import Badge from '../../../../UI_Primitives/badge/Badge'
import { toStandardText } from '../../../../../utils/helpers/text-formatting'


const findStatusCode = (status) => {
    let statusCode = ''

    switch (status) {
        case 'NO':
        case 'Yes':
        case 'Bad':
        case 'Not working':
            statusCode = 'danger '
            break;

        case 'LOW':
        case 'HIGH':
            statusCode = 'warning '
            break;

        case 'NORMAL':
            statusCode = 'info '
            break;

        case 'Working':
        case 'No':
        case 'Good':
            statusCode = 'success'
            break;

        default:
            break;
    }

    return statusCode;
}


const WaterPurifierV2 = ({ data }) => {

    const currentCondition = data?.current_condition || null;
    const withNewSpun = data?.with_new_spun || null;
    const PMCheckups = data?.pump_membrane_checkups || null;
    const inspectionReport = data?.inspection_report?.tech_analyze?.length ? data?.inspection_report?.tech_analyze : null;
    const evaluation = data?.evaluation || null;


    return (
        <div className="assessment-report-border">
            {/* Current condition */}
            <div className="section-border">
                <h4>Current condition</h4>
                <ListCol2
                    label={'Machine working'}
                    status={currentCondition?.machine_working_status ? 'Working' : 'Not working'}
                />
                {currentCondition?.uv_status && <ListCol2
                    label={'UV status'}
                    value={currentCondition?.uv_status}
                />}
                <ListCol2
                    label={'Pump brand'}
                    value={currentCondition?.pump_brand}
                />
                <ListCol2
                    label={'FR value'}
                    value={currentCondition?.fr_value}
                />
                {currentCondition?.tds?.status && <ListCol3Status
                    label={'TDS'}
                    value={`${currentCondition?.tds?.input} / ${currentCondition?.tds?.output}`}
                    status={currentCondition?.tds?.status}
                />}
                {currentCondition?.filtered_water_flow?.status && <ListCol3Status
                    label={'Filtered water flow'}
                    value={`${currentCondition?.filtered_water_flow?.value}`}
                    status={currentCondition?.filtered_water_flow?.status}
                />}
                {currentCondition?.reject_water_flow?.status && <ListCol3Status
                    label={'Reject water flow'}
                    value={`${currentCondition?.reject_water_flow?.value}`}
                    status={currentCondition?.reject_water_flow?.status}
                />}
                {currentCondition?.ph?.status && <ListCol3Status
                    label={'PH'}
                    value={`${currentCondition?.ph?.value}`}
                    status={currentCondition?.ph?.status}
                />}
                <ListCol3Status
                    label={'Leak'}
                    value={currentCondition?.leak?.comment || ''}
                    status={currentCondition?.leak?.status ? 'Yes' : 'No'}
                />
                <ListCol3Status
                    label={'Scratch & Crack'}
                    value={currentCondition?.scratch_crack?.comment || ''}
                    status={currentCondition?.scratch_crack?.status ? 'Yes' : 'No'}
                />
                <ListCol2
                    label={'Contaminants'}
                    value={currentCondition?.contaminants || 'Nil'}
                />
            </div>

            {/* With new spun */}
            {withNewSpun && <div className="section-border">
                <h4>With new spun</h4>
                {withNewSpun?.tds?.status && <ListCol3Status
                    label={'TDS'}
                    value={`${withNewSpun?.tds?.input} / ${withNewSpun?.tds?.output}`}
                    status={withNewSpun?.tds?.status}
                />}
                {withNewSpun?.filtered_water_flow?.status && <ListCol3Status
                    label={'Filtered water flow'}
                    value={`${withNewSpun?.filtered_water_flow?.value}`}
                    status={withNewSpun?.filtered_water_flow?.status}
                />}
                {withNewSpun?.reject_water_flow?.status && <ListCol3Status
                    label={'Reject water flow'}
                    value={`${withNewSpun?.reject_water_flow?.value}`}
                    status={withNewSpun?.reject_water_flow?.status}
                />}
                {withNewSpun?.ph?.status && <ListCol3Status
                    label={'PH'}
                    value={`${withNewSpun?.ph?.value}`}
                    status={withNewSpun?.ph?.status}
                />}
            </div>}

            {/* Pump and membrane */}
            {!!(data?.membrane_tds?.status || PMCheckups?.length) && <div className="section-border">
                <h4>Pump & Membrane checkup</h4>
                {data?.membrane_tds?.status && <ListCol3Status
                    label={'From membrane TDS'}
                    value={`${data?.membrane_tds?.input} / ${data?.membrane_tds?.output}`}
                    status={data?.membrane_tds?.status}
                />}

                {PMCheckups?.map(c => {
                    return <ListCol3PM
                        key={c?.type}
                        label={(c?.type).toUpperCase()}
                        fw_status={c?.filtered_water_flow?.status}
                        fw_value={c?.filtered_water_flow?.value}
                        rw_status={c?.reject_water_flow?.status}
                        rw_value={c?.reject_water_flow?.value}
                    />
                })}
            </div>}

            {/* Inspection report */}
            {!!(inspectionReport?.length) && <div className="section-border">
                <h4>Inspection report</h4>

                {inspectionReport?.map((analyze) => {
                    return <ListCol3Values
                        key={analyze?.nature}
                        label={analyze?.nature}
                        value1={analyze?.reasons?.map(i => `${i}, `)}
                        value2={analyze?.solutions?.map(i => `${i}, `)}
                    />
                })}
            </div>}

            {/* Evaluation */}
            <div className="section-border">
                <h4>Evaluation</h4>
               
                {evaluation?.uv_status && <ListCol2
                    label={'UV status'}
                    value={evaluation?.uv_status}
                />}
                <ListCol2
                    label={'Pump brand'}
                    value={evaluation?.pump}
                />
                <ListCol2
                    label={'FR value'}
                    value={evaluation?.fr}
                />
                {evaluation?.tds?.status && <ListCol3Status
                    label={'TDS'}
                    value={`${evaluation?.tds?.input} / ${evaluation?.tds?.output}`}
                    status={evaluation?.tds?.status}
                />}
                {evaluation?.filtered_water_flow?.status && <ListCol3Status
                    label={'Filtered water flow'}
                    value={`${evaluation?.filtered_water_flow?.value}`}
                    status={evaluation?.filtered_water_flow?.status}
                />}
                {evaluation?.reject_water_flow?.status && <ListCol3Status
                    label={'Reject water flow'}
                    value={`${evaluation?.reject_water_flow?.value}`}
                    status={evaluation?.reject_water_flow?.status}
                />}
                {evaluation?.ph?.status && <ListCol3Status
                    label={'PH'}
                    value={`${evaluation?.ph?.value}`}
                    status={evaluation?.ph?.status}
                />}
                <ListCol3Status
                    label={'Water Quality'}
                    value={evaluation?.water_quality?.comment || ''}
                    status={evaluation?.water_quality?.status ? 'Good' : 'Bad'}
                />
               
            </div>

        </div>
    )
}


const ListCol2 = ({ label, value = null, status = null }) => {
    // only pass value or status , both not list
    return (
        <div className="list-c2">
            <p className='label'>{label}</p>
            {value && !status && <p className='text-value'>{value}</p>}
            {status && !value && <Badge
                value={toStandardText(status)}
                severity={findStatusCode(status)}
            />}
        </div>
    )
}

const ListCol3Status = ({ label, value, status }) => {

    return (
        <div className="list-c3">
            <p className='label'>{label}</p>
            <p className='text-value'>{value}</p>
            <Badge
                value={toStandardText(status)}
                severity={findStatusCode(status)}
            />
        </div>
    )
}

const ListCol3Values = ({ label, value1, value2 }) => {

    return (
        <div className="list-c3-values">
            <p className='label'>{label}</p>
            <p className='text-value'>{value1}</p>
            <p className='text-value'>{value2}</p>
        </div>
    )
}

const ListCol3PM = ({ label, fw_status, fw_value, rw_status, rw_value }) => {

    return (
        <div className="list-c3PM">
            <p className='label'>{label}</p>
            <p className='text-value'>{fw_value}</p>
            <Badge
                value={toStandardText(fw_status)}
                severity={findStatusCode(fw_status)}
            />
            <p className='text-value'>{rw_value}</p>
            <Badge
                value={toStandardText(rw_status)}
                severity={findStatusCode(rw_status)}
            />
        </div>
    )
}


export default WaterPurifierV2