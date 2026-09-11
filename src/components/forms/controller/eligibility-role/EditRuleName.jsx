import React, { useState } from 'react'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { api } from '../../../../api'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'

const EditRuleName = ({ rule_uuid, name }) => {
    const dispatch = useDispatch();
    const [ruleName, setRuleName] = useState(name || '');
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!ruleName?.trim()) {
            return;
        }

        try {
            setLoading(true)

            await api.vfCv2Axios.patch(`/config/eligibility-rule/${rule_uuid}/name`, {
                rule_name: ruleName
            })

            queryClient.setQueryData(
                ['cn', 'rule-details', rule_uuid],
                (oldData) => {
                    if (!oldData) return oldData;

                    return {
                        ...oldData,
                        rule_name: ruleName
                    };
                }
            );

            dispatch(modal.pull.all())

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Action failed',
                message: error?.message || ''
            }))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="edit-rule-name-comp-container">
            <form action="" style={{ display: 'flex', gap: '10px', flexDirection: 'column' }} onSubmit={handleSubmit}>
                <InputText label={'Rule name'} value={ruleName} name={'rule_name'} onChange={(e) => setRuleName(e.target.value)}
                    required />
                <Button label={'Update'} rounded style={{ width: '100%' }} severity={'primary'} spinIcon={loading} />
            </form>
        </div>
    )
}

export default EditRuleName