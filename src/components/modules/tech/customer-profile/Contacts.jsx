import React, { useState } from 'react'
import './contacts.scss';
import { copyToClipboard } from '../../../../utils/services/event-service';
import Button from '../../../UI_Primitives/buttons/Button';
import { TbBrandWhatsapp, TbCheck, TbCopy, TbPhone } from 'react-icons/tb';

const Contacts = ({ contacts: { primary, secondary, whatsapp, additional } }) => {
    const [copied, setCopied] = useState(null);

    const handleCallClick = (number) => {
        window.open(`tel:${number}`);
    };

    const handleWhatsappClick = (number) => {
        window.open(`https://wa.me/${number}`);
    };

    const handleCopyNumber = async (number, type) => {
        const result = await copyToClipboard(number)

        if (result.success) {
            setCopied(type);

            // Reset icon after 2.5s
            setTimeout(() => setCopied(null), 2500);
        }
    };


    return (
        <div className="tech-customer-contacts">
            {primary?.length > 4 && <div className="contact">
                <label>Primary </label>
                <span>: {primary}</span>
                <div className="actions">
                    {copied === 'primary'
                        ? <Button icon={<TbCheck />} text size='small' />
                        : <Button icon={<TbCopy />} text size='small' onClick={() => handleCopyNumber(primary, 'primary')} />}
                    <Button icon={<TbPhone />} text size='small' severity={'info'} onClick={() => handleCallClick(primary)} />
                </div>
            </div>}
            {secondary?.length > 4 && <div className="contact">
                <label>Secondary </label>
                <span>: {secondary}</span>
                <div className="actions">
                    {copied === 'secondary'
                        ? <Button icon={<TbCheck />} text size='small' />
                        : <Button icon={<TbCopy />} text size='small' onClick={() => handleCopyNumber(secondary, 'secondary')} />}
                    <Button icon={<TbPhone />} text size='small' severity={'info'} onClick={() => handleCallClick(secondary)} />
                </div>
            </div>}
            {whatsapp?.length > 5 && <div className="contact">
                <label>Whatsapp </label>
                <span>: {whatsapp}</span>
                <div className="actions">
                    {copied === 'whatsapp'
                        ? <Button icon={<TbCheck />} text size='small' />
                        : <Button icon={<TbCopy />} text size='small' onClick={() => handleCopyNumber(whatsapp, 'whatsapp')} />}
                    <Button icon={<TbBrandWhatsapp />} text size='small' severity={'success'} onClick={(e) => handleWhatsappClick(whatsapp)} />
                </div>
            </div>}
            {additional?.length > 5 && <div className="contact">
                <label>Additional </label>
                <span>: {additional}</span>
                <div className="actions">
                    {copied === 'additional'
                        ? <Button icon={<TbCheck />} text size='small' />
                        : <Button icon={<TbCopy />} text size='small' onClick={() => handleCopyNumber(additional, 'additional')} />}
                    <Button icon={<TbPhone />} text size='small' severity={'info'} onClick={() => handleCallClick(additional)} />
                </div>
            </div>}
        </div >
    )
}

export default Contacts