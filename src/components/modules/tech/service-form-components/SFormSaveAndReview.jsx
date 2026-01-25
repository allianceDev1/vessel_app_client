import React, { useEffect, useState } from 'react'
import './s-form-save.scss'
import Message from '../../../UI_Primitives/message/Message'
import { useSelector } from 'react-redux'
import Button from '../../../UI_Primitives/buttons/Button'


const SFormSaveAndReview = () => {
    const [apiStatus, setApiStatus] = useState({ submitted: false, saved: false })
    const [formVerification, setFormVerification] = useState({ checked: false, message: null })
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)
    const [loading, setLoading] = useState()

    const handleProceed = () => {

    }

    useEffect(() => {
        if (!serviceForm?.customer_id || !serviceForm?.registration_id || !serviceForm?.in_time || !serviceForm?.visit_uuid
            || !serviceForm?.technician_uuid) {
            setFormVerification({ checked: true, message: "The required form element are missing" })

            return;
        }

        const formProductCount = Object.keys(serviceForm?.service_products).length || 0
        const saveProductCount = Object.values(
            serviceFormSettings?.products ?? {}
        ).filter(product => product?.is_submitted === true).length;

        console.log(formProductCount, saveProductCount)
        if (formProductCount !== saveProductCount) {
            setFormVerification({
                checked: true, message: `You have saved only ${saveProductCount} products out of the ${formProductCount} selected products. 
                Please confirm and proceed with the saved products.`
            })
            return;
        }

    }, [serviceForm, serviceFormSettings])


    return (
        <div className="s-form-save-and-review-container">
            {!apiStatus?.submitted && !apiStatus?.saved && <div className='submit-section'>
                <div className="text-section">
                    <h2>Ready to Save</h2>
                    <p>
                        By proceeding, the information you entered will be sent to the server. The server will verify the data and product
                        conditions, then temporarily save your information.
                        <br></br>
                        <br></br>
                        You can edit the details before the final submission of the service form. If you make any changes to the product data, you must save it again.
                        <br></br>
                        <br></br>
                        After saving, review the information carefully. If any mismatches are found, please correct the entered data. If the issue cannot be resolved, contact your manager before taking any further action.
                    </p>
                </div>

                {formVerification?.message ? <Message type={'warning'} message={formVerification?.message} /> : ''}

                <Button label={'Proceed'} severity={'primary'} rounded style={{ width: '100%', marginTop: '20px' }} onClick={handleProceed}
                    spinIcon={loading} />
            </div>}
        </div>
    )
}

export default SFormSaveAndReview