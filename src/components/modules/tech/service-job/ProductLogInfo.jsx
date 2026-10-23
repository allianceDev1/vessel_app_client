import React, { useEffect, useMemo, useState } from 'react'
import './product-log.scss'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import Badge from '../../../UI_Primitives/badge/Badge'
import Button from '../../../UI_Primitives/buttons/Button'
import Table from '../../../UI_Primitives/table/Table'
import Message from '../../../UI_Primitives/message/Message'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../../../../api'
import { getContrastText } from '../../../../utils/helpers/color-utils'
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState'
import WaterPurifierV2 from './assessments/WaterPurifierV2'
import VesselFilterV2 from '../../controller/service-job/assessments/VesselFilterV2'
import AddOnV2 from '../../controller/service-job/assessments/AddOnV2'


const ProductLogInfo = () => {
    const { service_srl_no, pl_product_id } = useParams();
    const [activeSection, setActionSection] = useState('')


    const { data } = useQuery({
        queryKey: ['service_job_product_log_view', service_srl_no, "pl", pl_product_id],
        queryFn: async () => {
            const data = await api.vfTv2Axios.get(`/completed/${service_srl_no}/product-log/${pl_product_id}`);
            return data
        },
        staleTime: 60_000
    })

    const { tableColumns, tableData } = useMemo(() => {

        switch (activeSection) {
            case 'spare_changes':

                return {
                    tableColumns: [
                        { header: 'Spare Name', accessorKey: 'Spare Name', enableHiding: false },
                        { header: 'Category', accessorKey: 'Category' },
                        { header: 'Type', accessorKey: 'Type' },
                        { header: 'Price', accessorKey: 'Price' },
                        { header: 'Qty', accessorKey: 'Qty' },
                        { header: 'Rate', accessorKey: 'Rate' },
                        { header: 'Total', accessorKey: 'Total' },
                    ],
                    tableData: data?.spare_changes?.map((spare) => {
                        return {
                            'Spare Name': spare?.spare_name + `${spare?.under_warranty ? ' (Under Warranty) ' : ''}`,
                            'Category': toStandardText(spare?.spare_category),
                            'Type': toStandardText(spare?.spare_type),
                            'Price': `₹ ${spare?.pricing?.list_price}`,
                            'Qty': `${spare?.qty} ${spare?.unit}`,
                            'Rate': `₹ ${spare?.pricing?.charged}`,
                            'Total': `₹ ${Number(spare?.pricing?.charged) * Number(spare?.qty)}`
                        }
                    })
                }

            case 'service_works':
                return {
                    tableColumns: [
                        { header: 'Work Name', accessorKey: 'Work Name', enableHiding: false },
                        { header: 'Type', accessorKey: 'Type' },
                        { header: 'Price', accessorKey: 'Price' },
                        { header: 'Rate', accessorKey: 'Rate' },
                        { header: 'Call', accessorKey: 'Call' },
                        { header: 'Tag', accessorKey: 'Tag' },
                        { header: 'Remark', accessorKey: 'Remark', }
                    ],
                    tableData: data?.service_works?.map((work) => {
                        return {
                            'Work Name': work?.work_name + `${work?.under_warranty ? ' (Under Warranty) ' : ''}`,
                            'Type': toStandardText(work?.service_type),
                            'Price': `₹ ${work?.pricing?.list_price}`,
                            'Rate': `₹ ${work?.pricing?.charged}`,
                            'Call': `${work?.call_rate || 0}`,
                            'Tag': `${work?.refill_included ? 'Refill,' : ''} ${work?.reinstallation_included ? 'Reinstallation,' : ''} ${work?.rent_renewal_included ? 'Rent Renewal,' : ''} `,
                            'Remark': work?.less_price_reason
                        }
                    })
                }

            default:
                return {
                    tableColumns: [
                        { header: 'Spare Name', accessorKey: 'Spare Name', enableHiding: false },
                        { header: 'Category', accessorKey: 'Category' },
                        { header: 'Type', accessorKey: 'Type' }
                    ],
                    tableData: data?.removed_spares?.map((spare) => {
                        return {
                            'Spare Name': spare?.spare_name,
                            'Category': toStandardText(spare?.spare_category),
                            'Type': toStandardText(spare?.spare_type)
                        }
                    })
                }
        }

    }, [data, activeSection])

    useEffect(() => {
        setActionSection(
            data?.spare_changes?.length ? 'spare_changes'
                : data?.service_works?.length ? 'service_works'
                    : data?.removed_spares?.length ? 'removed_spares'
                        : ''
        )
    }, [data])


    return (
        <div className="tech-service-job-log-view-container">

            <Message
                type='warning'
                head={'Package Renewal Update'}
                message={'Customer was informed about renewal but is not ready to renew at this time.'}
            />

            <div className="text-content">
                <div className="item">
                    <p className='label'>Product ID & Type</p>
                    <div>
                        <p className='text-value'>{data?.product_id} - {toStandardText(data?.product_type)}</p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Product Name</p>
                    <div>
                        <p className='text-value'>{data?.product_name}</p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Package On Service</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {data?.service_package?.has_service_package
                            ? <>
                                <Badge size='small' value={data?.service_package?.package_name}
                                    style={{ backgroundColor: data?.service_package?.color_code, color: getContrastText(data?.service_package?.color_code) }} />
                                <p className='text-value'>{data?.service_package?.package_srl_no}</p>
                            </>
                            : <p className='text-value'>No Service Package</p>}
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Service Category & Mode</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {!data?.service_data?.skip_actions
                            ? <p className='text-value'>{data?.service_data?.service_category_name} ( {toStandardText(data?.service_data?.mode)} )</p>
                            : <Badge size='small' value={'Skipped'} severity={'warning'} />}
                    </div>
                </div>
                {!data?.service_data?.skip_actions &&
                    <div className="item">
                        <p className='label'>Repeat</p>
                        <div >
                            {data?.service_data?.repeat?.system_say ? <>
                                {data?.service_data?.repeat?.tech_say
                                    ? <>
                                        <Badge size='small' value={'Yes'} severity={'danger'} />
                                    </>
                                    : <>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <p className='text-value'>System :</p>
                                            <Badge size='small' value={'Yes'} severity={'danger'} />

                                            <p className='text-value'>Tech :</p>
                                            <Badge size='small' value={'No'} severity={'success'} />
                                        </div>

                                        <p className='text-value'>{data?.service_data?.repeat?.comment}</p>
                                    </>}
                            </>
                                : <Badge size='small' value={'No'} severity={'success'} />}
                        </div>
                    </div>}
                {data?.service_data?.service_charge?.estimate &&
                    <div className="item">
                        <p className='label'>Service Charge</p>
                        <div>
                            <p className='text-value'>Estimate : ₹ {data?.service_data?.service_charge?.estimate}, Actual : ₹ {data?.service_data?.service_charge?.applied}
                                <br></br>
                                {data?.service_data?.service_charge?.remark}
                            </p>
                        </div>
                    </div>}
                {data?.service_data?.package_renewal?.is_renewed &&
                    <div className="item">
                        <p className='label'>Package Renewal</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Badge size='small' value={data?.service_data?.package_renewal?.package_name}
                                style={{ backgroundColor: data?.service_data?.package_renewal?.color_code, color: getContrastText(data?.service_data?.package_renewal?.color_code) }}
                            />
                            <p className='text-value'>{data?.service_data?.package_renewal?.package_srl_no}</p>
                        </div>
                    </div>}
                {data?.service_data?.rent_renewal?.is_renewed &&
                    <div className="item">
                        <p className='label'>Rent Renewal</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <p className='text-value'>{data?.service_data?.rent_renewal?.work_name}  ({isoToDDMonYYYY(data?.service_data?.rent_renewal?.rent_start_date)} to {isoToDDMonYYYY(data?.service_data?.rent_renewal?.rent_end_date)})</p>
                        </div>
                    </div>}
                <div className="item">
                    <p className='label'>Close Report By System</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {data?.close_report?.closed
                            ? <Badge size='small' value={'Closed'} severity={'success'} />
                            : <Badge size='small' value={'Not Closed'} severity={'danger'} />}
                        <p className='text-value'>{data?.close_report?.comment}</p>
                    </div>
                </div>
            </div>

            <h4 className='sub-title'>Assessments report</h4>

            {data?.product_type === 'WATER_PURIFIER' && <WaterPurifierV2 data={data?.assessment_report} />}
            {data?.product_type === 'VESSEL_FILTER' && <VesselFilterV2 data={data?.assessment_report} />}
            {data?.product_type === 'ADD_ON' && <AddOnV2 data={data?.assessment_report} />}

            <h4 className='sub-title'>Spare & Service Works</h4>

            {(data?.spare_changes?.length || data?.removed_spares?.length || data?.service_works?.length) ?
                <div className="table-list">
                    <div className="table-menu">
                        {data?.spare_changes?.length ? <Button label={'Spare Changes'} rounded outlined={activeSection === 'spare_changes' ? false : true} size='small'
                            style={{ width: '130px' }} onClick={() => setActionSection('spare_changes')} severity={'secondary'} /> : ""}
                        {data?.service_works?.length ? <Button label={'Service Works'} rounded outlined={activeSection === 'service_works' ? false : true} size='small'
                            style={{ width: '130px' }} onClick={() => setActionSection('service_works')} severity={'secondary'} /> : ''}
                        {data?.removed_spares?.length ? <Button label={'Removed Spares'} rounded outlined={activeSection === 'removed_spares' ? false : true} size='small'
                            style={{ width: '150px' }} onClick={() => setActionSection('removed_spares')} severity={'secondary'} /> : ''}
                    </div>

                    <div className="table-box">
                        <Table
                            key={'service_job_product_log'}
                            columns={tableColumns}
                            data={tableData}
                            tableKey="service_job_product_log"
                            columnVisible={{
                                Category: false,
                                Price: false,
                                Call: false,
                                Remark: false,
                                Tag: false
                            }}
                        />
                    </div>
                </div> :
                <EmptyState
                    title={'No Spare Changes & Service Works'}
                    hight='200px'
                />}
        </div>
    )
}

export default ProductLogInfo


const AssessmentVesselCurrentCondition = ({ title, data }) => {
    return (
        <div className="section-border">
            <h4>{title}</h4>
            <div className="list">
                <div className="left">
                    <p className='label'>Color</p>
                </div>
                <div className="right">
                    <p className='text-value'>{data?.color}</p>
                </div>
            </div>
            <div className="list">
                <div className="left">
                    <p className='label'>Odor</p>
                </div>
                <div className="right">
                    <p className='text-value'>{data?.odor}</p>
                </div>
            </div>
            <div className="list">
                <div className="left">
                    <p className='label'>Iron Ferrous</p>
                </div>
                <div className="right">
                    <p className='text-value'>{data?.i_ferrous} mg/L</p>
                </div>
            </div>
            <div className="list">
                <div className="left">
                    <p className='label'>Iron Ferric</p>
                </div>
                <div className="right">
                    <p className='text-value'>{data?.i_ferric} mg/L</p>
                </div>
            </div>
            <div className="list">
                <div className="left">
                    <p className='label'>Ph</p>
                </div>
                <div className="right">
                    <p className='text-value'>{data?.ph} mg/L</p>
                </div>
            </div>
            <div className="list">
                <div className="left">
                    <p className='label'>TDS</p>
                </div>
                <div className="right">
                    <p className='text-value'>{data?.tds} mg/L</p>
                </div>
            </div>
            <div className="list">
                <div className="left">
                    <p className='label'>Flow</p>
                </div>
                <div className="right">
                    <p className='text-value'>{data?.flow} L/min</p>
                </div>
            </div>
            <div className="list">
                <div className="left">
                    <p className='label'>Other Contaminants</p>
                </div>
                <div className="right">
                    <p className='text-value'>{data?.contaminants || 'Nil'}</p>
                </div>
            </div>
        </div>
    )
}