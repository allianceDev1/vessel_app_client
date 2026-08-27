import React, { useEffect, useState } from 'react'
import './create-rule.scss'
import { page, toast } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import InputText from '../../../components/UI_Primitives/inputs/InputText';
import Select from '../../../components/UI_Primitives/inputs/Select';
import Button from '../../../components/UI_Primitives/buttons/Button';
import { TbAlertCircle, TbPlus, TbX } from 'react-icons/tb'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import { generateUniqueId } from '../../../utils/helpers/generate_Id';
import { findCriteriaInputType } from '../../../utils/services/work_services';
import { toStandardText } from '../../../utils/helpers/text-formatting';
import MultiSelectInput from '../../../components/UI_Primitives/inputs/MultiSelect';



const CreateRule = ({ }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false)
    const [ruleName, setRuleName] = useState('')
    const [ruleConditions, setRuleConditions] = useState([])


    const { data, isLoading, error } = useQuery({
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

    const addNewCondition = () => {
        const randomConditionId = generateUniqueId(10)
        setRuleConditions((state) => [...state, { unique_id: randomConditionId }])
    }

    const deleteCondition = (id) => {
        setRuleConditions((state) => state?.filter((i) => i.unique_id !== id))
    }

    const handleChangeSubject = (id, e) => {
        setRuleConditions((state) => {
            return state.map((c) => {
                if (c?.unique_id === id) {

                    if (!e.target.value) {
                        return {
                            unique_id: c?.unique_id
                        }
                    }

                    return {
                        ...c,
                        subject: e.target.value,
                        condition: "",
                        criteria: "",
                        direction: ""
                    }
                }
                return c
            })
        })
    }

    const handleChangeCondition = (id, e) => {
        setRuleConditions((state) => {
            return state.map((c) => {
                if (c?.unique_id === id) {

                    if (!e.target.value) {
                        return {
                            ...c,
                            condition: "",
                            criteria: "",
                            direction: ""
                        }
                    }

                    return {
                        ...c,
                        condition: e.target.value,
                        criteria: "",
                        direction: ""
                    }
                }
                return c
            })
        })
    }

    const handleChange = (id, e) => {
        setRuleConditions((state) => {
            return state.map((c) => {
                if (c?.unique_id === id) {

                    return {
                        ...c,
                        [e.target.name]: e.target.value || ''
                    }
                }
                return c
            })
        })
    }

    const handleMultiInputChange = (id, e) => {
        setRuleConditions((state) => {
            return state.map((c) => {
                if (c?.unique_id === id) {
                    return {
                        ...c,
                        [e.name]: e.selectedValues?.map((c) => c.value)
                    }
                }
                return c
            })
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!ruleName || !ruleConditions?.length) {
            return;
        }

        setLoading(true)
        try {

            await api.vfCv2Axios.post('/config/eligibility-rule', {
                rule_name: ruleName,
                conditions: ruleConditions
            })

            queryClient.refetchQueries({
                queryKey: ['cn', 'eligibility-rules'],
            })

            navigate('/controller/app-config/eligibility-rules')

            dispatch(toast.push({
                type: 'success',
                head: 'New rule created',
                message: 'Rule creation success!'
            }))

        } catch (error) {

            dispatch(toast.push({
                type: 'danger',
                head: 'Rule creation failed!',
                message: error?.message || ''
            }))

        } finally {
            setLoading(false)
        }

    }

    useEffect(() => {
        console.log(ruleConditions)
    }, [ruleConditions])

    useEffect(() => {
        dispatch(page.setTitle({
            title: 'Create rule',
            note: 'Create new eligibility rule'
        }))

        // eslint-disable-next-line
    }, [])


    // loading
    if (isLoading) {
        return <div className="create-update-rule-page-container">
            <SkeletonGrid
                rows={2}
                columns={1}
                height={100}
                style={{ marginBottom: '15px' }}
            />
            <SkeletonGrid
                rows={4}
                columns={4}
                height={50}
                style={{ marginBottom: '15px' }}
            />
            <SkeletonGrid
                rows={1}
                columns={1}
                height={50}
            />
        </div>
    }

    if (error) {
        return <ErrorState
            hight='70vh'
            title={'Data fetching failed!'}
            message={error?.message}
            icon={<TbAlertCircle />}
        />
    }

    return (
        <div className="create-update-rule-page-container">
            <div className="note-section">
                <p>An eligibility rule defines one possible way a service can be allowed for a customer product.
                    Each rule contains one or more conditions that evaluate the customer's current product, package,
                    service, and token data. Conditions work together as <b>AND</b>, meaning all conditions within the rule
                    must be satisfied for that rule to match. A service category can have multiple rules, and the rules
                    work as <b>OR</b>, meaning the service is allowed when any one enabled rule matches. Create separate
                    rules whenever there are different scenarios that can independently make the customer eligible.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <label className='rule-name' htmlFor="">Rule name</label>
                <InputText placeholder={'Enter a unique rule name'} name={'rule_name'} inputStyle={{ padding: '15px 15px' }}
                    onChange={(e) => setRuleName(e.target.value)} value={ruleName} />

                <br></br>

                <label className='rule-name' htmlFor="">Conditions</label>

                <div className="conditions-list">
                    {ruleConditions?.map((c) => {
                        const selectedSubject = data?.subjects?.find((i) => i?.code === c?.subject) || null
                        const inputConditions = data?.conditions?.filter((i) => selectedSubject?.conditions?.includes(i?.code)) || []
                        const selectedCondition = inputConditions?.find((i) => i?.code === c?.condition) || null
                        const criteriaInputType = findCriteriaInputType(selectedSubject, selectedCondition)

                        return <div className="condition-form">
                            <Select label={'Subject'} id={'subject' + c?.unique_id} name={'subject'} required size='small' onChange={(e) => handleChangeSubject(c?.unique_id, e)}
                                value={c?.subject} options={[{}, ...data?.subjects?.map((s) => ({ label: s?.name, value: s?.code }))]} />

                            <Select label={'Condition'} id={'condition' + c?.unique_id} required size='small' name={'condition'} value={c?.condition}
                                options={[{}, ...inputConditions?.map((s) => ({ label: s?.name, value: s?.code }))]} onChange={(e) => handleChangeCondition(c?.unique_id, e)} />

                            {(criteriaInputType === 'number' || criteriaInputType === 'date' || !criteriaInputType) &&
                                <InputText label={'Criteria'} id={'criteria' + c?.unique_id} required size='small' name={'criteria'} value={c?.criteria || ''}
                                    onChange={(e) => handleChange(c?.unique_id, e)} type={criteriaInputType} disabled={!criteriaInputType} />}

                            {criteriaInputType === 'select' &&
                                <Select label={'Criteria'} id={'criteria' + c?.unique_id} required size='small' name={'criteria'} value={c?.criteria || ''}
                                    onChange={(e) => handleChange(c?.unique_id, e)} options={[{}, ...data?.packages]} />}

                            {criteriaInputType === 'multi-select' &&
                                <MultiSelectInput label={'Criteria'} id={'criteria' + c?.unique_id} required size='small' name={'criteria'}
                                    onChange={(e) => handleMultiInputChange(c?.unique_id, e)}
                                    options={data?.packages} selected={data?.packages.filter(item => c.criteria.includes(item.value))} />}

                            <Select label={'Direction'} id={'direction' + c?.unique_id} required size='small' name={'direction'} value={c?.direction || ''}
                                onChange={(e) => handleChange(c?.unique_id, e)} disabled={!selectedCondition?.direction}
                                options={[{}, ...data.directions.map((i) => ({ label: i?.name, value: i?.code }))]} />

                            <Button icon={<TbX />} severity={'danger'} outlined rounded size='small' type='button'
                                onClick={() => deleteCondition(c?.unique_id)} />
                        </div>
                    })}
                </div>

                <div className="add-condition">
                    <Button icon={<TbPlus />} label={'New condition'} outlined rounded size='small' style={{ width: '150px' }}
                        type='button' onClick={addNewCondition} />
                </div>

                <Button label={'Create rule'} severity={'primary'} rounded style={{ width: '100%', marginTop: '40px' }}
                    disabled={!ruleName || !ruleConditions?.length} spinIcon={loading} />
            </form>

        </div>
    )
}

export default CreateRule