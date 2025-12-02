import React, { useEffect, useState } from 'react'
import './style.scss'
import { useDispatch } from 'react-redux'
import { credit_amount_type, price_unit_objects } from '../../../assets/javascript/pre_data/units';
import { TbCash, TbPlus, TbTrash, TbMoodAnnoyed } from 'react-icons/tb';
import { toast, modal } from '../../../redux/features/non_persisted/miniSystemSlice';
import { api } from '../../../api'
import { validateUpdatePackageServiceForm } from '../../../utils/validators/package_form'
import SkeletonGrid from '../../UI_Primitives/skeleton/SkeletonGrid';
import InputText from '../../UI_Primitives/inputs/InputText';
import Select from '../../UI_Primitives/inputs/Select';
import Radio from '../../UI_Primitives/inputs/Radio';
import Button from '../../UI_Primitives/buttons/Button';
import EmptyState from '../../UI_Primitives/ui-states/EmptyState';
import ErrorState from '../../UI_Primitives/ui-states/ErrorState';



const UpdatePackageService = ({ packageId, serviceId, mode, setData }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState('fetch')
  const [vErr, setVErr] = useState({})
  const [packages, setPackages] = useState([])
  const [form, setForm] = useState({})
  const [serviceCharge, setServiceCharge] = useState({})
  const [error, setError] = useState({ error: false, title: null, message: null })

  const fetchApi = async () => {
    try {
      setLoading('fetch')

      const [packageRes, serviceRes] = await Promise.all([
        api.vfCv2Axios.get(`/package/list?product_type=Vessel&fields=package_name`),
        api.vfCv2Axios.get(`/package/${packageId}/${serviceId}`)
      ]);

      setPackages(packageRes?.map(i => ({ label: i.package_name, value: i.package_id })))
      setForm({
        service_id: serviceRes?.service_id,
        service_name: serviceRes?.service_name,
        service_limit: String(serviceRes?.service_limit),
        credit_type: serviceRes?.credit_type,
        credit_limit: String(serviceRes?.credit_limit),
        target_package: mode === 'Renewal' ? serviceRes?.target_package : undefined,
        bag_price_type: serviceRes?.bag_price_type,
        vessel_price_type: serviceRes?.vessel_price_type,
        primary_spare_price_type: serviceRes?.primary_spare_price_type,
        service_charge_applied: serviceRes?.service_charge_applied,
        service_charges: serviceRes?.service_charges,
        extra_charge_applied: serviceRes?.extra_charge_applied
      })
    } catch (err) {
      setError({ error: true, title: 'Data fetching failed', message: err.message })
    } finally {
      setLoading('')
    }


  }

  const handleChangeForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleServiceChargeChange = (e) => {
    setServiceCharge({ ...serviceCharge, [e.target.name]: e.target.value })
  }

  const handleServiceChargeAdd = () => {
    // Validation
    if (!serviceCharge?.charge_amount || !serviceCharge?.call_count) {
      dispatch(toast.push({
        type: 'danger',
        message: 'Please fill the charge amount and call count'
      }))
      return;
    }

    if (form?.service_charges?.map((c) => c.charge_amount).includes(serviceCharge?.charge_amount)) {
      dispatch(toast.push({
        type: 'danger',
        message: 'The service charge existed.'
      }))
      return;
    }

    setForm({ ...form, service_charges: [...(form?.service_charges || []), serviceCharge] })
    setServiceCharge({})
  }

  const handleRemoveCharge = (chargeAmount) => {
    setForm({ ...form, service_charges: form?.service_charges?.filter((c) => Number(c.charge_amount) !== Number(chargeAmount)) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const validation = validateUpdatePackageServiceForm(form, mode)
    if (!validation.isValid) {
      setVErr(validation.errors)
      return
    }

    // Update
    // Update data
    setLoading('submit')
    try {
      await api.vfCv2Axios.put(`/package/${packageId}/${serviceId}`, form)

      setData((state) => state.map((s) => {
        if (s.service_id === serviceId) {
          return {
            ...s,
            service_name: form?.service_name,
            service_limit: Number(form?.service_limit || 0),
            credit_limit: Number(form?.credit_limit || 0),
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
    // Initial fetch
    fetchApi();

    //eslint-disable-next-line
  }, [packageId, serviceId])


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
            <InputText label={'Service name'} name='service_name' value={form.service_name} onChange={handleChangeForm} required error={vErr.service_name} />
            <InputText label={'Service limit'} name='service_limit' type='number' value={form.service_limit} onChange={handleChangeForm} required min={0} />
            <Select label={'Credit type'} name={'credit_type'} options={[{ label: '', value: '' }, ...credit_amount_type?.map((i) => ({ label: i, value: i }))]}
              onChange={handleChangeForm} value={form.credit_type} required />
            <InputText label={'Credit limit'} name='credit_limit' type='number' value={form.credit_limit} onChange={handleChangeForm} required
              error={vErr.credit_limit} min={0} />
            {mode === "Renewal" &&
              <Select label={'Package to be renewed'} name={'target_package'} options={[{ label: '', value: '' }, ...packages]} required
                onChange={handleChangeForm} value={form.target_package} />}


            <h3 className='sub-title'>Price types</h3>
            <Select label={'Price of material bag'} name={'bag_price_type'} options={[{ label: '', value: '' }, ...price_unit_objects]} required
              onChange={handleChangeForm} value={form.bag_price_type} />
            <Select label={'Price of Vessel spare'} name={'vessel_price_type'} options={[{ label: '', value: '' }, ...price_unit_objects]} required
              onChange={handleChangeForm} value={form.vessel_price_type} />
            <Select label={'Price of spares'} name={'primary_spare_price_type'} options={[{ label: '', value: '' }, ...price_unit_objects]} required
              onChange={handleChangeForm} value={form.primary_spare_price_type} />

          </div>
          <div className="section">
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

            <h3 className='sub-title'>Default service charges <span className={'required-span'}>*</span></h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <InputText label={'Charge amount'} name='charge_amount' value={serviceCharge.charge_amount} onChange={handleServiceChargeChange}
                error={vErr.service_charges} type='number' min={0} />
              <InputText label={'Call count'} name='call_count' value={serviceCharge.call_count} onChange={handleServiceChargeChange} type='number' min={0} />
              <Button icon={<TbPlus />} severity={'info'} type={'button'} onClick={handleServiceChargeAdd} disabled={loading === 'submit'} />
            </div>
            {form?.service_charges?.length > 0
              ? <>
                {form?.service_charges?.map((charge, index) => (
                  <div key={charge?.charge_amount} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <InputText label={`Charge #${index + 1}`} value={charge.charge_amount} disabled />
                    <InputText label={`Call`} value={charge.call_count} disabled />
                    <Button icon={<TbTrash />} outlined severity={'danger'} type={'button'} onClick={() => handleRemoveCharge(charge.charge_amount)}
                      disabled={loading === 'submit'} />
                  </div>
                ))}
              </>
              : <EmptyState icon={<TbCash />} description={'Add default service charges'} />}

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