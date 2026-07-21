import React, { useEffect, useState } from 'react'
import './registered-view.scss'
import { useDispatch, useSelector } from 'react-redux';
import { doDialog, modal, page, toast } from '../../../redux/features/non_persisted/miniSystemSlice';
import Button from '../../../components/UI_Primitives/buttons/Button';
import RegistrationInfo from '../../../components/modules/controller/registered-service/RegistrationInfo';
import { useNavigate, useParams } from 'react-router-dom';
import { TbArrowUpRight, TbCalendarUp, TbCalendarX, TbChevronDown, TbExclamationCircle, TbHomeSearch, TbMessage2Plus, TbPencil, TbX } from 'react-icons/tb';
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTimeDiff } from '../../../utils/helpers/date-helpers';
import { api } from '../../../api';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import AddCallLog from '../../../components/forms/common/add-call-log/AddCallLog';
import EditRegistration from '../../../components/forms/controller/registration/EditRegistration';
import RescheduleService from '../../../components/forms/tech/schedule-service/RescheduleService';
import UnscheduleService from '../../../components/forms/tech/schedule-service/UnscheduleService';
import CancelRegistration from '../../../components/forms/controller/registration/CancelRegistration';

const RegisteredView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reg_no } = useParams();
  const queryClient = useQueryClient();
  const [actionOptions, setActionOptions] = useState([])
  const { user } = useSelector((state) => state.user)



  const openEnterCallLogPopUp = ({ customer_id }) => {
    dispatch(modal.push({
      show: true, title: "Enter Call Log",
      body: <AddCallLog customerId={customer_id} isController={true} />
    }))
  }

  const openEditRegistrationPopUp = ({ reg_no }) => {
    dispatch(modal.push({
      show: true, title: "Edit Registration",
      body: <EditRegistration regNo={reg_no} initialData={data} />
    }))
  }

  const openReschedulePopUp = ({ registrationId }) => {
    dispatch(modal.push({
      title: 'Reschedule Service',
      body: <RescheduleService registrationId={registrationId} isController={true} />
    }))
  }

  const openUnschedulePopUp = ({ registrationId }) => {
    dispatch(modal.push({
      title: 'Unschedule Service',
      body: <UnscheduleService registrationId={registrationId} isController={true} />
    }))
  }

  const openCancelRegistrationPopUp = ({ registrationId }) => {
    dispatch(modal.push({
      title: 'Cancel Registration',
      body: <CancelRegistration registrationId={registrationId} />
    }))
  }

  const convertToRND = (regNo) => {
    dispatch(doDialog.confirm({
      message: 'Are you sure, convert the registration to R&D department ?',
      accept: {
        onClick: async () => {
          try {
            await api.cnAv1Axios.post('/service/registration/rnd/convert', {
              product_type: "VESSEL_FILTER",
              registration_id: regNo
            })

            queryClient.setQueryData(
              ['registration_info_controller', regNo],
              (oldData) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  about: {
                    ...(oldData?.about),
                    is_under_rnd: true
                  }
                };
              }
            );

            dispatch(toast.push({
              type: 'success',
              head: 'Converted to R&D',
            }))

          } catch (error) {
            dispatch(toast.push({
              type: 'danger',
              head: 'Conversion Failed',
              message: error?.message || 'Something Wrong'
            }))
          }
        }
      }
    }))
  }

  const retrieveFromRND = (regNo) => {
    dispatch(doDialog.confirm({
      message: 'Are you sure, retrieve the registration from R&D department ?',
      accept: {
        onClick: async () => {
          try {
            await api.cnAv1Axios.post('/service/registration/rnd/retrieve', {
              product_type: "VESSEL_FILTER",
              registration_id: regNo
            })

            queryClient.setQueryData(
              ['registration_info_controller', regNo],
              (oldData) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  about: {
                    ...(oldData?.about),
                    is_under_rnd: false
                  }
                };
              }
            );

            dispatch(toast.push({
              type: 'success',
              head: 'Retrieved from R&D',
            }))

          } catch (error) {
            dispatch(toast.push({
              type: 'danger',
              head: 'Conversion Failed',
              message: error?.message || 'Something Wrong'
            }))
          }
        }
      }
    }))
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['registration_info_controller', reg_no],
    queryFn: async () => {
      const res = await api.vfCv2Axios.get(`/service-registration/registration/${reg_no}`)

      const diff = getTimeDiff(new Date(res?.status?.status_at), new Date(res?.registered_at))

      return { ...res, tat: { day: diff.days, hour: diff.hours, minute: diff.minutes } }
    },
    staleTime: 10_000
  })

  useEffect(() => {
    dispatch(page.setTitle({ title: 'Registration Info', note: "Registration info by reg number." }))

    // eslint-disable-next-line
  }, [])

  useEffect(() => {

    if (!data?.status?.status || !user?.allowed_origins?.some(a => ['vessel_c_writer', 'vessel_c_admin'].includes(a))) {
      return;
    }



    // Actions
    const actions = [
      {
        heading: 'Add & Edit',
        items: [],
      },
      {
        heading: 'Cancel',
        items: [],
      }
    ]

    if ([1, 2, 3, 4].includes(data?.status?.status)) {
      actions[0].items.push(
        { icon: <TbMessage2Plus />, label: 'Add Call Log', onClick: () => openEnterCallLogPopUp({ customer_id: data?.customer?.customer_id }) },
        { icon: <TbPencil />, label: 'Edit Registration', onClick: () => openEditRegistrationPopUp({ reg_no }) },
      )
    }

    if ([1, 2, 3].includes(data?.status?.status) && user?.allowed_origins?.includes('vessel_c_admin')
      && !data?.about.is_under_rnd && data?.about?.service_type === 'COMPLAINT') {

      actions[0].items.push(
        { icon: <TbHomeSearch />, label: 'Convert to R&D', theme: 'info', onClick: () => convertToRND(reg_no) }
      )

    }

    if (data?.status?.status === 3) {
      actions[0].items.push({ icon: <TbCalendarUp />, label: 'Reschedule', onClick: () => openReschedulePopUp({ registrationId: reg_no }) })
      actions[1].items.push({ icon: <TbCalendarX />, label: 'Unschedule', onClick: () => openUnschedulePopUp({ registrationId: reg_no }) })
    }

    if ([1, 2, 3].includes(data?.status?.status) && user?.allowed_origins?.includes('vessel_c_admin') && data?.about.is_under_rnd) {

      actions[1].items.push(
        { icon: <TbHomeSearch />, label: 'Retrieve from R&D', onClick: () => retrieveFromRND(reg_no) }
      )
    }

    if ([1, 2, 3].includes(data?.status?.status)) {
      actions[1].items.push(
        { icon: <TbX />, label: 'Registration', theme: 'danger', disabled: data?.last_visit?.service_srl_no ? true : false, onClick: () => openCancelRegistrationPopUp({ registrationId: reg_no }) }
      )
    }

    setActionOptions(actions)

    // eslint-disable-next-line
  }, [data])




  if (isLoading) {
    return <div className="service-registered-view-page-container">
      <SkeletonGrid rows={6} columns={3} height={'60px'} gap={'10px'}
        responsive={{
          sm: { rows: 12, columns: 1 },
          md: { rows: 8, columns: 2 }
        }} />
    </div>
  }

  if (error) {
    return <div className="service-registered-view-page-container">
      <ErrorState
        icon={<TbExclamationCircle />}
        hight='400px'
        title={'Data Fetching Failed'}
        message={error?.message}
      />
    </div>
  }

  return (
    <div className="service-registered-view-page-container">
      <div className="top-section">
        <div className="left-section">
          <h3>{data?.customer?.customer_name} (CID : {data?.customer?.customer_id})</h3>
          <p>{data?.customer?.address?.address} House, {data?.customer?.address?.place}, P.O {data?.customer?.address?.post}</p>
        </div>
        <div className="right-section">
          <Button label={'Customer'} icon={<TbArrowUpRight />} iconPos='right' size='small' outlined rounded style={{ width: '130px' }}
            onClick={() => navigate(`/controller/customer/${data?.customer?.customer_id}/about`)} />
          <Button label={'Service Jobs'} icon={<TbArrowUpRight />} iconPos='right' size='small' outlined rounded style={{ width: '140px' }}
            onClick={() => navigate(`/controller/completed?fl=Yes&reg_no=${data?.registration_id}`)} />
          {[1, 2, 3, 4].includes(data?.status?.status) && user?.allowed_origins?.some(a => ['vessel_c_writer', 'vessel_c_admin'].includes(a))
            && <Dropdown button={{
              label: 'Actions', icon: <TbChevronDown />,
              iconPos: 'right', rounded: true, outlined: true, size: 'small', style: { width: '120px' }
            }} list={actionOptions} />}
        </div>
      </div>
      <div className="content">
        <div className="section-one">
          <RegistrationInfo data={data} />
          {/* <VisitInfo regNo={params?.reg_no} visitUuid={''} /> */}
        </div>
        {/* <div className="section-two">
          <RegistrationRoute regNo={params?.reg_no} />
        </div> */}
      </div>
    </div>
  )
}

export default RegisteredView