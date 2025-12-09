import React from 'react'
import './name-card.scss'
import { TbChevronRight } from 'react-icons/tb'
import Badge from '../../../UI_Primitives/badge/Badge';

const NameCard = ({ fullName, customerId, isActive = true, isDeleted = false, onClick = null }) => {
    return (
        <div className="tech-customer-name-card-comp" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'auto' }}>
            <h3>{fullName || 'Unknown'}</h3>
            <h5>Customer ID : {customerId || '-'}</h5>
            {onClick && <div className='arrow'>
                <TbChevronRight />
            </div>}
            {isDeleted ? <div className="status-card">
                <Badge value={'Deleted'} severity={'danger'} size={'md'} />
            </div> : !isActive
                ? <div className="status-card">
                    <Badge value={'Inactive'} severity={'danger'} size={'md'} />
                </div>
                : ''
            }
        </div >
    )
}

export default NameCard