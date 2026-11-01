import React from 'react'
import './contacts.scss';
import { TbBrandWhatsapp, TbPhone, TbPhonePlus } from 'react-icons/tb';
import { maskPhoneNumber } from '../../../../utils/helpers/text-formatting';

const Contacts = ({ contacts = {} }) => {
    const { primary, secondary, whatsapp, additional } = contacts || {};

    const isPrimaryValid = (primary?.length || 0) > 4;
    const isSecondaryValid = (secondary?.length || 0) > 4;
    const isWhatsappValid = (whatsapp?.length || 0) > 4;
    const isAdditionalValid = (additional?.length || 0) > 4;
    const hasAdditional = Boolean(additional);

    const handleCallClick = (number) => {
        if (!number) return;

        const formattedNumber = String(number).trim().startsWith("+")
            ? String(number).trim()
            : `+${String(number).trim()}`;

        window.open(`tel:${formattedNumber}`);
    };

    const handleWhatsappClick = (number) => {
        if ((number?.length || 0) < 5) return;
        window.open(`https://wa.me/${number}`);
    };
    
    return (
        <div className="tech-customer-contacts">
            <div className="contacts-grid">
                {/* Primary Call */}
                <div
                    className={`contact-card call ${!isPrimaryValid ? 'disabled' : ''}`}
                    onClick={() => isPrimaryValid && handleCallClick(primary)}
                >
                    <div className="contact-icon-wrapper call">
                        <TbPhone />
                    </div>
                    <div className="contact-info">
                        <span className="contact-title">Primary</span>
                        <span className="contact-number">
                            {isPrimaryValid ? maskPhoneNumber(primary) : 'Not available'}
                        </span>
                    </div>
                </div>

                {/* Secondary Call */}
                <div
                    className={`contact-card call ${!isSecondaryValid ? 'disabled' : ''}`}
                    onClick={() => isSecondaryValid && handleCallClick(secondary)}
                >
                    <div className="contact-icon-wrapper call">
                        <TbPhone />
                    </div>
                    <div className="contact-info">
                        <span className="contact-title">Secondary</span>
                        <span className="contact-number">
                            {isSecondaryValid ? maskPhoneNumber(secondary) : 'Not available'}
                        </span>
                    </div>
                </div>

                {/* Additional Call (if present) */}
                {hasAdditional && (
                    <div
                        className={`contact-card call ${!isAdditionalValid ? 'disabled' : ''}`}
                        onClick={() => isAdditionalValid && handleCallClick(additional)}
                    >
                        <div className="contact-icon-wrapper call">
                            <TbPhonePlus />
                        </div>
                        <div className="contact-info">
                            <span className="contact-title">Additional</span>
                            <span className="contact-number">
                                {isAdditionalValid ? maskPhoneNumber(additional) : 'Not available'}
                            </span>
                        </div>
                    </div>
                )}

                {/* WhatsApp */}
                <div
                    className={`contact-card whatsapp ${!hasAdditional ? 'full-width' : ''} ${!isWhatsappValid ? 'disabled' : ''}`}
                    onClick={() => isWhatsappValid && handleWhatsappClick(whatsapp)}
                >
                    <div className="contact-icon-wrapper whatsapp">
                        <TbBrandWhatsapp />
                    </div>
                    <div className="contact-info">
                        <span className="contact-title">WhatsApp</span>
                        <span className="contact-number">
                            {isWhatsappValid ? maskPhoneNumber(whatsapp) : 'Not available'}
                        </span>
                    </div>
                    {!hasAdditional && isWhatsappValid && (
                        <div className="action-pill">Chat</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Contacts