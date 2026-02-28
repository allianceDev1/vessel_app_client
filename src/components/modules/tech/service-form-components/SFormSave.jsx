import React, { useEffect, useState } from 'react'
import './s-form-save.scss'
import Message from '../../../UI_Primitives/message/Message'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../../../UI_Primitives/buttons/Button'
import { api } from '../../../../api'
import { sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'


const SFormSave = ({ modalId }) => {
    const dispatch = useDispatch();
    const { internet } = useSelector((state) => state.system)
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)
    const [formVerification, setFormVerification] = useState({ ok: false, type: null, message: null })
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ error: false, message: "" })
    const [apiProgress, setApiProgress] = useState(0);
    const [apiStatus, setApiStatus] = useState("");

    const handleProceed = async () => {

        setError({ error: false, message: "" })

        if (!internet) {
            dispatch(toast.push({
                type: 'warning',
                message: 'No internet connection'
            }))

            return;
        }

        if (!formVerification?.ok) {
            return;
        }

        // setup Body
        const body = {
            service_form_uuid: serviceForm?.service_form_uuid,
            customer_id: serviceForm?.customer_id,
            registration_id: serviceForm?.registration_id,
            visit_uuid: serviceForm?.visit_uuid,
            technician_uuid: serviceForm?.technician_uuid,
            site_info: {
                work_site: serviceForm?.work_site,
                source: serviceForm?.source,
                tank_capacity_ltr: serviceForm?.tank_capacity_ltr,
                floor_hight: serviceForm?.floor_hight,
                t_hight: serviceForm?.t_hight
            },
            service_products: [],
            new_add_ons: (serviceForm?.new_add_ons || [])?.map((value) => {
                return {
                    unique_id: value?.unique_id,
                    item_id: value?.item_id,
                    item_uuid: value?.item_uuid,
                    purchase_type: value?.purchase_type,
                    is_zero_fee: value?.is_zero_fee || false,
                    expire_date: value?.expire_date,
                    element: {
                        spare_uuid: value?.element?.spare_uuid,
                        qty: value?.element?.qty
                    },
                    service_charge_estimate: value?.service_charge?.list_price || 0
                }
            }),
            repeat: {
                system_say: serviceForm?.repeat?.system_say || false,
                tech_say: serviceForm?.repeat?.tech_say || false,
                comment: serviceForm?.repeat?.comment || null
            },
            work_status: {
                closed: serviceForm?.work_status?.closed || false,
                schedule_date: serviceForm?.work_status?.schedule_date || null,
                start_time: serviceForm?.work_status?.start_time || null,
                end_time: serviceForm?.work_status?.end_time || null
            }
        }

        Object.entries(serviceForm?.service_products || {}).forEach(([key, value]) => {
            const isVessel = key.startsWith("V") ? true : false;

            if (!serviceFormSettings?.products?.[key]?.is_submitted) {
                return;
            }

            if (isVessel) {
                body?.service_products?.push({
                    product_id: key,
                    current_condition: value?.current_condition,
                    inspection_report: {
                        condition_status: value?.inspection_report?.condition === "Good",
                        tech_analyze: value?.inspection_report?.tech_analyze || null
                    },
                    service_data: {
                        is_skipped: !value?.service_data?.category_id || false,
                        service_id: value?.service_data?.service_id || null,
                        category_id: value?.service_data?.category_id || null,
                        mode: value?.service_data?.mode || null,
                        service_charge_estimate: value?.service_data?.service_charge?.estimate || null,
                        renewed_package: value?.service_data?.renewed_package?.is_renewed ? {
                            is_renewed: true,
                            package_id: value?.service_data?.renewed_package?.package_id
                        } : null
                    },
                    work: {
                        service_list: (value?.work?.services_list || [])?.map(s => ({
                            service_uuid: s?.service_uuid,
                            service_type: s?.service_type
                        })),
                        components_list: (value?.work?.components_list || [])?.map(c => ({
                            spare_uuid: c?.spare_uuid,
                            spare_type: c?.spare_type,
                            qty: c?.qty
                        })),
                        removed_components_list: (value?.removed_components_list || [])?.map(c => ({
                            spare_uuid: c?.spare_uuid,
                            spare_type: c?.spare_type,
                        }))
                    },
                    evaluation: {
                        filtered_water: value?.evaluation?.filtered_water,
                        water_quality: {
                            status: value?.evaluation?.water_quality?.status === 'Good',
                            comment: value?.evaluation?.water_quality?.comment
                        }
                    }
                })
            } else {
                body?.service_products?.push({
                    product_id: key,
                    current_condition: {
                        working: {
                            status: value?.current_condition?.working?.status === 'Good',
                            comment: value?.current_condition?.working?.comment || null
                        },
                        lead_crack: {
                            status: value?.current_condition?.lead_crack?.status === 'Yes',
                            comment: value?.current_condition?.lead_crack?.comment || null
                        },
                    },
                    service_data: {
                        is_skipped: !value?.service_data?.category_id || false,
                        category_id: value?.service_data?.category_id || null,
                        mode: value?.service_data?.mode || null,
                        service_charge_estimate: value?.service_data?.service_charge?.estimate || null
                    },
                    work: {
                        service_list: (value?.work?.services_list || [])?.map(s => ({
                            service_uuid: s?.service_uuid,
                            service_type: s?.service_type
                        })),
                        components_list: (value?.work?.components_list || [])?.map(c => ({
                            spare_uuid: c?.spare_uuid,
                            spare_type: c?.spare_type,
                            qty: c?.qty
                        })),
                        removed_components_list: (value?.removed_components_list || [])?.map(c => ({
                            spare_uuid: c?.spare_uuid,
                            spare_type: c?.spare_type,
                        }))
                    },
                    evaluation: {
                        working: {
                            status: value?.evaluation?.working?.status === 'Good',
                            comment: value?.evaluation?.working?.comment || null
                        },
                        lead_crack: {
                            status: value?.evaluation?.lead_crack?.status === 'Yes',
                            comment: value?.evaluation?.lead_crack?.comment || null
                        }
                    }
                })
            }
        })

        try {
            setLoading(true)

            const result = await api.vfTv2Axios.post('/service/service-form/save', body, {
                timeout: 5 * 60 * 1000,
                onUploadProgress: (progressEvent) => {
                    if (!progressEvent.total) return;

                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );

                    setApiProgress(percent);

                    if (percent < 100) {
                        setApiStatus(`Uploading data...`);
                    } else {
                        setApiStatus("Processing...");
                    }
                }
            })

            // Update save and navigate
            const savedProducts = Array.isArray(result?.products)
                ? new Set(result.products)
                : new Set();

            const updatedProducts = Object.entries(serviceFormSettings?.products ?? {})
                .reduce((acc, [key, value]) => {
                    acc[key] = {
                        ...value,
                        is_saved: savedProducts.has(key)
                    };
                    return acc;
                }, {});

            dispatch(
                sfSetting.update({
                    form_saved: true,
                    form_saved_time: new Date(result?.save_time).toISOString(),
                    activePage: 101,
                    products: updatedProducts
                })
            );

            dispatch(modal.pull.single(modalId))

        } catch (error) {
            setError({
                error: true,
                message: error?.message
            })
        } finally {
            setLoading(false)
            setApiProgress(0);
            setApiStatus("");
        }


    }

    const closeModal = () => {
        dispatch(modal.pull.single(modalId))
    }

    useEffect(() => {
        // Check required element
        if (!serviceForm?.customer_id || !serviceForm?.registration_id || !serviceForm?.in_time || !serviceForm?.visit_uuid
            || !serviceForm?.technician_uuid) {
            setFormVerification({ ok: false, type: 'danger', message: "The required form element are missing" })

            return;
        }

        const formProductCount = Object.keys(serviceForm?.service_products || {}).length || 0
        const saveProductCount = Object.values(
            serviceFormSettings?.products ?? {}
        ).filter(product => product?.is_submitted === true).length;

        // Check saved product count
        if (!saveProductCount) {
            setFormVerification({
                ok: false, type: 'danger', message: `You have not saved any product, To continue please save any product.`
            })
            return;
        }

        // Check all product saved.
        if (formProductCount !== saveProductCount) {
            setFormVerification({
                ok: true, type: 'warning', message: `You have submitted only ${saveProductCount} products out of the ${formProductCount} selected products. 
                Please confirm and proceed with the submitted products.`
            })
            return;
        }

        // Check it is unchangeable work
        let validSubmitsCount = Object.entries(serviceFormSettings?.products ?? {}).reduce(
            (count, [key, product]) => {
                const isSubmitted = product?.is_submitted;
                const hasCategory =
                    (serviceForm?.service_products ?? {})?.[key]?.service_data?.category_id;

                return isSubmitted && hasCategory ? count + 1 : count;
            },
            0
        );

        if (!serviceForm?.new_add_ons?.length && !validSubmitsCount) {
            setFormVerification({
                ok: false,
                type: 'danger',
                message: `No valid product work found. Please complete at least one product or add-on before proceeding.`
            })
            return;
        }

        setFormVerification({ ok: true })

    }, [serviceForm, serviceFormSettings])


    return (
        <div className="s-form-save-and-review-container">
            {/* Proceed */}
            {!error?.error && !loading && <div className='submit-section'>
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

                {/* Messages */}
                {formVerification?.message ? <Message type={formVerification?.type} message={formVerification?.message} /> : ''}
                {!internet ? <Message type={'danger'} message={"No internet connection"} /> : ''}

                {/* Buttons */}
                <div className="buttons-div">
                    <Button label={'Close'} rounded style={{ width: '100%', marginTop: '20px' }} onClick={closeModal} />
                    <Button label={'Proceed'} severity={'primary'} rounded style={{ width: '100%', marginTop: '20px' }}
                        onClick={handleProceed} disabled={!internet || !formVerification?.ok} />
                </div>
            </div>}

            {/* Loading */}
            {!error?.error && loading && <div className="loading-section">
                <h4>{apiStatus || 'Wait a moment...'}</h4>

                <div className="progress-bar">
                    <div className="progress" style={{ width: `${apiProgress}%` }}></div>
                </div>

                <p>Your request is currently being processed. <br></br>
                    Please wait and do not refresh the page or navigate away.</p>
            </div>}

            {/* Error */}
            {error?.error && <div className="error-section">
                <h4>Data Saving Failed</h4>

                <p>{error?.message}</p>

                <div className="buttons-div">
                    <Button label={'Close'} rounded style={{ width: '100%', marginTop: '20px' }} onClick={closeModal} />
                    <Button label={'Try again'} severity={'primary'} rounded style={{ width: '100%', marginTop: '20px' }}
                        onClick={handleProceed} disabled={!internet || !formVerification?.ok} />

                </div>

            </div>}
        </div>
    )
}

export default SFormSave