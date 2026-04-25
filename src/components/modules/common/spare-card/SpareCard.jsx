import React from 'react'
import './spare-card.scss'
import Badge from '../../../UI_Primitives/badge/Badge'
import Button from '../../../UI_Primitives/buttons/Button'
import { TbPencil } from 'react-icons/tb'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { toStandardText } from '../../../../utils/helpers/text-formatting'


const SpareCard = ({ spareId, spareName, spareCategory, Qty, warrantyExpiry, insertAt }) => {
    return (
        <div className="spare-card-item-container">
            <div className="section-one">
                <div className="left-section">
                    <h4>{spareName}</h4>
                    <p>{spareId}</p>
                </div>
                <div className="right-section">
                    <p>{toStandardText(spareCategory)}</p>
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
                    <Badge value={Qty} size={'md'} />
                    <p className='date-label'>Insert at</p>
                    <p className='date'>{insertAt ? isoToDDMonYYYY(insertAt) : 'Nil'}</p>
                </div>
            </div>
            <div className="hover-section">
                <Button icon={<TbPencil />} rounded size='small' outlined />
            </div>
        </div>
    )
}

export default SpareCard