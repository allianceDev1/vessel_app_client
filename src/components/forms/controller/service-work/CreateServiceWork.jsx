import React, { useState } from 'react'
import './style.scss'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Select from '../../../UI_Primitives/inputs/Select'
import Radio from '../../../UI_Primitives/inputs/Radio'
import Button from '../../../UI_Primitives/buttons/Button'
import { api } from '../../../../api'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'



const CreateServiceWork = ({ setData }) => {
    const dispatch = useDispatch();
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(false)

    const handelChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create
        try {
            setLoading(true)
            const creation = await api.vfCv2Axios.post('/config/service-work', form)
            setData((state) => ([{
                "Work name": form?.work_name,
                "Scop": form?.service_scope,
                "Selling Rate": form?.selling_rate,
                "Discount Rate": form?.discount_rate,
                "Purchase Rate": form?.purchase_rate,
                "Call Rate": form?.call_rate,
                refill_included: form?.refill_included,
                reinstallation_included: form?.reinstallation_included,
                work_uuid: creation?.uuid
            }, ...state]))

            dispatch(modal.pull.all())

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Creation failed',
                message: error.message
            }))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="service-work-form-container">
            <form onSubmit={handleSubmit}>
                <InputText label={'Work name'} name={'work_name'} value={form?.work_name} onChange={handelChange}
                    required minLength={3} maxLength={30} />
                <Select label={'Service Scope'} name={'service_scope'} value={form?.service_scope} onChange={handelChange}
                    required options={[{}, { label: 'Vessel', value: 'Vessel' }, { label: 'Add-On', value: 'Add-On' }]} />
                <InputText label={'Selling Rate'} name={'selling_rate'} value={form?.selling_rate} onChange={handelChange}
                    required type='number' min={0} />
                <InputText label={'Discount Rate'} name={'discount_rate'} value={form?.discount_rate} onChange={handelChange}
                    required type='number' min={0} />
                <InputText label={'Purchase Rate'} name={'purchase_rate'} value={form?.purchase_rate} onChange={handelChange}
                    required type='number' min={0} />
                <InputText label={'Call Rate'} name={'call_rate'} value={form?.call_rate} onChange={handelChange}
                    required type='number' min={0} />
                <div>
                    <h4 className='radio-input-label'>Refill applied <span className={'required-span'}>*</span></h4>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <Radio label={'Yes'} name={'refill_included'} required radioValue={true} onChange={handelChange} checked={form?.refill_included === true} />
                        <Radio label={'No'} name={'refill_included'} radioValue={false} onChange={handelChange} checked={form?.refill_included === false} />
                    </div>
                </div>

                <div>
                    <h4 className='radio-input-label'>Reinstallation applied <span className={'required-span'}>*</span></h4>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <Radio label={'Yes'} name={'reinstallation_included'} required radioValue={true} onChange={handelChange} checked={form?.reinstallation_included === true} />
                        <Radio label={'No'} name={'reinstallation_included'} radioValue={false} onChange={handelChange} checked={form?.reinstallation_included === false} />
                    </div>
                </div>

                <Button label={'Create'} rounded spinIcon={loading} severity='primary' style={{ width: '100%' }} />

            </form>
        </div>
    )
}

export default CreateServiceWork