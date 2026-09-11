import { useState } from 'react'
import Select from '../../../UI_Primitives/inputs/Select'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../api'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { findCriteriaInputType } from '../../../../utils/services/work_services'
import InputText from '../../../UI_Primitives/inputs/InputText'
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect'
import Button from '../../../UI_Primitives/buttons/Button'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { TbInfoCircle } from 'react-icons/tb'


const CreateUpdateCondition = ({ action = 'CREATE', ruleUuid, data }) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient()
    const [loading, setLoading] = useState('')
    const [form, setForm] = useState({})
    const [inputConditions, setInputConditions] = useState([])
    const [criteriaType, setCriteriaType] = useState('')
    const [direction, setDirection] = useState(false)

    const { data: resources, isLoading, error } = useQuery({
        queryKey: ['cn', 'eligibility_resources'],
        queryFn: async () => {
            const { subjects, conditions, directions } = await api.vfCv2Axios.get('/config/subject-resources')
            const packages = await api.vfCv2Axios.get('/config/service-package/list?hidden=Yes&fields=package_id,package_name,product_type,is_active')

            return {
                subjects, conditions, directions,
                packages: packages?.map((i) => ({ label: `${i?.package_name} (${toStandardText(i?.product_type)})`, value: i?.package_id }))
            }
        }
    })

    const handleChangeSubject = (e) => {

        const selectedSubject = resources?.subjects?.find((i) => i?.code === e.target.value) || null
        const options = resources?.conditions?.filter((i) => selectedSubject?.conditions?.includes(i?.code)) || []

        setInputConditions(options || [])

        setForm({
            ...form,
            subject: e.target.value,
            condition: "",
            criteria: "",
            direction: ""
        })
    }

    const handleChangeCondition = (e) => {

        const selectedSubject = resources?.subjects?.find((i) => i?.code === form?.subject) || null
        const selectedCondition = inputConditions?.find((i) => i?.code === e.target.value) || null
        const cType = findCriteriaInputType(selectedSubject, selectedCondition)

        setCriteriaType(cType)
        setDirection(selectedCondition?.direction)

        setForm({
            ...form,
            condition: e.target.value,
            criteria: "",
            direction: ""
        })
    }

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value || ''
        })
    }

    const handleMultiInputChange = (e) => {
        setForm({
            ...form,
            [e.name]: e.selectedValues?.map((c) => c.value)
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true)

        try {

            if (action === 'UPDATE') {
                // await api.vfCv2Axios.patch(`/config/eligibility-rule/${ruleUuid}/condition/${data?.condition_uuid}`, form)

            } else {
                await api.vfCv2Axios.post(`/config/eligibility-rule/${ruleUuid}/condition`, form)
            }

            queryClient.refetchQueries({
                queryKey: ['cn', 'rule-details', ruleUuid],
            })

            dispatch(modal.pull.all())

        } catch (error) {

            dispatch(toast.push({
                type: 'danger',
                head: 'Action failed!',
                message: error?.message || ''
            }))

        } finally {
            setLoading(false)
        }


    }


    // loading
    if (isLoading) {
        return <div className="create-update-eligibility-condition-form-container" >
            <SkeletonGrid rows={5} columns={1} height={45} />
        </div>
    }


    if (error) {
        return <ErrorState hight='300px' icon={<TbInfoCircle />} title={'Resources fetch failed'}
            message={error?.message || 'Something went wrong'} />
    }

    return (
        <div className="create-update-eligibility-condition-form-container">
            <form action="" style={{ display: "flex", flexDirection: 'column', gap: '10px' }} onSubmit={handleSubmit}>
                <Select label={'Subject'} name={'subject'} required onChange={handleChangeSubject}
                    value={form?.subject} options={[{}, ...(resources?.subjects?.map((s) => ({ label: s?.name, value: s?.code })) || [])]} />

                <Select label={'Condition'} required name={'condition'} value={form?.condition}
                    options={[
                        {},
                        ...(Array.isArray(inputConditions) ? inputConditions.map((s) => ({ label: s?.name, value: s?.code })) : [])
                    ]} onChange={handleChangeCondition} />

                {(criteriaType === 'number' || criteriaType === 'date' || !criteriaType) &&
                    <InputText label={'Criteria'} required name={'criteria'} value={form?.criteria || ''}
                        onChange={handleChange} type={criteriaType} disabled={!criteriaType} />}

                {criteriaType === 'select' &&
                    <Select label={'Criteria'} required name={'criteria'} value={form?.criteria || ''}
                        onChange={handleChange} options={[{}, ...resources?.packages]} />}

                {criteriaType === 'multi-select' &&
                    <MultiSelectInput label={'Criteria'} required name={'criteria'}
                        onChange={handleMultiInputChange}
                        options={resources?.packages} selected={resources?.packages.filter(item => form?.criteria.includes(item.value))} />}

                <Select label={'Direction'} required name={'direction'} value={form?.direction || ''}
                    onChange={handleChange} disabled={!direction}
                    options={[{}, ...(resources?.directions?.map((i) => ({ label: i?.name, value: i?.code })) || [])]} />

                <Button label={action === 'CREATE' ? 'Add condition' : "Update condition"} severity={'primary'} rounded spinIcon={loading} />
            </form>
        </div>
    )
}

export default CreateUpdateCondition