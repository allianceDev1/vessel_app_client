import React, { useEffect, useState } from 'react'
import './style.scss'
import { useDispatch } from 'react-redux'
import { price_unit_objects } from '../../../../assets/javascript/pre_data/units';
import { TbMoodAnnoyed } from 'react-icons/tb';
import { toast, modal } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { api } from '../../../../api'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';
import InputText from '../../../UI_Primitives/inputs/InputText';
import Select from '../../../UI_Primitives/inputs/Select';
import Radio from '../../../UI_Primitives/inputs/Radio';
import Button from '../../../UI_Primitives/buttons/Button';
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState';



const UpdatePackageService = ({ packageId, serviceData, setServiceList }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState('')
  const [packages, setPackages] = useState([])
  const [form, setForm] = useState({})
  const [error, setError] = useState({ error: false, title: null, message: null })

  const handleChangeForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleChangeServiceCard = (e) => {
    const value = e.target.value || null;

    if (value) {
      switch (e.target.name) {
        case 'materials_price_type':
          setForm({ ...form, materials_access: true, materials_price_type: e.target.value })
          break;
        case 'bag_price_type':
          setForm({ ...form, bag_access: true, bag_price_type: e.target.value })
          break;
        case 'primary_spare_price_type':
          setForm({ ...form, primary_spare_access: true, primary_spare_price_type: e.target.value })
          break;
        case 'service_price_type':
          setForm({ ...form, service_access: true, service_price_type: e.target.value })
          break;

        default:
          break;
      }
    } else {
      switch (e.target.name) {
        case 'materials_price_type':
          setForm({ ...form, materials_access: false, materials_price_type: null })
          break;
        case 'bag_price_type':
          setForm({ ...form, bag_access: false, bag_price_type: null })
          break;
        case 'vessel_price_type':
          setForm({ ...form, vessel_access: false, vessel_price_type: null })
          break;
        case 'primary_spare_price_type':
          setForm({ ...form, primary_spare_access: false, primary_spare_price_type: null })
          break;
        case 'service_price_type':
          setForm({ ...form, service_access: false, service_price_type: null })
          break;

        default:
          break;
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Update
    setLoading('submit')
    try {

      const body = {
        coverage: [
          {
            coverage_id: "MATERIAL",
            access: form?.materials_access || false,
            price_type: form?.materials_price_type || null
          },
          {
            coverage_id: "MATERIALS_BAG",
            access: form?.bag_access || false,
            price_type: form?.bag_price_type || null
          },
          {
            coverage_id: "PRIMARY_SPARES",
            access: form?.primary_spare_access || false,
            price_type: form?.primary_spare_price_type || null
          },
          {
            coverage_id: "SERVICE_WORK",
            access: form?.service_access || false,
            price_type: form?.service_price_type || null
          }
        ],
        service_limit: form?.service_limit || 0,
        service_charge_applied: form?.service_charge_applied || false,
      }

      await api.vfCv2Axios.put(`/config/service-package/${packageId}/${serviceData?.service_id}`, body)

      setServiceList((state) => state.map((s) => {
        if (s.service_id === serviceData?.service_id) {
          return {
            ...s,
            service_limit: Number(form?.service_limit || 0),
            coverage: {
              MATERIAL: {
                access: form?.materials_access,
                price_type: form?.materials_price_type
              },
              MATERIALS_BAG: {
                access: form?.bag_access,
                price_type: form?.bag_price_type
              },
              PRIMARY_SPARES: {
                access: form?.primary_spare_access,
                price_type: form?.primary_spare_price_type
              },
              SERVICE_WORK: {
                access: form?.service_access,
                price_type: form?.service_price_type
              }
            },
            service_charge_applied: form?.service_charge_applied
          }
        }
        return s
      }))

      dispatch(modal.pull.all())
    } catch (error) {
      dispatch(toast.push({
        type: 'danger',
        head: "Form validation failed",
        message: error.message
      }))
    } finally {
      setLoading('')
    }

  }

  useEffect(() => {

    // Set Form
    setForm({
      service_limit: serviceData?.service_limit || '0',
      bag_access: serviceData?.coverage?.MATERIALS_BAG?.access || false,
      primary_spare_access: serviceData?.coverage?.PRIMARY_SPARES?.access || false,
      materials_access: serviceData?.coverage?.MATERIAL?.access || false,
      service_access: serviceData?.coverage?.SERVICE_WORK?.access || false,
      bag_price_type: serviceData?.coverage?.MATERIALS_BAG?.price_type || null,
      primary_spare_price_type: serviceData?.coverage?.PRIMARY_SPARES?.price_type || null,
      materials_price_type: serviceData?.coverage?.MATERIAL?.price_type || null,
      service_price_type: serviceData?.coverage?.SERVICE_WORK?.price_type || null,
      service_charge_applied: serviceData?.service_charge_applied || false
    })

    //eslint-disable-next-line
  }, [packageId, serviceData])

  // Error
  if (error?.error) {
    return <ErrorState
      hight='400px'
      title={error?.title}
      message={error?.message}
      icon={<TbMoodAnnoyed />}
    />
  }

  return (
    <div className="update-pack-service-modal">
      <form action="" onSubmit={handleSubmit} >
        <div className="inputs">
          <div className="section">
            <InputText label={'Service limit'} name='service_limit' type='number' value={form.service_limit} onChange={handleChangeForm} required min={0}
              helperText={'Enter the service limit. Set 0 for unlimited services.'} />

            <h3 className='sub-title'>Price types</h3>
            <Select label={'Price of Materials'} name={'materials_price_type'} options={[{ label: 'No Access', value: '' }, ...price_unit_objects]}
              onChange={handleChangeServiceCard} value={form.materials_price_type} />
            <Select label={'Price of material bag'} name={'bag_price_type'} options={[{ label: 'No Access', value: '' }, ...price_unit_objects]}
              onChange={handleChangeServiceCard} value={form.bag_price_type} />
            <Select label={'Price of spares'} name={'primary_spare_price_type'} options={[{ label: 'No Access', value: '' }, ...price_unit_objects]}
              onChange={handleChangeServiceCard} value={form.primary_spare_price_type} />
            <Select label={'Price of spares'} name={'service_price_type'} options={[{ label: 'No Access', value: '' }, ...price_unit_objects]}
              onChange={handleChangeServiceCard} value={form.service_price_type} />

            <h4 className='radio-input-label'>Service charge applied <span className={'required-span'}>*</span></h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <Radio label={'Yes'} name={'service_charge_applied'} required radioValue={true} onChange={handleChangeForm} checked={form?.service_charge_applied === true} />
              <Radio label={'No'} name={'service_charge_applied'} radioValue={false} onChange={handleChangeForm} checked={form?.service_charge_applied === false} />
            </div>
          </div>
        </div>
        <div className="button-div">
          <Button label={'Update'} severity={'primary'} rounded style={{ width: '100%' }} spinIcon={loading === 'submit'} />
        </div>
      </form>
    </div>
  )
}

export default UpdatePackageService