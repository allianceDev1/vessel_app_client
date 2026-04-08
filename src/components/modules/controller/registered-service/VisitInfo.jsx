import React from 'react'
import './registration-info.scss'
import Badge from '../../../UI_Primitives/badge/Badge'


const VisitInfo = ({ regNo }) => {
    return (
        <div className="registration-info-container">
            <h3 className='sub-title'>Visit Info</h3>
            <div className="reg-content">
                <div className="list">
                    <div className="item">
                        <p className='label'>Visit Index</p>
                        <div>
                            <p className='text-value'>1</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Technician</p>
                        <div>
                            <p className='text-value'>2025 May 26, 10 : 35 PM</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Slot</p>
                        <div>
                            <p className='text-value'>Customer Using Whatsapp Flow</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Travel Started Time</p>
                        <div>
                            <p className='text-value'>2025 May 26, 10 : 35 PM</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Visit Status</p>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <Badge value={'Closed'} severity={'success'} />
                            <p className='text-value'>SRL NUMBER</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Service Time & Duration</p>
                        <div>
                            <p className='text-value'>2025 May 26, 10 : 35 PM to 10 : 35 PM (56 Min)</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Cancelled</p>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <p className='text-value'>9999999999 (INR)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VisitInfo