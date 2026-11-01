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


const AddOnV2 = ({ data }) => {

    const currentCondition = data?.current_condition || null;
    const evaluation = data?.evaluation || null;


    return (
        <div className="assessment-report-border">
            {/* Current condition */}
            <div className="section-border">
                <h4>Current condition</h4>

                <ListCol2
                    label={'Working status'}
                    status={currentCondition?.working?.status ? "Good" : 'Bad'}
                />
                {currentCondition?.working?.comment &&
                    <ListCol2
                        label={'Bad comment'}
                        value={currentCondition?.working?.comment}
                    />}

                <ListCol2
                    label={'Leak & Crack'}
                    status={currentCondition?.lead_crack?.status ? "Yes" : 'No'}
                />
                {currentCondition?.lead_crack?.comment &&
                    <ListCol2
                        label={'Leak comment'}
                        value={currentCondition?.lead_crack?.comment}
                    />}
            </div>


            {/* Evaluation */}
            <div className="section-border">
                <h4>Current condition</h4>

                <ListCol2
                    label={'Working status'}
                    status={evaluation?.working?.status ? "Good" : 'Bad'}
                />
                {evaluation?.working?.comment &&
                    <ListCol2
                        label={'Bad comment'}
                        value={evaluation?.working?.comment}
                    />}

                <ListCol2
                    label={'Leak & Crack'}
                    status={evaluation?.lead_crack?.status ? "Yes" : 'No'}
                />
                {evaluation?.lead_crack?.comment &&
                    <ListCol2
                        label={'Leak comment'}
                        value={evaluation?.lead_crack?.comment}
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




export default AddOnV2