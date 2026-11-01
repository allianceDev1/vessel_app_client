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


const VesselFilterV2 = ({ data }) => {

    const currentCondition = data?.current_condition || null;
    const inspectionReport = data?.inspection_report?.tech_analyze?.length ? data?.inspection_report?.tech_analyze : null;
    const evaluation = data?.evaluation || null;


    return (
        <div className="assessment-report-border">
            {/* Current condition */}
            <AssessmentVesselCurrentCondition
                title={'Current Condition (Direct Water)'}
                data={currentCondition?.direct_water}
            />
            <AssessmentVesselCurrentCondition
                title={'Current Condition (Filtered Water)'}
                data={currentCondition?.filtered_water}
            />
            {currentCondition?.storage_tank?.color &&
                <AssessmentVesselCurrentCondition
                    title={'Current Condition (Storage Tank)'}
                    data={currentCondition?.storage_tank}
                />}

            {/* Inspection report */}
            <div className="section-border">
                <h4>Inspection report</h4>

                <ListCol2
                    label={'Condition'}
                    status={data?.inspection_report?.condition_status ? "Good" : 'Bad'}
                />

                {inspectionReport?.map((analyze) => {
                    return <ListCol3Values
                        key={analyze?.nature}
                        label={analyze?.nature}
                        value1={analyze?.reasons?.map(i => `${i}, `)}
                        value2={analyze?.solutions?.map(i => `${i}, `)}
                    />
                })}
            </div>

            {/* Evaluation */}
            <AssessmentVesselCurrentCondition
                title={'Evaluation (Filtered Water)'}
                data={evaluation?.filtered_water}
            />

            <div className="section-border">
                <h4>Evaluation report</h4>

                <ListCol2
                    label={'Water quality'}
                    status={evaluation?.water_quality?.status ? "Good" : 'Bad'}
                />
                {evaluation?.water_quality?.comment &&
                    <ListCol2
                        label={'Comment'}
                        value={evaluation?.water_quality?.comment}
                    />}

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

const ListCol3Values = ({ label, value1, value2 }) => {

    return (
        <div className="list-c3-values">
            <p className='label'>{label}</p>
            <p className='text-value'>{value1}</p>
            <p className='text-value'>{value2}</p>
        </div>
    )
}

const AssessmentVesselCurrentCondition = ({ title, data }) => {
    return (
        <div className="section-border">
            <h4>{title}</h4>
            <ListCol2 label={'Color'} value={data?.color} />
            <ListCol2 label={'Odor'} value={data?.odor} />
            <ListCol2 label={'Iron Ferrous'} value={`${data?.i_ferrous || 0} mg/L`} />
            <ListCol2 label={'Iron Ferric'} value={`${data?.i_ferric || 0} mg/L`} />
            <ListCol2 label={'PH'} value={`${data?.ph || 0} mg/L`} />
            <ListCol2 label={'TDS'} value={`${data?.tds || 0} mg/L`} />
            <ListCol2 label={'Flow'} value={`${data?.flow || 0} mg/L`} />
            <ListCol2 label={'Other Contaminants'} value={data?.contaminants || 'Nil'} />
           
        </div>
    )
}


export default VesselFilterV2