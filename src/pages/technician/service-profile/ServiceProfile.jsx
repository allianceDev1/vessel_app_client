import React, { useEffect, useState } from 'react'
import './service-profile.scss';
import NameCard from '../../../components/modules/tech/customer-profile/NameCard';
import Contacts from '../../../components/modules/tech/customer-profile/Contacts';
import TextAddress from '../../../components/modules/tech/customer-profile/TextAddress';
import RegistrationInfo from '../../../components/modules/tech/customer-profile/RegistrationInfo';
import ServiceInfo from '../../../components/modules/tech/customer-profile/ServiceInfo';
import Button from '../../../components/UI_Primitives/buttons/Button';
import CallLogs from '../../../components/modules/tech/customer-profile/CallLogs';
import Message from '../../../components/UI_Primitives/message/Message';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import PostponeService from '../../../components/forms/common/postpone-service/PostponeService';
import AddCallLog from '../../../components/forms/common/add-call-log/AddCallLog';
import TechScheduleService from '../../../components/forms/tech/schedule-service/TechScheduleService';
import { useDispatch } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbBorderAll, TbCalendarTime, TbCornerUpRightDouble, TbMessage2Plus } from 'react-icons/tb';
import { api } from '../../../api';
import { useParams, useSearchParams } from 'react-router-dom';


const ServiceProfile = () => {
    const dispatch = useDispatch();
    const { customer_id, service_type } = useParams();
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = useState('fetch')
    const [error, setError] = useState({ error: false, title: null, message: null })
    const [customer, setCustomer] = useState({})
    const [upServices, setUpServices] = useState([])
    const [callLogs, setCallLogs] = useState([])
    const [regService, setRegService] = useState({})

    const fetchApi = async () => {
        try {
            setLoading('fetch')
            setError({ error: false, title: null, message: null })

            const apis = [
                api.vfTv2Axios.get(`/customer/${customer_id}/profile`),
                api.vfTv2Axios.get(`/service/${customer_id}/upcoming-services`),
                api.vfTv2Axios.get(`/customer/${customer_id}/call-logs?page=1&limit=20`),
            ]

            if (searchParams.get('reg_id')) {
                apis.push(api.vfTv2Axios.get(`/registered-service/${searchParams.get('reg_id')}/about`),)
            }

            const [customerRes, upServiceRes, callLogsRes, regServiceRes] = await Promise.all(apis);

            setCustomer(customerRes)
            setUpServices(upServiceRes)
            setCallLogs(callLogsRes)
            setRegService(regServiceRes || {})

        } catch (err) {
            setError({ error: true, title: 'Data fetching failed', message: err.message })
        } finally {
            setLoading('')
        }
    }

    const postponeService = () => {
        dispatch(modal.push({
            title: 'Postpone Service',
            body: <PostponeService customerId={customer_id} products={upServices?.products?.filter(p => p.service.service_type === 'SERVICE') || []}
                setUpServices={setUpServices} />
        }))
    }

    const addCallLog = () => {
        dispatch(modal.push({
            title: 'Add Call Log',
            body: <AddCallLog customerId={customer_id} setCallLogs={setCallLogs} />
        }))
    }

    const handleSchedule = () => {
        dispatch(modal.push({
            title: 'Schedule service',
            body: <TechScheduleService registrationId={searchParams.get('reg_id') || null} customerId={customer_id}
                serviceType={service_type === 'renewals' ? 'RENEWAL' : service_type === 'services' ? 'SERVICE' : 'COMPLAINT'} />
        }))
    }

    useEffect(() => {
        dispatch(page.setTitle({}))

        // initial fetch
        fetchApi()

        // eslint-disable-next-line
    }, [])

    // Loading
    if (loading === 'fetch') {
        return <div className="tech-service-profile-page-load">
            <SkeletonGrid
                rows={1}
                columns={1}
                height={80}
            />
            <SkeletonGrid
                rows={1}
                columns={4}
                height={80}
            />
            <SkeletonGrid
                rows={4}
                columns={1}
                height={150}
            />
        </div>
    }

    // Error
    if (error?.error) {
        return <ErrorState
            hight='400px'
            title={error?.title}
            message={error?.message}
            icon={<TbBorderAll />}
        />
    }

    return (
        <div className="tech-service-profile-page">
            <NameCard
                fullName={customer?.customer_name}
                customerId={customer?.cid}
                isActive={true}
                onClick={() => { }}
            />
            <Contacts
                contacts={{
                    primary: customer?.contacts?.primary_number,
                    secondary: customer?.contacts?.secondary_number,
                    whatsapp: customer?.contacts?.whatsapp_number,
                    additional: regService?.customer?.additional_number?.number ? `${regService?.customer?.additional_number?.country_code} ${regService?.customer?.additional_number?.number}` : null
                }}
            />
            <TextAddress
                address={`${customer?.address?.address}, ${customer?.address?.place}, ${customer?.address?.post} - ${customer?.address?.pin_code}, ${customer?.address?.city_name} City`}
                landmark={customer?.address?.land_mark}
                location={{
                    place: customer?.address?.place,
                    post: customer?.address?.post,
                    placeId: customer?.location?.google_place_id || null,
                    lat: customer?.location?.coordinates?.[0] || null,
                    lng: customer?.location?.coordinates?.[1] || null
                }}
            />
            {customer?.note ? <Message message={customer?.note} type={'info'} /> : ''}

            {regService?.registration_id
                ? <RegistrationInfo
                    regId={regService?.registration_id}
                    regStatus={regService?.status?.status_text}
                    regType={regService?.about?.service_type}
                    regTime={new Date(regService?.registered_at).toDateString()}
                    priority={regService?.about?.priority || 0}
                    complaints={regService?.about?.complaint_category?.map((c) => `${c}, `)}
                    note={regService?.about?.comment || null}
                /> : ''}

            <ServiceInfo serviceProducts={upServices?.products || []}
                totalVessels={customer?.total_vessels || 0}
                totalAddOns={customer?.total_add_ons || 0}
                serviceType={service_type}
            />
            {callLogs?.length > 0
                ? <CallLogs data={callLogs} />
                : ''}

            <div className="action-buttons">
                <Button icon={<TbCornerUpRightDouble />} rounded severity={'danger'} onClick={postponeService}
                    disabled={(regService?.registration_id || service_type === 'renewals' || upServices?.products?.filter(p => p.service.service_type === 'SERVICE').length === 0) ? true : false} />
                <Button icon={<TbMessage2Plus />} rounded onClick={addCallLog} />
                <Button icon={<TbCalendarTime />} label={'Schedule'} rounded severity={'primary'} style={{ width: '100%' }}
                    onClick={handleSchedule} />
            </div>
        </div>
    )
}

export default ServiceProfile