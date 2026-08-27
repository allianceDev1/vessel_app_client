import React, { useMemo } from 'react'
import './amount-card.scss'
import { productFormTotalAmount } from '../../../../utils/helpers/math-equations'

const AmountCard = ({ product }) => {

    const productTotal = useMemo(() => {
       
        return productFormTotalAmount({
            components: product?.work?.components_list || [],
            serviceWorks: product?.work?.services_list || [],
            serviceCharge: {
                estimate: Number(product?.service_data?.service_charge?.estimate) || 0,
                applied: Number(product?.service_data?.service_charge?.applied) || 0
            },
            packageRate: Number(product?.service_data?.renewed_package?.price?.total_rate) || 0
        })

    }, [product])


    return (
        <div className="tech-form-amount-card-container">
            <div className="left-section">
                <p>Estimate</p>
                <h3>₹{productTotal?.estimate || 0}</h3>
            </div>
            <div className="right-section">
                <p>Receivable</p>
                <h3>₹{productTotal?.applied || 0}</h3>
            </div>
        </div>
    )
}

export default AmountCard