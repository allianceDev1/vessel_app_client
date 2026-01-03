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

  const fetchApi = async () => {
    try {
      setLoading('fetch')
      setError({ error: false, title: null, message: null })

      const packageRes = await api.vfCv2Axios.get(`/package/list?product_type=Vessel&fields=package_name`)
      setPackages(packageRes?.map(i => ({ label: i.package_name, value: i.package_id })))

    } catch (err) {
      setError({ error: true, title: 'Data fetching failed', message: err.message })
    } finally {
      setLoading('')
    }


  }

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
        case 'vessel_price_type':
          setForm({ ...form, vessel_access: true, vessel_price_type: e.target.value })
          break;
        case 'primary_spare_price_type':
          setForm({ ...form, primary_spare_access: true, primary_spare_price_type: e.target.value })
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
      await api.vfCv2Axios.put(`/package/${packageId}/${serviceData?.service_id}`, form)

      setServiceList((state) => state.map((s) => {
        if (s.service_id === serviceData?.service_id) {
          return {
            ...s,
            service_limit: Number(form?.service_limit || 0),
            target_package: form?.target_package,
            spare_policies: {
              bag: {
                access: form?.bag_access,
                price_type: form?.bag_price_type
              },
              vessel: {
                access: form?.vessel_access,
                price_type: form?.vessel_price_type
              },
              materials: {
                access: form?.materials_access,
                price_type: form?.materials_price_type
              },
              primary_spare: {
                access: form?.primary_spare_access,
                price_type: form?.primary_spare_price_type
              }
            },
            service_charge_applied: form?.service_charge_applied,
            extra_charge_applied: form?.extra_charge_applied
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
    if (serviceData?.mode === "RENEWAL") {
      // Initial fetch
      fetchApi();
    }

    // Set Form
    setForm({
      service_limit: serviceData?.service_limit || '0',
      target_package: serviceData?.target_package || null,
      bag_access: serviceData?.spare_policies?.bag?.access || false,
      vessel_access: serviceData?.spare_policies?.vessel?.access || false,
      primary_spare_access: serviceData?.spare_policies?.primary_spare?.access || false,
      materials_access: serviceData?.spare_policies?.materials?.access || false,
      bag_price_type: serviceData?.spare_policies?.bag?.price_type || null,
      vessel_price_type: serviceData?.spare_policies?.vessel?.price_type || null,
      primary_spare_price_type: serviceData?.spare_policies?.primary_spare?.price_type || null,
      materials_price_type: serviceData?.spare_policies?.materials?.price_type || null,
      service_charge_applied: serviceData?.service_charge_applied || false,
      extra_charge_applied: serviceData?.extra_charge_applied || false
    })

    //eslint-disable-next-line
  }, [packageId, serviceData])


  // Loading
  if (loading === 'fetch') {
    return <div className="update-pack-service-modal-load">
      <SkeletonGrid
        rows={8}
        columns={2}
        height={48}
      />
    </div>
  }

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

            {serviceData?.mode === "RENEWAL" &&
              <Select label={'Package to be renewed'} name={'target_package'} options={[{}, ...packages]} required
                onChange={handleChangeForm} value={form.target_package} />}

            <h3 className='sub-title'>Price types</h3>
            <div className='input-group'>
              <Select label={'Price of Materials'} name={'materials_price_type'} options={[{ label: 'No Rate', value: '' }, ...price_unit_objects]}
                onChange={handleChangeServiceCard} value={form.materials_price_type} />
              <Select label={'Price of material bag'} name={'bag_price_type'} options={[{ label: 'No Rate', value: '' }, ...price_unit_objects]}
                onChange={handleChangeServiceCard} value={form.bag_price_type} />
              <Select label={'Price of Vessel spare'} name={'vessel_price_type'} options={[{ label: 'No Rate', value: '' }, ...price_unit_objects]}
                onChange={handleChangeServiceCard} value={form.vessel_price_type} />
              <Select label={'Price of spares'} name={'primary_spare_price_type'} options={[{ label: 'No Rate', value: '' }, ...price_unit_objects]}
                onChange={handleChangeServiceCard} value={form.primary_spare_price_type} />
            </div>

            <h4 className='radio-input-label'>Service charge applied <span className={'required-span'}>*</span></h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <Radio label={'Yes'} name={'service_charge_applied'} required radioValue={true} onChange={handleChangeForm} checked={form?.service_charge_applied === true} />
              <Radio label={'No'} name={'service_charge_applied'} radioValue={false} onChange={handleChangeForm} checked={form?.service_charge_applied === false} />
            </div>
            <h4 className='radio-input-label'>Extra charge applied <span className={'required-span'}>*</span></h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <Radio label={'Yes'} name={'extra_charge_applied'} required radioValue={true} onChange={handleChangeForm} checked={form?.extra_charge_applied === true} />
              <Radio label={'No'} name={'extra_charge_applied'} radioValue={false} onChange={handleChangeForm} checked={form?.extra_charge_applied === false} />
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