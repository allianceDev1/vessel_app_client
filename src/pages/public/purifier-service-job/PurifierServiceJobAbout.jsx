import React, { useEffect, useMemo, useState } from 'react'
import './purifier-service-job.scss'
import { useQuery } from '@tanstack/react-query'
import { TbClipboardText } from 'react-icons/tb'
import { api } from '../../../api'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState'
import EmptyState from '../../../components/UI_Primitives/ui-states/EmptyState'
import Badge from '../../../components/UI_Primitives/badge/Badge'
import Button from '../../../components/UI_Primitives/buttons/Button'
import Table from '../../../components/UI_Primitives/table/Table'
import Message from '../../../components/UI_Primitives/message/Message'
import { toStandardText } from '../../../utils/helpers/text-formatting'
import { convertIsoToAmPm, formatDuration, isoToDDMonYYYY } from '../../../utils/helpers/date-helpers'
import { useParams } from 'react-router-dom'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'

const findStatusCode = (status) => {
    const normalized = String(status || '').trim().toUpperCase()

    switch (normalized) {
        case 'NO':
        case 'BAD':
        case 'POOR':
        case 'NOT WORKING':
        case 'NOT_WORKING':
        case 'REJECTED':
        case 'UNPAID':
            return 'danger'

        case 'LOW':
        case 'HIGH':
        case 'PENDING':
        case 'PARTIALLY PAID':
        case 'PARTIALLY_PAID':
            return 'warning'

        case 'NORMAL':
            return 'info'

        case 'YES':
        case 'WORKING':
        case 'GOOD':
        case 'CONFIRMED':
        case 'AUTO CONFIRMED':
        case 'PAID':
            return 'success'

        default:
            return 'info'
    }
}

const formatCurrency = (val) => {
    const num = Number(val || 0)
    return `₹ ${num.toFixed(2)}`
}

const PurifierServiceJobAbout = () => {
    const dispatch = useDispatch();
    const { service_srl_no } = useParams()


    const { data, isLoading, error } = useQuery({
        queryKey: ['purifier_service_job_about', service_srl_no],
        queryFn: async () => {
            const res = await api.vfPv1Axios.get(`/service/completed/v1.5/${service_srl_no}/about`)
            const job = Array.isArray(res) ? res[0] : res

            if (!job) {
                throw new Error('Service job data not found')
            }

            const grandTotal = Number(
                job?.bill_data?.grand_total_receivable ??
                job?.bill_data?.total_receivable ??
                0
            )
            const paid = Number(job?.total_amount_received ?? 0)
            const balance = Number(
                job?.balance_amount ?? Math.max(0, grandTotal - paid)
            )
            const paymentStatus =
                grandTotal === 0
                    ? 'No Amounts'
                    : balance <= 0 && paid >= grandTotal
                        ? 'Paid'
                        : paid > 0
                            ? 'Partially Paid'
                            : 'Unpaid'
            const paidPercentage =
                grandTotal <= 0 ? 100 : Math.min(100, (paid / grandTotal) * 100)

            return {
                ...job,
                bill_summery: {
                    grand_total: grandTotal,
                    paid,
                    balance,
                    payment_status: paymentStatus,
                    paid_percentage: paidPercentage
                }
            }
        },
        enabled: !!service_srl_no,
        staleTime: 60_000
    })

    useEffect(() => {
        dispatch(page.config({ title: service_srl_no || 'Service srl No', note: "Purifier v1.5 service job view" }))

        // eslint-disable-next-line
    }, [])

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', marginBottom: '40px' }}>
                <SkeletonGrid rows={4} columns={3} height={'70px'}
                    responsive={{ md: { columns: 2, rows: 4, height: '70px' } }} />
                <SkeletonGrid rows={2} columns={3} height={'200px'} gap={'10px'} />
                <SkeletonGrid rows={1} columns={1} height={'180px'} />
            </div>
        )
    }

    if (error || !data) {
        return (
            <ErrorState
                icon={<TbClipboardText />}
                title={'Data not available'}
                message={error?.message || 'Unable to load purifier service job report'}
                hight='400px'
            />
        )
    }

    const serviceData = data?.service_data || {}
    const callDetails = data?.call_details || {}
    const techFeedback = data?.tech_feedback || null

    return (
        <div className="purifier-service-job-about-container">
            {serviceData?.package_continuity_uncomforted && (
                <Message
                    type='warning'
                    head={'Package Renewal Update'}
                    message={'Customer was informed about package continuity/renewal but was not ready to continue at this time.'}
                />
            )}

            {/* General & Service Info */}
            <div className="text-content">
                <div className="item">
                    <p className='label'>Customer ID & Name</p>
                    <div>
                        <p className='text-value'>{data?.name_of_customer || '-'} ({data?.cid || '-'})</p>
                    </div>
                </div>

                <div className="item">
                    <p className='label'>City</p>
                    <div>
                        <p className='text-value'>{data?.city_name || '-'}</p>
                    </div>
                </div>

                <div className="item">
                    <p className='label'>Service Srl No</p>
                    <div>
                        <p className='text-value'>{data?.service_srl_number || '-'}</p>
                    </div>
                </div>

                <div className="item">
                    <p className='label'>Reg No & Type</p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <p className='text-value'>{data?.reg_no || '-'}</p>
                        {data?.reg_type && (
                            <Badge size='small' value={toStandardText(data?.reg_type)} severity={'info'} />
                        )}
                    </div>
                </div>

                <div className="item">
                    <p className='label'>Service / Complaint Index</p>
                    <div>
                        <p className='text-value'>
                            Service: {data?.service_index ?? '-'} | Complaint: {data?.complaint_index ?? '-'}
                        </p>
                    </div>
                </div>

                <div className="item">
                    <p className='label'>Technician</p>
                    <div>
                        <p className='text-value'>{data?.technician || '-'}</p>
                    </div>
                </div>

                <div className="item">
                    <p className='label'>Work & Type</p>
                    <div>
                        <p className='text-value'>
                            {data?.work || '-'} ({data?.work_type || '-'} / {data?.work_method || '-'})
                        </p>
                    </div>
                </div>

                <div className="item">
                    <p className='label'>Service Date</p>
                    <div>
                        <p className='text-value'>{isoToDDMonYYYY(data?.date) || data?.date || '-'}</p>
                    </div>
                </div>

                <div className={`item ${data?.duration && data?.duration <= 600 ? 'warning-item' : ''}`}>
                    <p className='label'>IN & OUT</p>
                    <div>
                        <p className='text-value'>
                            {convertIsoToAmPm(data?.in_time) || '-'} - {convertIsoToAmPm(data?.out_time) || '-'} ({formatDuration(data?.duration)})
                        </p>
                    </div>
                </div>

                <div className="item">
                    <p className='label'>Purifier Customer Status</p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <p className='text-value'>{data?.purifier_customer_status || '-'}</p>
                        {serviceData?.new_customer_status && (
                            <Badge size='small' value={`New: ${serviceData?.new_customer_status}`} severity={'info'} />
                        )}
                    </div>
                </div>

                <div className="item">
                    <p className='label'>Package & SSP Card</p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {data?.package_id || serviceData?.package_name ? (
                            <Badge size='small' value={serviceData?.package_name || data?.package_id} severity={'info'} />
                        ) : (
                            <p className='text-value'>No Package</p>
                        )}
                        {(data?.current_ssp_card_no || serviceData?.ssp_card_number) && (
                            <p className='text-value'>
                                SSP: {serviceData?.ssp_card_number || data?.current_ssp_card_no}
                            </p>
                        )}
                    </div>
                </div>

                <div className="item">
                    <p className='label'>Repeat</p>
                    <div>
                        {serviceData?.repeat_software ? (
                            serviceData?.repeat_tech ? (
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <p className='text-value'>System & Tech :</p>
                                    <Badge size='small' value={'Yes'} severity={'danger'} />
                                    {serviceData?.previous_work_srl_number && (
                                        <p className='text-value'>({serviceData?.previous_work_srl_number})</p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <p className='text-value'>System :</p>
                                        <Badge size='small' value={'Yes'} severity={'danger'} />
                                        <p className='text-value'>Tech :</p>
                                        <Badge size='small' value={'No'} severity={'success'} />
                                    </div>
                                    {serviceData?.why_not_repeat && (
                                        <p className='text-value'>{serviceData?.why_not_repeat}</p>
                                    )}
                                </>
                            )
                        ) : (
                            <Badge size='small' value={'No'} severity={'success'} />
                        )}
                    </div>
                </div>

                {serviceData?.carbon_filter_changed && (
                    <div className="item">
                        <p className='label'>Carbon Filter Changed</p>
                        <div>
                            <p className='text-value'>
                                {isoToDDMonYYYY(serviceData?.carbon_filter_start_date) || serviceData?.carbon_filter_start_date || '-'} to {isoToDDMonYYYY(serviceData?.carbon_filter_expiry_date) || serviceData?.carbon_filter_expiry_date || '-'}
                            </p>
                        </div>
                    </div>
                )}

                {(serviceData?.package_renewal || serviceData?.new_package_activated) && (
                    <div className="item">
                        <p className='label'>
                            {serviceData?.new_package_activated ? 'New Package Activated' : 'Package Renewal'}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Badge size='small' value={serviceData?.package_name || serviceData?.package_id || 'Active'} severity={'success'} />
                            {(serviceData?.package_start_date || serviceData?.package_expiry_date) && (
                                <p className='text-value'>
                                    {isoToDDMonYYYY(serviceData?.package_start_date) || serviceData?.package_start_date} to {isoToDDMonYYYY(serviceData?.package_expiry_date) || serviceData?.package_expiry_date}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="item">
                    <p className='label'>Service Flags</p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Badge
                            size='small'
                            value={`Periodical: ${serviceData?.periodical_service ? 'Yes' : 'No'}`}
                            severity={serviceData?.periodical_service ? 'success' : 'info'}
                        />
                        {serviceData?.cabin_change && (
                            <Badge size='small' value={'Cabin Changed'} severity={'warning'} />
                        )}
                        {serviceData?.above_24 && (
                            <Badge size='small' value={'Above 24 KMs'} severity={'warning'} />
                        )}
                    </div>
                </div>

                {serviceData?.extra_charge_reason && (
                    <div className="item">
                        <p className='label'>Extra Charge Reason</p>
                        <div>
                            <p className='text-value'>{serviceData?.extra_charge_reason}</p>
                        </div>
                    </div>
                )}

                <div className="item">
                    <p className='label'>Call Details</p>
                    <div>
                        <p className='text-value'>
                            Primary/Secondary: {callDetails?.primary_secondary || 0} | Extra: {callDetails?.extra_work || 0} | &gt;24KM: {callDetails?.above_24_kms || 0}
                        </p>
                    </div>
                </div>

                {data?.receipt_send_to && (
                    <div className="item">
                        <p className='label'>Receipt Sent To</p>
                        <div>
                            <p className='text-value'>{data?.receipt_send_to}</p>
                        </div>
                    </div>
                )}

                {techFeedback && (
                    techFeedback?.star_in_ten !== undefined ||
                    techFeedback?.inaccurate_info !== undefined ||
                    techFeedback?.delaying_the_work !== undefined ||
                    techFeedback?.disruptions_in_workflow !== undefined
                ) && (
                        <div className="item">
                            <p className='label'>Technician Feedback</p>
                            <div>
                                <p className='text-value'>
                                    Rating: {techFeedback?.star_in_ten ?? '-'}/10 | Inaccurate: {techFeedback?.inaccurate_info ?? 0} | Delay: {techFeedback?.delaying_the_work ?? 0} | Disruption: {techFeedback?.disruptions_in_workflow ?? 0}
                                </p>
                            </div>
                        </div>
                    )}
            </div>

            {/* Assessments Report */}
            <h4 className='sub-title'>Assessments report</h4>
            <PurifierAssessmentReport data={data} />

            {/* Spares */}
            <h4 className='sub-title'>Spare Parts</h4>
            <PurifierSparesSection
                primarySpares={data?.primary_spares}
                secondarySpares={data?.secondary_spares}
                specialSpares={data?.special_spares}
            />

            {/* Bill & Payment Summary */}
            <h4 className='sub-title'>Billing & Payment Summary</h4>
            <PurifierBillPaymentSection data={data} />

            {/* Signature */}
            {(data?.signature?.url || data?.signature?.name) && (
                <>
                    <h4 className='sub-title'>Customer Signature</h4>
                    <PurifierSignatureSection signature={data?.signature} />
                </>
            )}
        </div>
    )
}

const PurifierAssessmentReport = ({ data }) => {
    const before = data?.before_checking_data || null
    const secondFlow = data?.flow_checking_second_time || null
    const membraneTds = data?.membrane_tds_info || null
    const pmChecking = data?.pump_membrane_checking || []
    const inspection = data?.inspection_report || null
    const evaluation = data?.evaluation_data || null

    const hasSecondFlow = Boolean(
        secondFlow && (
            secondFlow?.tds_status ||
            secondFlow?.filtered_water_flow_status ||
            secondFlow?.reject_water_flow_status ||
            secondFlow?.ph_status ||
            secondFlow?.input_tds !== undefined ||
            secondFlow?.output_tds !== undefined
        )
    )

    const hasPMCheckup = Boolean(
        membraneTds?.tds_status ||
        membraneTds?.input_tds !== undefined ||
        pmChecking?.length > 0
    )

    const hasInspection = Boolean(
        inspection && (
            inspection?.nature_of_complaint?.length ||
            inspection?.reason_of_complaint?.length ||
            inspection?.solution_of_complaint?.length ||
            inspection?.action ||
            inspection?.action_description
        )
    )

    return (
        <div className="assessment-report-border">
            {/* Current condition */}
            {before && (
                <div className="section-border">
                    <h4>Current condition</h4>
                    <ListCol2
                        label={'Machine working'}
                        status={before?.purifier_working_status ? 'Working' : 'Not working'}
                    />
                    {before?.uv_status && (
                        <ListCol2
                            label={'UV status'}
                            value={before?.uv_status}
                        />
                    )}
                    <ListCol2
                        label={'Pump brand'}
                        value={before?.pump || '-'}
                    />
                    <ListCol2
                        label={'FR value'}
                        value={before?.fr !== undefined && before?.fr !== null ? `${before?.fr}` : '-'}
                    />
                    {(before?.tds_status || before?.input_tds !== undefined || before?.output_tds !== undefined) && (
                        <ListCol3Status
                            label={'TDS'}
                            value={`${before?.input_tds ?? '-'} / ${before?.output_tds ?? '-'}`}
                            status={before?.tds_status}
                        />
                    )}
                    {(before?.filtered_water_flow_status || before?.filtered_water_flow_ltrs !== undefined) && (
                        <ListCol3Status
                            label={'Filtered water flow'}
                            value={`${before?.filtered_water_flow_ltrs ?? '-'}`}
                            status={before?.filtered_water_flow_status}
                        />
                    )}
                    {(before?.reject_water_flow_status || before?.reject_water_flow_ltrs !== undefined) && (
                        <ListCol3Status
                            label={'Reject water flow'}
                            value={`${before?.reject_water_flow_ltrs ?? '-'}`}
                            status={before?.reject_water_flow_status}
                        />
                    )}
                    {(before?.ph_status || before?.ph !== undefined) && (
                        <ListCol3Status
                            label={'PH'}
                            value={`${before?.ph ?? '-'}`}
                            status={before?.ph_status}
                        />
                    )}
                    <ListCol3Status
                        label={'Leak'}
                        value={before?.leak_description || ''}
                        status={before?.leak ? 'Yes' : 'No'}
                        invertYesNo
                    />
                    <ListCol3Status
                        label={'Scratch & Crack'}
                        value={before?.scratch_crack_description || ''}
                        status={before?.scratch_crack ? 'Yes' : 'No'}
                        invertYesNo
                    />
                    <ListCol2
                        label={'Other complaints'}
                        value={before?.other_complaints || 'Nil'}
                    />
                </div>
            )}

            {/* With new spun */}
            {hasSecondFlow && (
                <div className="section-border">
                    <h4>With new spun</h4>
                    {(secondFlow?.tds_status || secondFlow?.input_tds !== undefined) && (
                        <ListCol3Status
                            label={'TDS'}
                            value={`${secondFlow?.input_tds ?? '-'} / ${secondFlow?.output_tds ?? '-'}`}
                            status={secondFlow?.tds_status}
                        />
                    )}
                    {(secondFlow?.filtered_water_flow_status || secondFlow?.filtered_water_flow_ltrs !== undefined) && (
                        <ListCol3Status
                            label={'Filtered water flow'}
                            value={`${secondFlow?.filtered_water_flow_ltrs ?? '-'}`}
                            status={secondFlow?.filtered_water_flow_status}
                        />
                    )}
                    {(secondFlow?.reject_water_flow_status || secondFlow?.reject_water_flow_ltrs !== undefined) && (
                        <ListCol3Status
                            label={'Reject water flow'}
                            value={`${secondFlow?.reject_water_flow_ltrs ?? '-'}`}
                            status={secondFlow?.reject_water_flow_status}
                        />
                    )}
                    {(secondFlow?.ph_status || secondFlow?.ph !== undefined) && (
                        <ListCol3Status
                            label={'PH'}
                            value={`${secondFlow?.ph ?? '-'}`}
                            status={secondFlow?.ph_status}
                        />
                    )}
                </div>
            )}

            {/* Pump and membrane */}
            {hasPMCheckup && (
                <div className="section-border">
                    <h4>Pump & Membrane checkup</h4>
                    {(membraneTds?.tds_status || membraneTds?.input_tds !== undefined) && (
                        <ListCol3Status
                            label={'From membrane TDS'}
                            value={`${membraneTds?.input_tds ?? '-'} / ${membraneTds?.output_tds ?? '-'}`}
                            status={membraneTds?.tds_status}
                        />
                    )}

                    {pmChecking?.map((c, idx) => (
                        <ListCol3PM
                            key={c?.index ?? `${c?.type}-${idx}`}
                            label={(c?.type || `Check ${idx + 1}`).toUpperCase()}
                            fw_status={c?.filter_water_status}
                            fw_value={c?.filter_water}
                            rw_status={c?.reject_water_status}
                            rw_value={c?.reject_water}
                        />
                    ))}
                </div>
            )}

            {/* Inspection report */}
            {hasInspection && (
                <div className="section-border">
                    <h4>Inspection report</h4>
                    {inspection?.nature_of_complaint?.length > 0 && (
                        <div className="inspection-block">
                            <p className="label">Nature of Complaint</p>
                            <p className="text-value">{inspection.nature_of_complaint.join(', ')}</p>
                        </div>
                    )}
                    {inspection?.reason_of_complaint?.length > 0 && (
                        <div className="inspection-block">
                            <p className="label">Reason of Complaint</p>
                            <p className="text-value">{inspection.reason_of_complaint.join(', ')}</p>
                        </div>
                    )}
                    {inspection?.solution_of_complaint?.length > 0 && (
                        <div className="inspection-block">
                            <p className="label">Solution of Complaint</p>
                            <p className="text-value">{inspection.solution_of_complaint.join(', ')}</p>
                        </div>
                    )}
                    {inspection?.action && (
                        <ListCol2 label={'Action'} value={inspection?.action} />
                    )}
                    {inspection?.action_description && (
                        <ListCol2 label={'Action description'} value={inspection?.action_description} />
                    )}
                </div>
            )}

            {/* Evaluation */}
            {evaluation && (
                <div className="section-border">
                    <h4>Evaluation</h4>
                    {evaluation?.uv_status && (
                        <ListCol2
                            label={'UV status'}
                            value={evaluation?.uv_status}
                        />
                    )}
                    <ListCol2
                        label={'Pump brand'}
                        value={evaluation?.pump || '-'}
                    />
                    <ListCol2
                        label={'FR value'}
                        value={evaluation?.fr !== undefined && evaluation?.fr !== null ? `${evaluation?.fr}` : '-'}
                    />
                    {(evaluation?.tds_status || evaluation?.input_tds !== undefined || evaluation?.output_tds !== undefined) && (
                        <ListCol3Status
                            label={'TDS'}
                            value={`${evaluation?.input_tds ?? '-'} / ${evaluation?.output_tds ?? '-'}`}
                            status={evaluation?.tds_status}
                        />
                    )}
                    {(evaluation?.filtered_water_flow_status || evaluation?.filtered_water_flow_ltrs !== undefined) && (
                        <ListCol3Status
                            label={'Filtered water flow'}
                            value={`${evaluation?.filtered_water_flow_ltrs ?? '-'}`}
                            status={evaluation?.filtered_water_flow_status}
                        />
                    )}
                    {(evaluation?.reject_water_flow_status || evaluation?.reject_water_flow_ltrs !== undefined) && (
                        <ListCol3Status
                            label={'Reject water flow'}
                            value={`${evaluation?.reject_water_flow_ltrs ?? '-'}`}
                            status={evaluation?.reject_water_flow_status}
                        />
                    )}
                    {(evaluation?.ph_status || evaluation?.ph !== undefined) && (
                        <ListCol3Status
                            label={'PH'}
                            value={`${evaluation?.ph ?? '-'}`}
                            status={evaluation?.ph_status}
                        />
                    )}
                    {evaluation?.water_quality && (
                        <ListCol3Status
                            label={'Water Quality'}
                            value={evaluation?.poor_reason || ''}
                            status={evaluation?.water_quality}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

const PurifierSparesSection = ({ primarySpares = [], secondarySpares = [], specialSpares = [] }) => {
    const [activeSection, setActiveSection] = useState('')

    useEffect(() => {
        setActiveSection(
            primarySpares?.length
                ? 'primary_spares'
                : secondarySpares?.length
                    ? 'secondary_spares'
                    : specialSpares?.length
                        ? 'special_spares'
                        : ''
        )
    }, [primarySpares, secondarySpares, specialSpares])

    const { tableColumns, tableData } = useMemo(() => {
        const columns = [
            { header: 'Spare ID', accessorKey: 'Spare ID', enableHiding: false },
            { header: 'Spare Name', accessorKey: 'Spare Name', enableHiding: false },
            { header: 'MRP', accessorKey: 'MRP' },
            { header: 'Tally Rate', accessorKey: 'Tally Rate' },
            { header: 'Rate', accessorKey: 'Rate' },
            { header: 'Qty', accessorKey: 'Qty' },
            { header: 'Discount', accessorKey: 'Discount' },
            { header: 'Total', accessorKey: 'Total' }
        ]

        const mapSpares = (list = []) =>
            list.map((spare) => {
                const rate = Number(spare?.rate || 0)
                const qty = Number(spare?.quantity || 0)
                return {
                    'Spare ID': spare?.spare_id || '-',
                    'Spare Name': `${spare?.spare_name || '-'}${spare?.warranty ? ' (Under Warranty)' : ''}`,
                    'MRP': `₹ ${spare?.mrp ?? 0}`,
                    'Tally Rate': `₹ ${spare?.tally_rate ?? 0}`,
                    'Rate': `₹ ${rate}`,
                    'Qty': `${qty}`,
                    'Discount': `${spare?.discount_percentage ?? 0}%`,
                    'Total': `₹ ${(rate * qty).toFixed(2)}`
                }
            })

        switch (activeSection) {
            case 'primary_spares':
                return { tableColumns: columns, tableData: mapSpares(primarySpares) }
            case 'secondary_spares':
                return { tableColumns: columns, tableData: mapSpares(secondarySpares) }
            case 'special_spares':
                return { tableColumns: columns, tableData: mapSpares(specialSpares) }
            default:
                return { tableColumns: columns, tableData: [] }
        }
    }, [activeSection, primarySpares, secondarySpares, specialSpares])

    const hasAnySpares = Boolean(
        primarySpares?.length || secondarySpares?.length || specialSpares?.length
    )

    if (!hasAnySpares) {
        return (
            <EmptyState
                title={'No Spare Parts Used'}
                hight='200px'
            />
        )
    }

    return (
        <div className="table-list">
            <div className="table-menu">
                {primarySpares?.length > 0 && (
                    <Button
                        severity={'secondary'}
                        label={`Primary Spares (${primarySpares.length})`}
                        rounded
                        outlined={activeSection !== 'primary_spares'}
                        size='small'
                        onClick={() => setActiveSection('primary_spares')}
                    />
                )}
                {secondarySpares?.length > 0 && (
                    <Button
                        severity={'secondary'}
                        label={`Secondary Spares (${secondarySpares.length})`}
                        rounded
                        outlined={activeSection !== 'secondary_spares'}
                        size='small'
                        onClick={() => setActiveSection('secondary_spares')}
                    />
                )}
                {specialSpares?.length > 0 && (
                    <Button
                        severity={'secondary'}
                        label={`Special Spares (${specialSpares.length})`}
                        rounded
                        outlined={activeSection !== 'special_spares'}
                        size='small'
                        onClick={() => setActiveSection('special_spares')}
                    />
                )}
            </div>

            <div className="table-box">
                <Table
                    key={`purifier_spares_${activeSection}`}
                    columns={tableColumns}
                    data={tableData}
                    tableKey="purifier_service_job_spares"
                />
            </div>
        </div>
    )
}

const PurifierBillPaymentSection = ({ data }) => {
    const bill = data?.bill_data || {}
    const summary = data?.bill_summery || {}
    const paymentHistory = data?.payment_history || []

    return (
        <>
            <div className="text-content">
                <div className="item">
                    <p className='label'>Receipt Srl No</p>
                    <div>
                        <p className='text-value'>{bill?.receipt_srl_no || '-'}</p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>AMC & SSP Fund</p>
                    <div>
                        <p className='text-value'>
                            AMC: {formatCurrency(bill?.amc_fund)} | SSP: {formatCurrency(bill?.ssp_fund)}
                        </p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Primary Spares (Receivable / Est)</p>
                    <div>
                        <p className='text-value'>
                            {formatCurrency(bill?.primary_spare_total_receivable)} <span style={{ color: 'var(--text-muted)' }}>/ {formatCurrency(bill?.primary_spare_total_est)}</span>
                        </p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Secondary Spares (Receivable / Est)</p>
                    <div>
                        <p className='text-value'>
                            {formatCurrency(bill?.secondary_spare_total_receivable)} <span style={{ color: 'var(--text-muted)' }}>/ {formatCurrency(bill?.secondary_spare_total_est)}</span>
                        </p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Special Work Spares (Receivable / Est)</p>
                    <div>
                        <p className='text-value'>
                            {formatCurrency(bill?.special_work_spare_total_receivable)} <span style={{ color: 'var(--text-muted)' }}>/ {formatCurrency(bill?.special_work_spare_total_est)}</span>
                        </p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Service Charge (Receivable / Est)</p>
                    <div>
                        <p className='text-value'>
                            {formatCurrency(bill?.service_charge_receivable)} <span style={{ color: 'var(--text-muted)' }}>/ {formatCurrency(bill?.service_charge_est)}</span>
                        </p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Extra Charge (Receivable / Est)</p>
                    <div>
                        <p className='text-value'>
                            {formatCurrency(bill?.extra_charge_receivable)} <span style={{ color: 'var(--text-muted)' }}>/ {formatCurrency(bill?.extra_charge_est)}</span>
                        </p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Total (Receivable / Est)</p>
                    <div>
                        <p className='text-value'>
                            {formatCurrency(bill?.total_receivable)} <span style={{ color: 'var(--text-muted)' }}>/ {formatCurrency(bill?.total_est)}</span>
                        </p>
                    </div>
                </div>
                <div className="item">
                    <p className='label'>Compliment Given & Grand Total</p>
                    <div>
                        <p className='text-value'>
                            Compliment: {formatCurrency(bill?.compliment_given_now)} | Grand Total: {formatCurrency(bill?.grand_total_receivable)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="payment-border">
                <div className="summery-box">
                    <div className="amount">
                        <div className="left-section">
                            <h2>₹{(summary?.grand_total || 0).toFixed(2)}</h2>
                            <p>Total Receivable</p>
                        </div>
                        <div className="right-section">
                            <h2>₹{(summary?.paid || 0).toFixed(2)}</h2>
                            <p>Paid Amount</p>
                        </div>
                    </div>
                    <div className="graph">
                        <div className="graph-outer-line">
                            <div
                                className="graph-inner-line"
                                style={{ width: `${summary?.paid_percentage || 0}%` }}
                            ></div>
                        </div>
                        <div className='footer'>
                            <h4>{summary?.payment_status || 'No Amounts'}</h4>
                            <h4>₹{(summary?.balance || 0).toFixed(2)} Balance</h4>
                        </div>
                    </div>
                </div>

                <div className="bills-list">
                    {paymentHistory?.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Method</th>
                                    <th>Breakdown</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentHistory.map((pay, idx) => {
                                    const statusLabel = pay?.rejected
                                        ? 'Rejected'
                                        : pay?.confirm
                                            ? 'Confirmed'
                                            : pay?.auto_confirm
                                                ? 'Auto Confirmed'
                                                : 'Pending'

                                    const breakdownParts = []
                                    if (pay?.cash) breakdownParts.push(`Cash: ₹${pay.cash}`)
                                    if (pay?.bank) breakdownParts.push(`Bank: ₹${pay.bank}`)
                                    if (pay?.cheque) breakdownParts.push(`Cheque: ₹${pay.cheque}`)

                                    return (
                                        <tr key={pay?.pay_id || idx}>
                                            <td>{isoToDDMonYYYY(pay?.received_date) || pay?.received_date || '-'}</td>
                                            <td>{toStandardText(pay?.received_method || '-')}</td>
                                            <td>
                                                {breakdownParts.length > 0
                                                    ? breakdownParts.join(', ')
                                                    : pay?.pending_reason || '-'}
                                            </td>
                                            <td>₹ {(Number(pay?.total_amount) || 0).toFixed(2)}</td>
                                            <td>
                                                <Badge
                                                    size='small'
                                                    value={statusLabel}
                                                    severity={findStatusCode(statusLabel)}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px 0' }}>
                            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No payment history available</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

const PurifierSignatureSection = ({ signature }) => {
    return (
        <div className="signature-border">
            {signature?.url && (
                <div className="signature-image-box">
                    <img src={signature.url} alt={signature?.name || 'Customer Signature'} />
                </div>
            )}
            <div className="signature-meta">
                <p className="label">Signed By</p>
                <p className="text-value">{signature?.name || 'Customer'}</p>
            </div>
        </div>
    )
}

const ListCol2 = ({ label, value = null, status = null }) => {
    return (
        <div className="list-c2">
            <p className='label'>{label}</p>
            {value !== null && !status && <p className='text-value'>{value}</p>}
            {status && !value && (
                <Badge
                    value={toStandardText(status)}
                    severity={findStatusCode(status)}
                />
            )}
        </div>
    )
}

const ListCol3Status = ({ label, value, status, invertYesNo = false }) => {
    let severity = findStatusCode(status)
    if (invertYesNo) {
        const s = String(status || '').toUpperCase()
        if (s === 'YES') severity = 'danger'
        if (s === 'NO') severity = 'success'
    }

    return (
        <div className="list-c3">
            <p className='label'>{label}</p>
            <p className='text-value'>{value}</p>
            {status ? (
                <Badge
                    value={toStandardText(status)}
                    severity={severity}
                />
            ) : (
                <span></span>
            )}
        </div>
    )
}

const ListCol3PM = ({ label, fw_status, fw_value, rw_status, rw_value }) => {
    return (
        <div className="list-c3PM">
            <p className='label'>{label}</p>
            <p className='text-value'>{fw_value ?? '-'}</p>
            <Badge
                value={toStandardText(fw_status || '-')}
                severity={findStatusCode(fw_status)}
            />
            <p className='text-value'>{rw_value ?? '-'}</p>
            <Badge
                value={toStandardText(rw_status || '-')}
                severity={findStatusCode(rw_status)}
            />
        </div>
    )
}

export default PurifierServiceJobAbout