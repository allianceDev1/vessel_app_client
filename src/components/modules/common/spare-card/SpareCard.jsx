import React, { useState } from 'react'
import './spare-card.scss'
import Badge from '../../../UI_Primitives/badge/Badge'
import Dropdown from '../../../UI_Primitives/dropdown/Dropdown'
import { TbDots, TbPencil, TbTrash } from 'react-icons/tb'
import { isoToDDMonYYYY, isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { useDispatch } from 'react-redux'
import { modal, doDialog, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import UpdateSpare from '../../../forms/controller/product/UpdateSpare'
import { api } from '../../../../api'
import { useQueryClient } from '@tanstack/react-query'


const SpareCard = ({
    customerId, productId, spareId, spareUuid, spareName, spareCategory, Qty, Unit, warrantyStarted, warrantyExpiry, warrantyPeriod, insertAt
}) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient()

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
                                customerId={customerId}
                                productId={productId}
                                spareId={spareId}
                                spareUuid={spareUuid}
                                spareName={spareName}
                                Qty={Qty}
                                warrantyStarted={isoToYYYYMMDD(warrantyStarted)}
                                warrantyPeriod={warrantyPeriod}
                                insertAt={isoToYYYYMMDD(insertAt)}
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
                                        await api.vfCv2Axios.delete(`/product/${productId}/spare/${spareUuid}`)

                                        queryClient.refetchQueries({
                                            queryKey: ['controller_customer_spare_list', customerId, productId],
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
                    <p>{spareId} - {toStandardText(spareCategory)}</p>
                </div>
                <div className="right-section">
                    <Dropdown button={{
                        icon: <TbDots />,
                        size: "small",
                        text: true
                    }}
                        list={dropdownOptions}
                    />
                </div>
            </div>
            <div className="section-two">
                <div className="left-section">
                    <p className='qty-label'>Qty available</p>
                    <p className='warranty-label'>Warranty expiry</p>
                    <p className={`date ${new Date(warrantyExpiry) >= new Date() ? 'success' : 'danger'}`}>
                        {warrantyExpiry ? isoToDDMonYYYY(warrantyExpiry) : 'Nil'}
                    </p>
                </div>
                <div className="right-section">
                    <Badge value={`${Qty} ${Unit || ''}`} size={'md'} />
                    <p className='date-label'>Insert at</p>
                    <p className='date'>{insertAt ? isoToDDMonYYYY(insertAt) : 'Nil'}</p>
                </div>
            </div>
        </div>
    )
}

export default SpareCard