import React, { useEffect } from 'react'
import './eligibility-rules.scss'
import Button from '../../../components/UI_Primitives/buttons/Button';
import InputText from '../../../components/UI_Primitives/inputs/InputText';
import Badge from '../../../components/UI_Primitives/badge/Badge';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import { useDispatch, useSelector } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { TbAlertCircle, TbPlus } from 'react-icons/tb'
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api'
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import EmptyState from '../../../components/UI_Primitives/ui-states/EmptyState';
import { useNavigate } from 'react-router-dom';



const EligibilityRules = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user)

    const { data, isLoading, error } = useQuery({
        queryKey: ['cn', 'eligibility-rules'],
        queryFn: async () => {
            const res = await api.vfCv2Axios.get('/config/eligibility-rules')
            return res || []
        },
        staleTime: 60_000
    })


    useEffect(() => {
        dispatch(page.setTitle({ title: 'Eligibility rules', note: "Define which rules are eligible for this service workflow." }))

        // eslint-disable-next-line
    }, [])

    if (isLoading) {
        return <div className="eligibility-rules-page-container">
            <SkeletonGrid rows={1} columns={1} height={'70px'} gap={'10px'} style={{ marginBottom: '10px' }} />
            <SkeletonGrid rows={6} columns={2} height={'70px'} gap={'10px'}
                responsive={{
                    md: { rows: 10, columns: 1 }
                }} />
        </div>
    }

    if (error) {
        return <div className="eligibility-rules-page-container">
            <ErrorState
                icon={<TbAlertCircle />}
                title={"Data fetching failed !"}
                message={error?.message || 'Something went wrong !'}
                hight='70vh'
            />
        </div>
    }

    return (
        <div className="eligibility-rules-page-container">
            <div className="action-section">
                <InputText label={'Search'} size='small' />
                {user?.allowed_origins?.includes('vessel_c_admin') &&
                    <Button label={'Rule'} icon={<TbPlus />} size='small' rounded onClick={() => navigate('/controller/app-config/eligibility-rules/new')}
                        severity={'primary'} style={{ width: '130px' }} />}
            </div>

            {data?.length
                ? <div className="content">
                    {data.map((rule) => (<div className="rule-item" key={rule.uuid} onClick={() => navigate(`/controller/app-config/eligibility-rule/${rule.uuid}`)}>
                        <h4>{rule?.rule_name}</h4>
                        <div className="sub-line">
                            <p>Conditions : {rule?.conditions || 0}</p>
                            <Badge value={rule?.enabled ? 'Enabled' : 'Disabled'} severity={rule?.enabled ? 'success' : 'danger'} size={'small'} />
                        </div>
                    </div>))}
                </div>
                : <EmptyState
                    icon={<TbAlertCircle />}
                    title={"No rules found !"}
                    description={'Create the first rule using button.'}
                    hight='70vh'
                />}
        </div>
    )
}

export default EligibilityRules