import React, { forwardRef, useImperativeHandle, useRef, } from 'react'
import Badge from '../../../../UI_Primitives/badge/Badge'
import './service-success.scss'
import { TbId, TbUser } from 'react-icons/tb';
import * as htmlToImage from "html-to-image";

const ServiceSuccess = forwardRef(({ data }, ref) => {
    const containerRef = useRef(null);

    const formatCurrency = (value) => {
        return `₹${value.toFixed(2)}`;
    };

   
    const shareAsImage = async () => {

        const dataUrl = await htmlToImage.toJpeg(containerRef.current, {
            quality: 0.95,
            backgroundColor: "var(--background)",
            pixelRatio: 2, 
        });

        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "service-success.jpg", {
            type: "image/jpeg",
        });

        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: "Service Completed",
                text: "Service completion details",
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
        <div ref={containerRef} className="tech-service-success-screen">
            {/* Success icon */}
            <div className="success-icon-container">
                <div className="success-icon">
                    <svg className="checkmark" viewBox="0 0 52 52" width="50" height="50">
                        <path d="M14 27l10 10 20-20"
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
                <div className="subtitle">The service has been successfully closed</div>
            </div>

            {/* Service Serial Number Card */}
            <div className="card">
                <div className="card-title">Service Serial Number</div>
                <div className="service-number">
                    <span className="service-value">{data?.serviceNumber}</span>
                </div>
            </div>

            {/* Payment Status Card */}
            <div className="card">
                <div className="payment-header">
                    <div className="card-title" style={{ marginBottom: 0 }}>Payment Status</div>
                    {/* <span className={`status-badge ${data?.paymentStatus === 'completed' ? 'status-completed' : 'status-pending'}`}>
                        {data?.paymentStatus === 'completed' ? 'Completed' : 'Pending'}
                    </span> */}
                    <Badge value={'Completed'} severity={'success'} size={'md'} />
                </div>

                <div className="amount-section">
                    <div className="amount">{formatCurrency(data?.amount)}</div>
                    {data?.paymentStatus === 'pending' && (
                        <div className="amount-subtitle">Payment will be collected later</div>
                    )}
                </div>

                {data?.paymentStatus === 'completed' && data?.paymentId && (
                    <div className="payment-id-section">
                        <span className="payment-id-label">Payment ID</span>
                        <span className="payment-id-value">{data?.paymentId}</span>
                    </div>
                )}
            </div>

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


        </div>
    )
})

export default ServiceSuccess