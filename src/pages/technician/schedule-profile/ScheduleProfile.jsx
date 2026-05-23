import React, { useEffect, useState } from 'react'
import './schedule-profile.scss';
import NameCard from '../../../components/modules/tech/customer-profile/NameCard';
import Contacts from '../../../components/modules/tech/customer-profile/Contacts';
import TextAddress from '../../../components/modules/tech/customer-profile/TextAddress';
import RegistrationInfo from '../../../components/modules/tech/customer-profile/RegistrationInfo';
import ServiceInfo from '../../../components/modules/tech/customer-profile/ServiceInfo';
import Message from '../../../components/UI_Primitives/message/Message';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import ActionButtons from './ActionButtons';
import { useDispatch, useSelector } from 'react-redux';
import { doDialog, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbBorderAll, } from 'react-icons/tb';
import { api } from '../../../api';
import { useNavigate, useParams } from 'react-router-dom';
import { sfActions, sfSetting } from '../../../redux/features/persisted/applicationSlice';


const ScheduleProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customer_id, registration_id } = useParams();
  const [loading, setLoading] = useState('fetch')
  const [error, setError] = useState({ error: false, title: null, message: null })
  const [customer, setCustomer] = useState({})
  const [upServices, setUpServices] = useState([])
  const [regService, setRegService] = useState({})
  const { serviceForm } = useSelector((state) => state.application)

  const fetchApi = async () => {
    try {
      setLoading('fetch')
      setError({ error: false, title: null, message: null })

      const apis = [
        api.vfTv2Axios.get(`/customer/${customer_id}/profile`),
        api.vfTv2Axios.get(`/service/${customer_id}/upcoming-services`),
        api.vfTv2Axios.get(`/registered-service/${registration_id}/about`)
      ]

      const [customerRes, upServiceRes, regServiceRes] = await Promise.all(apis);

      if (![3, 4].includes(regServiceRes?.status?.status)) {
        navigate('/tech/schedules')
        return;
      }

      setCustomer(customerRes)
      setUpServices(upServiceRes)
      setRegService(regServiceRes || {})


    } catch (err) {
      setError({ error: true, title: 'Data fetching failed', message: err.message })
    } finally {
      setLoading('')
    }
  }



  const handleResetForm = () => {

    const resetServiceForm = () => {
      dispatch(sfActions.clearAll())
      dispatch(sfSetting.clearAll())
    }

    dispatch(doDialog.confirm({
      message: 'Are you sure you want to reset the form ?',
      accept: {
        onClick: resetServiceForm
      }
    }));
  }

  useEffect(() => {
    dispatch(page.setTitle({}))

    // initial fetch
    fetchApi()

    // eslint-disable-next-line
  }, [])

  // Loading
  if (loading === 'fetch') {
    return <div className="tech-schedule-profile-page-load">
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
      size='sm'
      hight='400px'
      title={error?.title}
      message={error?.message}
      icon={<TbBorderAll />}
    />
  }

  return (
    <div className="tech-schedule-profile-page">
      <NameCard
        fullName={customer?.customer_name}
        customerId={customer?.cid}
        isActive={true}
        onClick={() => navigate(`/tech/customer/${customer_id}/about`)}
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
        directionButton
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
        serviceType={`${regService?.about?.service_type}s`}
      />

      {/* Reset Warning */}
      {((regService?.status?.status === 4 && regService?.last_visit?.visit_status === 1 && serviceForm?.registration_id)
        || (regService?.status?.status === 4 && regService?.last_visit?.visit_status === 2 && (serviceForm?.visit_uuid && serviceForm?.visit_uuid !== regService?.last_visit?.visit_id)))
        ? <Message head={'Data Conflict Detected'} message={<>
          <p style={{ textAlign: 'justify' }}>We found existing service data stored in your cache that may conflict with this action.
            To continue safely, you need to clear the cached data first.</p>
          <p style={{ textAlign: 'justify', marginTop: '10px' }}>
            Please click <span onClick={handleResetForm} style={{ textDecoration: "underline", color: 'var(--color-primary)', cursor: 'pointer' }}>Reset</span> to
            clear the cache and proceed with the service without issues.</p>
        </>} type={'warning'} />
        : ''}


      {/* Action buttons */}
      <ActionButtons regData={regService} setRegData={setRegService} />

    </div>
  )
}

export default ScheduleProfile