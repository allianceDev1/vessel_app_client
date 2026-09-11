import React, { useEffect, useState } from 'react'
import './eligibility-rule-view.scss'
import Button from '../../../components/UI_Primitives/buttons/Button'
import Table from '../../../components/UI_Primitives/table/Table'
import Badge from '../../../components/UI_Primitives/badge/Badge'
import { useDispatch, useSelector } from 'react-redux'
import { doDialog, modal, page, toast } from '../../../redux/features/non_persisted/miniSystemSlice'
import { TbAlertCircle, TbEye, TbEyeClosed, TbPencil, TbPlus, TbTrash } from 'react-icons/tb'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../../api'
import { toStandardText } from '../../../utils/helpers/text-formatting'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState'
import EditRuleName from '../../../components/forms/controller/eligibility-role/EditRuleName'
import CreateUpdateCondition from '../../../components/forms/controller/eligibility-role/CreateUpdateCondition'

const EligibilityRuleView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.user)
  const { rule_uuid } = useParams();
  const [deletingKey, setDeletingKey] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['cn', 'rule-details', rule_uuid],
    queryFn: async () => {
      const res = await api.vfCv2Axios.get(`/config/eligibility-rule/${rule_uuid}`)
      return res
    },
    staleTime: 60_000
  })

  const handelChangeStatus = (status) => {
    dispatch(doDialog.confirm({
      message: 'Do you want to change status ?',
      accept: {
        onClick: async () => {

          try {
            await api.vfCv2Axios.post(`/config/eligibility-rule/${rule_uuid}/status`, {
              status: status
            })

            queryClient.setQueryData(
              ['cn', 'rule-details', rule_uuid],
              (oldData) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  enabled: status === 'ENABLE' ? true : false,
                  enabled_at: status === 'ENABLE' ? new Date() : null,
                  enabled_by: status === 'ENABLE' ? 'You' : null,
                };
              }
            );
          } catch (error) {
            dispatch(toast.push({
              type: 'danger',
              head: 'Action failed',
              message: error?.message || ''
            }))
          }

        }
      }
    }))
  }

  const handelRemoveRule = () => {
    dispatch(doDialog.confirm({
      message: 'Do you want to remove the rule ?',
      accept: {
        onClick: async () => {
          try {
            await api.vfCv2Axios.delete(`/config/eligibility-rule/${rule_uuid}`)

            queryClient.refetchQueries({
              queryKey: ['cn', 'eligibility-rules']
            })
            navigate('/controller/app-config/eligibility-rules')

            dispatch(toast.push({
              type: 'success',
              head: 'Rule removed !',
              message: 'The eligibility rule removed.'
            }))

          } catch (error) {
            dispatch(toast.push({
              type: 'danger',
              head: 'Action failed',
              message: error?.message || ''
            }))
          }

        }
      }
    }))
  }

  const handleDeleteCondition = (condition_uuid) => {
    dispatch(doDialog.confirm({
      message: 'Do you want to delete this condition ?',
      accept: {
        onClick: async () => {
          try {
            setDeletingKey(condition_uuid);
            await api.vfCv2Axios.delete(`/config/eligibility-rule/${rule_uuid}/condition/${condition_uuid}`)
            queryClient.invalidateQueries({ queryKey: ['cn', 'rule-details', rule_uuid] })

          } catch (error) {
            dispatch(toast.push({
              type: 'danger',
              head: 'Deletion failed',
              message: error.message
            }))
          } finally {
            setDeletingKey(null);
          }
        }
      }
    }))
  }

  const openEditNameModal = (name) => {
    dispatch(modal.push({
      title: 'Update rule name',
      body: <EditRuleName rule_uuid={rule_uuid} name={name} />
    }))
  }

  const openCUConditionModal = (action = "CREATE", data = null) => {

    dispatch(modal?.push({
      title: action === 'CREATE' ? 'Add new condition' : 'Update condition',
      body: <CreateUpdateCondition action={action} data={data} ruleUuid={rule_uuid} />
    }))

  }

  useEffect(() => {
    dispatch(page.setTitle({ title: 'Eligibility rule', note: "Define eligibility rules and take actions" }))

    // eslint-disable-next-line
  }, [])

  if (isLoading) {
    return <div className="eligibility-rule-view-page-container">
      <SkeletonGrid rows={8} columns={1} height={'60px'} gap={'10px'} style={{ marginBottom: '10px' }} />
    </div>
  }

  if (error) {
    return <div className="eligibility-rule-view-page-container">
      <ErrorState
        icon={<TbAlertCircle />}
        title={"Data fetching failed !"}
        message={error?.message || 'Something went wrong !'}
        hight='70vh'
      />
    </div>
  }


  return (
    <div className="eligibility-rule-view-page-container">
      <div className="action-section">
        <Button label={'Condition'} icon={<TbPlus />} size='small' rounded severity={'primary'} style={{ width: '120px' }}
          onClick={() => openCUConditionModal('CREATE')} />
        {data?.enabled && <Button label={'Disable'} icon={<TbEyeClosed />} size='small' rounded outlined severity={'danger'}
          onClick={() => handelChangeStatus('DISABLE')} style={{ width: '110px' }} />}
        {!data?.enabled && <Button label={'Enable'} icon={<TbEye />} size='small' rounded outlined severity={'info'}
          onClick={() => handelChangeStatus('ENABLE')} style={{ width: '110px' }} />}
        <Button label={'Remove'} icon={<TbTrash />} size='small' rounded outlined severity={'danger'} style={{ width: '110px' }}
          onClick={handelRemoveRule} />
      </div>

      <div className="content">
        <div className='content-title'>
          <h2>{data?.rule_name} <span style={{ color: 'var(--color-info)', cursor: 'pointer' }}
            onClick={() => openEditNameModal(data?.rule_name)}><TbPencil /></span></h2>
          {data?.enabled
            ? <Badge value={'Enabled'} severity={'primary'} />
            : <Badge value={'Disabled'} severity={'danger'} />}
        </div>

        <Table
          key={'eli-rule'}
          columns={[
            { header: 'Subject', accessorKey: 'Subject', enableHiding: false },
            { header: 'Condition', accessorKey: 'Condition', enableHiding: false },
            { header: 'Criteria', accessorKey: 'Criteria', enableHiding: false },
            { header: 'Direction', accessorKey: 'Direction', enableHiding: false },
            {
              header: 'Action', accessorKey: 'Action', enableHiding: false,
              enableSorting: false,
              enableColumnFilter: false,
              cell: ({ row }) => {
                const rowKey = row.original.condition_uuid;

                return (user?.allowed_origins?.includes('vessel_c_admin') &&
                  <div className="action-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>

                    <Button rounded severity={'danger'} title={'Delete'}
                      icon={<TbTrash />} size='small' outlined onClick={() => handleDeleteCondition(rowKey)}
                      spinIcon={deletingKey === rowKey}
                      disabled={deletingKey === rowKey} />
                  </div>)
              }
            }
          ]}
          data={data?.conditions?.map((condition) => ({
            condition_uuid: condition?.condition_uuid,
            Subject: toStandardText(condition?.subject),
            Condition: toStandardText(condition?.condition),
            Criteria: typeof condition?.criteria === "object"
              ? condition?.criteria?.map((c) => typeof c === 'object' ? `${c?.package_name} (${toStandardText(c?.product_type)})` : toStandardText(String(c)))?.join(', ')
              : condition?.criteria ? toStandardText(String(condition?.criteria)) : '',
            Direction: condition?.direction ? toStandardText(condition?.direction) : ''
          }))}
          tableKey="eli-rule"
        />
      </div>
    </div>
  )
}

export default EligibilityRuleView