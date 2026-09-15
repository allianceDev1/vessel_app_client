import React from 'react'
import './spare-card.scss'
import Badge from '../../../UI_Primitives/badge/Badge'
import Dropdown from '../../../UI_Primitives/dropdown/Dropdown'
import { TbDots, TbPencil, TbTrash } from 'react-icons/tb'
import { isoToDDMonYYYY, isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { useDispatch, useSelector } from 'react-redux'
import { modal, doDialog, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import UpdateSpare from '../../../forms/controller/product/UpdateSpare'
import { api } from '../../../../api'
import { useQueryClient } from '@tanstack/react-query'


const SpareCard = ({
    productId, spareId, componentUuid, spareName, trackingType, spareCategory, warrantyStarted,
    warrantyExpiry, warrantyPeriod, insertAt, isReadyOnly = false, Qty, Unit
}) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const { user } = useSelector((state) => state.user)

    const uniqueId = componentUuid ? String(componentUuid).slice(-3).toLowerCase() : null
    const isGroup = trackingType?.toUpperCase() === 'GROUP'

    const dropdownOptions = [
        {
            items: [
                {
                    label: 'Update',
                    icon: <TbPencil />,
                    onClick: () => {
                        dispatch(modal.push({
                            title: "Update Spare",
                            body: <UpdateSpare
                                productId={productId}
                                spareId={spareId}
                                componentUuid={componentUuid}
                                spareName={spareName}
                                warrantyStarted={isoToYYYYMMDD(warrantyStarted)}
                                warrantyPeriod={warrantyPeriod}
                                insertAt={isoToYYYYMMDD(insertAt)}
                                isGroup={isGroup}
                            />
                        }))
                    }
                },
                {
                    label: 'Remove', theme: 'danger', icon: <TbTrash />, onClick: () => {
                        dispatch(doDialog.confirm({
                            message: 'Remove spare from product ?',
                            accept: {
                                onClick: async () => {
                                    try {
                                        await api.vfCv2Axios.delete(`/product/${productId}/spare/${componentUuid}`)

                                        queryClient.refetchQueries({
                                            queryKey: ['controller_customer_spare_list', productId],
                                        })

                                    } catch (error) {
                                        dispatch(toast.push({
                                            type: "danger",
                                            head: 'Updating Failed',
                                            message: error?.message || 'Something went wrong'
                                        }))
                                    }
                                }
                            }
                        }))
                    }
                }
            ]
        }
    ]


    return (
        <div className="spare-card-item-container">
            <div className="section-one">
                <div className="left-section">
                    <h4>{spareName}</h4>
                    <p>{spareId} {uniqueId ? `(${uniqueId}) ` : ''}- {toStandardText(spareCategory)}</p>
                </div>
                {user?.allowed_origins?.some(a => ['vessel_c_writer', 'vessel_c_admin'].includes(a)) &&
                    <div className="right-section">
                        {!isReadyOnly && <Dropdown button={{
                            icon: <TbDots />,
                            size: "small",
                            text: true
                        }}
                            list={dropdownOptions}
                        />}
                    </div>}
            </div>
            <div className="section-two">
                <div className="left-section">
                    {uniqueId && (
                        <div>
                            <p className='unique-id-label'>Unique id</p>
                            <p className='unique-id'>{uniqueId}</p>
                        </div>
                    )}
                    {!isGroup && (
                        <div>
                            <p className='warranty-label'>Warranty expiry</p>
                            <p className={`date ${warrantyExpiry ? (new Date(warrantyExpiry) >= new Date() ? 'success' : 'danger') : ''}`}>
                                {warrantyExpiry ? isoToDDMonYYYY(warrantyExpiry) : 'Nil'}
                            </p>
                        </div>
                    )}
                </div>
                <div className="right-section">
                    {trackingType ? (
                        <Badge
                            value={trackingType.toUpperCase()}
                            size={'md'}
                            severity={isGroup ? 'secondary' : 'info'}
                        />
                    ) : Qty ? (
                        <Badge value={`${Qty} ${Unit || ''}`} size={'md'} />
                    ) : null}
                    <p className='date-label'>Insert at</p>
                    <p className='date'>{insertAt ? isoToDDMonYYYY(insertAt) : 'Nil'}</p>
                </div>
            </div>
        </div>
    )
}

export default SpareCard