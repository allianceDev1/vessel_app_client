import React from 'react'
import './contacts.scss';
import { TbBrandWhatsapp, TbPhone } from 'react-icons/tb';
// import { useLongPress } from '../../../hooks/useLongPress';

const Contacts = ({ contacts: { primary, secondary, whatsapp, additional } }) => {
    // const [copied, setCopied] = useState(null);

    const handleCallClick = (number) => {
        if ((number?.length || 0) < 5) return;
        window.open(`tel:${number}`);
    };

    const handleWhatsappClick = (number) => {
        if ((number?.length || 0) < 5) return;
        window.open(`https://wa.me/${number}`);
    };

    // const handleCopyNumber = async (number, type) => {
    //     const result = await copyToClipboard(number)

    //     if (result.success) {
    //         setCopied(type);

    //         // Reset icon after 2.5s
    //         setTimeout(() => setCopied(null), 2500);
    //     }
    // };

    return (
        <div className="tech-customer-contacts">
            <div className="contacts-container" style={{ gridTemplateColumns: additional ? 'repeat(4,1fr)' : 'repeat(3,1fr)' }}>
                <div className={primary?.length > 4 ? "call-button" : "call-button disable-button"} onClick={() => handleCallClick(primary)}>
                    <TbPhone />
                    <p>Primary</p>
                </div>
                <div className={secondary?.length > 4 ? "call-button" : "call-button disable-button"} onClick={() => handleCallClick(secondary)}>
                    <TbPhone />
                    <p>Secondary</p>
                </div>
                {additional && <div className={additional?.length > 4 ? "call-button" : "call-button disable-button"} onClick={() => handleCallClick(additional)}>
                    <TbPhone />
                    <p>Additional</p>
                </div>}
                <div className={whatsapp?.length > 4 ? "call-button" : "call-button disable-button"} onClick={() => handleWhatsappClick(whatsapp)}>
                    <TbBrandWhatsapp />
                    <p>Whatsapp</p>
                </div>
            </div>
        </div >
    )
}

export default Contacts