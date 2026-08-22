import React, { useEffect, useState } from 'react'
import './style.scss'
import InputText from '../../../UI_Primitives/inputs/InputText'
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect'
import Select from '../../../UI_Primitives/inputs/Select'
import InputColor from '../../../UI_Primitives/inputs/InputColor'
import Button from '../../../UI_Primitives/buttons/Button'
import { validateUpdatePackageForm } from '../../../../utils/validators/package_form'
import { api } from '../../../../api'
import { useDispatch } from 'react-redux'
import { toast, modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { packageExpireTypes } from '../../../../assets/javascript/pre_data/package'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { parent_product_types } from '../../../../config/app_config'


const CreateUpdatePackage = ({ action = 'CREATE', data, setData }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    expire_types: [packageExpireTypes?.PACKAGE_DURATION]
  })
  const [vErr, setVErr] = useState({})
  const [loading, setLoading] = useState('')


  const expireTypeList = [
    { label: 'Package Duration', value: packageExpireTypes?.PACKAGE_DURATION, disabled: true },
    { label: 'Remaining Tokens', value: packageExpireTypes?.REMAINING_TOKENS },
  ]

  const etQueryOpretors = [
    { label: 'AND', value: 'AND' },
    { label: 'OR', value: 'OR' }
  ]

  const handleChangeForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleChangeMultiSelect = (e) => {
    const temp = { ...form, [e.name]: e.selectedValues?.map((v) => v.value) }

    if (e.selectedValues.length < 2) {
      temp.et_query_operator = null
    }

    setForm(temp)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    const validation = validateUpdatePackageForm(form)
    if (!validation.isValid) {
      setVErr(validation.errors)
      return
    }

    // Update data
    setLoading('submit')

    if (action === 'CREATE') {
      try {
        await api.vfCv2Axios.post(`/config/service-package`, { ...form, product_type: searchParams.get('parent_product') })

        queryClient.refetchQueries({
          queryKey: ['cn', 'service_packages', (searchParams.get('parent_product') || parent_product_types[0])]
        })

        dispatch(modal.pull.all())
      } catch (error) {
        dispatch(toast.push({
          type: 'danger',
          head: "Package creation failed",
          message: error.message
        }))
      } finally {
        setLoading('')
      }

    } else {
      try {
        await api.vfCv2Axios.put(`/config/service-package/${form?.package_id}`, form)
        setData((state) => ({
          ...state,
          package_name: form?.package_name || '',
          full_form: form?.full_form || '',
          color_code: form?.color_code || '',
          package_duration_months: Number(form?.package_duration_months) || 0,
          number_of_services: Number(form?.number_of_services) || 0,
          tokens_count: Number(form?.tokens_count) || 0,
          expire_types: form?.expire_types || [],
          et_query_operator: form?.et_query_operator || null,
          package_fund: form?.package_fund || 0,
          gst_rate: form?.gst_rate || null,
          service_work_fund: form?.service_work_fund || null,
          spare_parts_fund: form?.spare_parts_fund || null
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
  }

  useEffect(() => {
    if (data) {
      setForm({
        package_id: data?.package_id || '',
        package_name: data?.package_name || '',
        full_form: data?.full_form || '',
        color_code: data?.color_code || '',
        package_duration_months: (data?.package_duration_months || 0)?.toString() || '',
        number_of_services: (data?.number_of_services || 0)?.toString() || '',
        tokens_count: String(data?.tokens_count || 0) || '',
        expire_types: data?.expire_types || [],
        et_query_operator: data?.et_query_operator || "",
        package_fund: String(data?.package_fund ?? ''),
        service_work_fund: String(data?.service_work_fund ?? ''),
        spare_parts_fund: String(data?.spare_parts_fund ?? '')
      })
    }

  }, [data])

  return (
    <div className="update-pack-modal">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <InputText label={'Package name'} name='package_name' value={form?.package_name} onChange={handleChangeForm} required maxLength={12}
            minLength={1} error={vErr.package_name} helperText={'Max length 12 letters'} />

          <InputText label={'Full form'} name='full_form' value={form?.full_form} onChange={handleChangeForm} required
            error={vErr.full_form} />

          <InputColor label={'Package color'} name={'color_code'} defaultColors={true} value={form?.color_code} onChange={handleChangeForm}
            customColors={true} error={vErr.color_code} required
            preColors={["#2563EB", "#059669", "#7C3AED", "#EA580C", "#E11D48", "#0891B2"]} />

          <InputText label={'Package Duration (Months)'} type='number' name='package_duration_months' value={(form?.package_duration_months)?.toString()}
            onChange={handleChangeForm} required min={1} max={600} error={vErr.package_duration_months} helperText={'Valid 1 to 600 months'} />

          <InputText label={'SR in Duration'} type='number' name='number_of_services' value={(form?.number_of_services)?.toString()}
            onChange={handleChangeForm} required min={0} error={vErr.number_of_services} helperText={'Service count includes both Service mode and Renewal mode.'} />

          <InputText label={'Package visit tokens'} type='number' name='tokens_count' value={(form?.tokens_count)?.toString()}
            onChange={handleChangeForm} required min={0} error={vErr.tokens_count} helperText={'Every modes count as a work.'} />

          <MultiSelectInput label={'Package expire types'} name={'expire_types'} options={expireTypeList} onChange={handleChangeMultiSelect}
            selected={expireTypeList?.filter(item => form?.expire_types?.includes(item.value))} error={vErr.expire_types} required />

          <Select label={'Expire types action'} name={'et_query_operator'} options={[{ label: '', value: '' }, ...etQueryOpretors]}
            onChange={handleChangeForm} value={form?.et_query_operator} disabled={form?.expire_types.length < 2} error={vErr.et_query_operator}
            required={form?.expire_types?.length > 1} />
        </div>


        <h3>Package Price</h3>
        <div className="input-group">
          <InputText label={'Total Price of Package Fund'} name='package_fund' value={form?.package_fund} onChange={handleChangeForm} required min={0}
            error={vErr.package_fund} type='number' />
          <br></br>
          {/* <InputText label={'Tax ( Percentage )'} name='gst_rate' value={form?.gst_rate} onChange={handleChangeForm} required min={0} max={100}
            error={vErr.gst_rate} type='number' helperText={'Zero means is non tax package'} disabled={Number(form?.package_fund || 0) === 0} /> */}

          <InputText label={'Service Work Fund'} name='service_work_fund' value={form?.service_work_fund} onChange={handleChangeForm} min={0}
            error={vErr.service_work_fund} type='number' disabled={Number(form?.package_fund || 0) === 0} />

          <InputText label={'Spare Parts Fund'} name='spare_parts_fund' value={form?.spare_parts_fund} onChange={handleChangeForm} min={0}
            error={vErr.spare_parts_fund} type='number' disabled={Number(form?.package_fund || 0) === 0} />

        </div>

        <Button label={action === 'CREATE' ? "Create package" : 'Update package'} severity={'primary'} rounded spinIcon={loading === 'submit'} style={{ width: '100%' }} />
      </form>
    </div>
  )
}

export default CreateUpdatePackage