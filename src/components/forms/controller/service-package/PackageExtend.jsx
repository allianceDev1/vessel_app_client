import React, { useState } from 'react'
import './package-extend.scss'
import InputText from '../../../UI_Primitives/inputs/InputText'
import TextArea from '../../../UI_Primitives/inputs/TextArea'
import { getIsoDayDifference, isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers'
import Button from '../../../UI_Primitives/buttons/Button'
import { TbCircleCheck } from 'react-icons/tb'
import { packageExtendForm } from '../../../../utils/validators/package_form'
import { api } from '../../../../api'
import { useQueryClient } from '@tanstack/react-query'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux'

const PackageExtend = ({ expireDate, packageSrlNo }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({})
    // eslint-disable-next-line
    const [error, setError] = useState({})
    const queryClient = useQueryClient()


    const expired = new Date() > new Date(expireDate) ? true : false
    const minDate = expired ? new Date() : new Date(expireDate);
    const gap = getIsoDayDifference(new Date(expireDate), new Date())

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validation = packageExtendForm(form)

        if (!validation?.isValid) {
            return;
        }

        setLoading(true)

        try {
            await api.vfCv2Axios.post(`/package/${packageSrlNo}/extend`, {
                extended_to: form?.extended_to,
                comment: form?.comment
            })

            queryClient.invalidateQueries({
                queryKey: ['customer_package_info', packageSrlNo],
            })

            dispatch(modal.pull.all())
            dispatch(toast.push({
                type: "success",
                head: 'Success!',
                message: 'Package extended Successfully'
            }))

        } catch (error) {
            dispatch(toast.push({
                type: "danger",
                head: 'Updating Failed',
                message: error?.message || 'Something went wrong'
            }))
        } finally {
            setLoading(false)
        }

    }

    return (
        <div className="package-extension-comp-form-container">

            {expired
                ? <h3 className='danger-text'>This Package Expired</h3>
                : <h3 className='warning-text'>Package Expire in {gap} Days</h3>
            }
            {expired
                ? <p>Currently the package expired. You can extend the package with re-activation.</p>
                : <p>Extend the package expire date using below inputs.</p>
            }

            <form action="" onSubmit={handleSubmit}>
                <InputText label={'Extend to'} name={'extended_to'} value={form?.extended_to} type='date' min={isoToYYYYMMDD(minDate)}
                    required onChange={handleChange} />
                <TextArea label={'Comment'} name={'comment'} value={form?.comment} required onChange={handleChange} />

                <p style={{ marginTop: '10px' }}>
                    To extend the package expiry date, Type <b>EXTEND</b> in the field below to confirm.
                </p>
                <InputText label={'Confirmation'} name={'verify_text'} value={form?.verify_text}
                    required onChange={handleChange} rightIcon={form?.verify_text === 'EXTEND' && <TbCircleCheck />}
                    error={error?.errors?.verify_text}
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    onKeyDown={(e) => {
                        if (
                            (e.ctrlKey || e.metaKey) &&
                            ["c", "v", "x"].includes(e.key.toLowerCase())
                        ) {
                            e.preventDefault()
                        }
                    }} />
                <Button label={expired ? 'Extend & Re-activate Package' : 'Extend Package'} rounded
                    severity={expired ? 'success' : 'primary'} spinIcon={loading} />
            </form>
        </div>
    )
}

export default PackageExtend