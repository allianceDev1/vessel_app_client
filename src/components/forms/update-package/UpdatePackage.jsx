import React, { useState } from 'react'
import './style.scss'
import InputText from '../../UI_Primitives/inputs/InputText'
import MultiSelectInput from '../../UI_Primitives/inputs/MultiSelect'
import Select from '../../UI_Primitives/inputs/Select'
import InputColor from '../../UI_Primitives/inputs/InputColor'
import Button from '../../UI_Primitives/buttons/Button'
import { validateUpdatePackageForm } from '../../../utils/validators/package_form'
import { api } from '../../../api'
import { useDispatch } from 'react-redux'
import { toast, modal } from '../../../redux/features/non_persisted/miniSystemSlice'


const UpdatePackage = ({ data, setData }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    package_id: data?.package_id,
    package_name: data?.package_name || '',
    full_form: data?.full_form || '',
    color_code: data?.color_code || '',
    package_duration_months: data?.package_duration_months || 0,
    work_limit: data?.work_limit || 0,
    expire_types: data?.expire_types || [],
    et_query_operator: data?.et_query_operator || null
  })
  const [vErr, setVErr] = useState({})
  const [loading, setLoading] = useState('')


  const expireTypeList = [
    { label: 'Package duration', value: 'package_duration_months' },
    { label: 'Work limit', value: 'work_limit' },
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
    try {
      await api.vfCv2Axios.put(`/package/${form.package_id}`, form)
      setData((state) => ({
        ...state,
        package_name: form?.package_name || '',
        full_form: form?.full_form || '',
        color_code: form?.color_code || '',
        package_duration_months: Number(form?.package_duration_months) || 0,
        work_limit: Number(form?.work_limit) || 0,
        expire_types: form?.expire_types || [],
        et_query_operator: form?.et_query_operator || null
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

  return (
    <div className="update-pack-modal">
      <form onSubmit={handleSubmit}>
        <InputText label={'Package name'} name='package_name' value={form.package_name} onChange={handleChangeForm} required maxLength={5}
          error={vErr.package_name} />
        <InputText label={'Full form'} name='full_form' value={form.full_form} onChange={handleChangeForm} required
          error={vErr.full_form} />
        <InputColor label={'Package color'} name={'color_code'} defaultColors={true} value={form.color_code} onChange={handleChangeForm}
          customColors={true} error={vErr.color_code} />
        <InputText label={'Package Duration (Months)'} type='number' name='package_duration_months' value={(form.package_duration_months).toString()}
          onChange={handleChangeForm} required min={0} error={vErr.package_duration_months} />
        <InputText label={'Work limit (All package service)'} type='number' name='work_limit' value={(form.work_limit).toString()}
          onChange={handleChangeForm} required min={0} error={vErr.work_limit} />
        <MultiSelectInput label={'Package expire types'} name={'expire_types'} options={expireTypeList} onChange={handleChangeMultiSelect}
          selected={expireTypeList.filter(item => form.expire_types.includes(item.value))} error={vErr.expire_types} />
        <Select label={'Expire types action'} name={'et_query_operator'} options={[{ label: '', value: '' }, ...etQueryOpretors]}
          onChange={handleChangeForm} value={form.et_query_operator} disabled={form.expire_types.length < 2} error={vErr.et_query_operator} />

        <Button label={'Update'} severity={'primary'} rounded spinIcon={loading === 'submit'} />
      </form>
    </div>
  )
}

export default UpdatePackage