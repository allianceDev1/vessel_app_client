import React, { forwardRef, useImperativeHandle, useRef, } from 'react'
import './service-success.scss'
import * as htmlToImage from "html-to-image";
import { TbId, TbUser } from 'react-icons/tb';
import Badge from '../../../../UI_Primitives/badge/Badge'
import BrandLogo from '../../../../../assets/images/icons/alliance-logo.png';

const ServiceSuccess = forwardRef(({ data }, ref) => {
    const containerRef = useRef(null);

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toFixed(2)}`;
    };

    const shareAsImage = async () => {
        if (!containerRef.current) return;

        const node = containerRef.current;
        const clonedNode = node.cloneNode(true);

        clonedNode.className = "tech-service-success-screen"

        document.body.appendChild(clonedNode);

        const dataUrl = await htmlToImage.toJpeg(clonedNode, {
            quality: 0.95,
            backgroundColor: "var(--background)",
            pixelRatio: 2,
        });

        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "service-success.jpg", {
            type: "image/jpeg",
        });

        document.body.removeChild(clonedNode);

        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: "Service Completed",
                text: `🎉 Your service has been completed successfully!

Thank you for choosing Alliance Water Solutions. We're committed to providing reliable water purification solutions and exceptional customer support.

Have a great day! 💙`,
                files: [file],
            });
        } else {
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = "service-success.jpg";
            link.click();
        }
    };

    useImperativeHandle(ref, () => ({
        shareAsImage,
    }));


    return (
        <div ref={containerRef} className="tech-service-success-screen view-animation-mode">
            {/* Success icon */}
            <div className="success-icon-container">
                <div className="success-icon">
                    <svg className="checkmark" viewBox="0 0 52 52" width="50" height="50">
                        <path
                            d="M14 27l10 10 20-20"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="100"
                            strokeDashoffset="0" />
                    </svg>
                </div>
            </div>

            {/* Title */}
            <div className="title-section">
                <div className="title">Service Completed</div>
                <div className="subtitle">The service has been successfully closed
                    <br></br> on {data?.date}
                </div>
            </div>

            {/* Service Serial Number Card */}
            <div className="card">
                <div className="card-title">Service Serial Number</div>
                <div className="service-number">
                    <span className="service-value">{data?.serviceNumber}</span>
                </div>
            </div>

            {/* Payment Status Card */}
            {!data?.unenable_payment && <div className="card">
                <div className="payment-header">
                    <div className="card-title" style={{ marginBottom: 0 }}>Payment Status</div>
                    {data?.paymentStatus && <Badge value={data?.paymentStatus || "Pending"}
                        severity={data?.paymentColor} size={'md'} />}
                </div>

                <div className="amount-section">
                    <div className="amount">
                        <h3>{formatCurrency(data?.verifiedAmount)}</h3>
                        {data?.totalBillAmount !== data?.verifiedAmount && <h4>/ {formatCurrency(data?.totalBillAmount)}</h4>}
                    </div>
                    {data?.paymentDescription && (
                        <div className="amount-subtitle">{data?.paymentDescription}</div>
                    )}
                </div>

                {Number(data?.verifiedAmount) > 0 && data?.receiptNo && (
                    <div className="payment-id-section">
                        <span className="payment-id-label">Receipt No</span>
                        <span className="payment-id-value">{data?.receiptNo}</span>
                    </div>
                )}
            </div>}

            {/* Unenable payment alert */}
            {data?.unenable_payment && <div className="card">
                <div className="payment-header">
                    <div className="card-title" style={{ marginBottom: 0 }}>Service Amount</div>
                </div>

                <div className="amount-section">
                    <div className="amount">
                        <h3>{formatCurrency(data?.totalBillAmount)}</h3>
                    </div>
                    <div className="amount-note" style={{ marginTop: '10px' }}>
                        Registration closure is pending. The final bill will be issued once the registration is closed.
                        Any advance amount collected will be adjusted in the final bill.
                    </div>
                </div>
            </div>}


            {/* Customer Details Card */}
            <div className="card">
                <div className="card-title">Customer Details</div>

                <div className="customer-row">
                    <div className="customer-icon">
                        <TbUser />
                    </div>
                    <div className="customer-info">
                        <div className="customer-label">Customer Name</div>
                        <div className="customer-value">{data?.customerName}</div>
                    </div>
                </div>

                <div className="customer-row">
                    <div className="customer-icon">
                        <TbId />
                    </div>
                    <div className="customer-info">
                        <div className="customer-label">Customer ID</div>
                        <div className="customer-value">{data?.customerId}</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bottom-section">
                <p>This screen confirms the service completion. It is not a bill or receipt.</p>
                <img src={BrandLogo} alt='brand-logo' />
            </div>

        </div>
    )
})

export default ServiceSuccess