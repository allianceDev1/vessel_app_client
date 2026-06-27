import React, { useEffect, useMemo, useState } from 'react'
import './product-log.scss'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import Badge from '../../../UI_Primitives/badge/Badge'
import Button from '../../../UI_Primitives/buttons/Button'
import Table from '../../../UI_Primitives/table/Table'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../../../../api'
import { getContrastText } from '../../../../utils/helpers/color-utils'
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'


const ProductLogInfo = () => {
    const { service_srl_no, pl_product_id } = useParams();
    const [activeSection, setActionSection] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['service_job_product_log_view', service_srl_no, "pl", pl_product_id],
        queryFn: async () => {
            const data = await api.vfCv2Axios.get(`/service/completed/${service_srl_no}/product-log/${pl_product_id}`);

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
                        { header: 'Remark', accessorKey: 'Remark', }
                    ],
                    tableData: data?.spare_changes?.map((spare) => {
                        return {
                            'Spare Name': spare?.spare_name + `${spare?.under_warranty ? ' (Under Warranty) ' : ''}`,
                            'Category': toStandardText(spare?.spare_category),
                            'Type': toStandardText(spare?.spare_type),
                            'Price': `₹ ${spare?.pricing?.list_price}`,
                            'Qty': `${spare?.qty} ${spare?.unit}`,
                            'Rate': `₹ ${spare?.pricing?.charged}`,
                            'Total': `₹ ${Number(spare?.pricing?.charged) * Number(spare?.qty)}`,
                            'Remark': spare?.less_price_reason
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
                            'Tag': `${work?.refill_included ? 'Refill,' : ''} ${work?.reinstallation_included ? 'Reinstallation,' : ''} ${work?.rent_renewal_included ? 'Rent Renewal,' : ''}`,
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


    if (isLoading) {
        return <div>
            <SkeletonGrid rows={2} columns={3} height={'60px'} gap={'10px'} />
            <SkeletonGrid style={{ marginTop: '15px' }} rows={2} columns={3} height={'200px'} gap={'10px'} />
            <SkeletonGrid style={{ marginTop: '15px' }} rows={1} columns={1} height={'200px'} gap={'10px'} />
        </div>
    }

    return (
        <div className="service-job-product-log-view-container">
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
                {!data?.service_data?.skip_actions &&
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

                {!data?.service_data?.skip_actions &&
                    <div className="item">
                        <p className='label'>Call for the product (Applied / Estimate)</p>
                        <div>
                            <p className='text-value'>
                                {data?.service_data?.call_summery?.call_rate_applied || 0} Call <span style={{ color: 'var(--text-secondary-3)' }}> /  {data?.service_data?.call_summery?.call_rate_estimate || 0} Call</span>
                            </p>
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

            <div className="assessment-report-border">

                {/* Current Condition */}
                {data?.product_type === 'VESSEL_FILTER' && <>
                    {/* Vessel : Current Condition : Direct Water */}
                    <AssessmentVesselCurrentCondition
                        title={'Current Condition (Direct Water)'}
                        data={data?.assessment_report?.current_condition?.direct_water || {}} />

                    {/* Vessel : Current Condition : Filtered Water */}
                    <AssessmentVesselCurrentCondition
                        title={'Current Condition (Filtered Water)'}
                        data={data?.assessment_report?.current_condition?.filtered_water || {}} />

                    {/* Vessel : Current Condition : Filtered Water */}
                    {data?.assessment_report?.current_condition?.storage_tank?.color && <AssessmentVesselCurrentCondition
                        title={'Current Condition (Storage Tank)'}
                        data={data?.assessment_report?.current_condition?.storage_tank || {}} />}
                </>}

                {data?.product_type === 'ADD_ON' && <>
                    {/* AddOn : Current Condition  */}
                    <div className="section-border">
                        <h4>Current Condition</h4>
                        <div className="list">
                            <div className="left">
                                <p className='label'>Working</p>
                            </div>
                            <div className="right">
                                {data?.assessment_report?.current_condition?.working?.status
                                    ? <Badge size='small' value={"Yes"} severity={'success'} />
                                    : <Badge size='small' value={"No"} severity={'danger'} />}
                            </div>
                        </div>
                        {!data?.assessment_report?.current_condition?.working?.status &&
                            <div className="list">
                                <div className="left">
                                    <p className='label'>Working (Reason)</p>
                                </div>
                                <div className="right">
                                    <p className='text-value'>{data?.assessment_report?.current_condition?.working?.comment}</p>
                                </div>
                            </div>}
                        <div className="list">
                            <div className="left">
                                <p className='label'>Lead & Crack</p>
                            </div>
                            <div className="right">
                                {data?.assessment_report?.current_condition?.lead_crack?.status
                                    ? <Badge size='small' value={"Yes"} severity={'danger'} />
                                    : <Badge size='small' value={"No"} severity={'success'} />}
                            </div>
                        </div>
                        {data?.assessment_report?.current_condition?.lead_crack?.status &&
                            <div className="list">
                                <div className="left">
                                    <p className='label'>Lead & Crack (Reason)</p>
                                </div>
                                <div className="right">
                                    <p className='text-value'>{data?.assessment_report?.current_condition?.lead_crack?.comment}</p>
                                </div>
                            </div>}
                    </div>
                </>}

                {/* Inspection Report */}
                {data?.product_type === 'VESSEL_FILTER' && <div className="section-border">
                    <h4>Inspection Report</h4>
                    <div className="list">
                        <div className="left">
                            <p className='label'>Condition</p>
                        </div>
                        <div className="right">
                            {data?.assessment_report?.inspection_report?.condition_status
                                ? <Badge size='small' value={"Good"} severity={'success'} />
                                : <Badge size='small' value={"Bad"} severity={'danger'} />}
                        </div>
                    </div>

                    {data?.assessment_report?.inspection_report?.tech_analyze?.length && <h4>Analyze</h4>}

                    {data?.assessment_report?.inspection_report?.tech_analyze?.map((analyze) => {
                        return <div className="list" key={analyze?.nature}>
                            <div className="left">
                                <p className='label'>{analyze?.nature}</p>
                            </div>
                            <div>
                                <p className='text-value' style={{ textAlign: 'end' }}>{analyze?.reasons?.map(i => `${i}, `)}</p>
                            </div>
                            <div className="right">
                                <p className='text-value' style={{ textAlign: 'end' }}>{analyze?.solutions?.map(i => `${i}, `)}</p>
                            </div>
                        </div>
                    })}
                </div>}

                {/* Evaluation */}
                {data?.product_type === 'VESSEL_FILTER' && <>

                    {/* Vessel : Evaluation : Filtered Water */}
                    <AssessmentVesselCurrentCondition
                        title={'Evaluation (Filtered Water)'}
                        data={data?.assessment_report?.evaluation?.filtered_water || {}} />

                    <div className="section-border">
                        <h4>Evaluation Report</h4>
                        <div className="list">
                            <div className="left">
                                <p className='label'>Water Quality</p>
                            </div>
                            <div className="right">
                                {data?.assessment_report?.evaluation?.water_quality?.status
                                    ? <Badge size='small' value={"Yes"} severity={'success'} />
                                    : <Badge size='small' value={"No"} severity={'danger'} />}
                            </div>
                        </div>
                        {!data?.assessment_report?.evaluation?.water_quality?.status &&
                            <div className="list">
                                <div className="left">
                                    <p className='label'>Water Quality (Reason)</p>
                                </div>
                                <div className="right">
                                    <p className='text-value'>{data?.assessment_report?.evaluation?.water_quality?.comment}</p>
                                </div>
                            </div>}
                    </div>

                </>}

                {data?.product_type === 'ADD_ON' && <>
                    {/* AddOn : Evaluation  */}
                    <div className="section-border">
                        <h4>Evaluation</h4>
                        <div className="list">
                            <div className="left">
                                <p className='label'>Working</p>
                            </div>
                            <div className="right">
                                {data?.assessment_report?.evaluation?.working?.status
                                    ? <Badge size='small' value={"Yes"} severity={'success'} />
                                    : <Badge size='small' value={"No"} severity={'danger'} />}
                            </div>
                        </div>
                        {!data?.assessment_report?.evaluation?.working?.status &&
                            <div className="list">
                                <div className="left">
                                    <p className='label'>Working (Reason)</p>
                                </div>
                                <div className="right">
                                    <p className='text-value'>{data?.assessment_report?.evaluation?.working?.comment}</p>
                                </div>
                            </div>}
                        <div className="list">
                            <div className="left">
                                <p className='label'>Lead & Crack</p>
                            </div>
                            <div className="right">
                                {data?.assessment_report?.evaluation?.lead_crack?.status
                                    ? <Badge size='small' value={"Yes"} severity={'danger'} />
                                    : <Badge size='small' value={"No"} severity={'success'} />}
                            </div>
                        </div>
                        {data?.assessment_report?.evaluation?.lead_crack?.status &&
                            <div className="list">
                                <div className="left">
                                    <p className='label'>Lead & Crack (Reason)</p>
                                </div>
                                <div className="right">
                                    <p className='text-value'>{data?.assessment_report?.evaluation?.lead_crack?.comment}</p>
                                </div>
                            </div>}
                    </div>
                </>}
            </div>

            <h4 className='sub-title'>Spare & Service Works</h4>

            {(data?.spare_changes?.length || data?.removed_spares?.length || data?.service_works?.length) ?
                <div className="table-list">
                    <div className="table-menu">
                        {data?.spare_changes?.length ? <Button label={'Spare Changes'} rounded outlined={activeSection === 'spare_changes' ? false : true} size='small'
                            style={{ width: '130px' }} onClick={() => setActionSection('spare_changes')} /> : ""}
                        {data?.service_works?.length ? <Button label={'Service Works'} rounded outlined={activeSection === 'service_works' ? false : true} size='small'
                            style={{ width: '130px' }} onClick={() => setActionSection('service_works')} /> : ''}
                        {data?.removed_spares?.length ? <Button label={'Removed Spares'} rounded outlined={activeSection === 'removed_spares' ? false : true} size='small'
                            style={{ width: '150px' }} onClick={() => setActionSection('removed_spares')} /> : ''}
                    </div>

                    <div className="table-box">
                        <Table
                            key={'service_job_product_log'}
                            columns={tableColumns}
                            data={tableData}
                            tableKey="service_job_product_log"
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