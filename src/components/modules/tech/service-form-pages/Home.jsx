import React, { useEffect, useState } from 'react'
import './home.scss'
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service'
import { TbAlertCircle, TbChevronRight, TbPlus, TbShieldCheck, TbSitemap, TbTrash } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { getUpcomingServiceType } from '../../../../utils/services/product_service'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import { packageExpireTypes } from '../../../../assets/javascript/pre_data/package'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { isoToYYYYMMDD, normalizeDate } from '../../../../utils/helpers/date-helpers'
import { generateUniqueId } from '../../../../utils/helpers/generate_Id'
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState'
import Badge from '../../../UI_Primitives/badge/Badge'
import Button from '../../../UI_Primitives/buttons/Button'
import AddNewAddOn from '../service-form-components/AddNewAddOn'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import SFormSave from '../service-form-components/SFormSave'
import RadioCard from '../../../UI_Primitives/inputs/RadioCard'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { IconCrown } from '@tabler/icons-react'



const Home = ({ pageKey }) => {
    const dispatch = useDispatch();
    const { formResources, serviceForm, serviceFormSettings } = useSelector((state) => state.application)
    const [workSites, setWorkSites] = useState([])
    const [waterSources, setWaterSources] = useState([])


    const selectProduct = (productId, productType, packageName) => {

        dispatch(sfSetting.setActiveProduct([productId, productType, packageName]))

        switch (productType) {
            case "WATER_PURIFIER":
                dispatch(sfSetting.page.next(1100))

                break;
            case "VESSEL_FILTER":
                dispatch(sfSetting.page.next(1200))

                break;
            case "ADD_ON":
                dispatch(sfSetting.page.next(1300))

                break;

            default:
                break;
        }

    }

    const clickNewAddOnButton = () => {
        dispatch(modal.push({
            title: 'Add New Add-On',
            body: <AddNewAddOn availableAddOns={formResources?.add_on_products} serviceCharges={formResources?.add_on_installation_charges}
                addOnSpareList={formResources?.spare_list?.filter(e => e.spare_category === 'CHEMICALS')} />
        }))
    }

    const handleDeleteNewAddOn = (uniqueId) => {
        dispatch(sfActions.updateForm({
            new_add_ons: serviceForm?.new_add_ons?.filter(e => e?.unique_id !== uniqueId)
        }))

        dispatch(sfSetting.update({
            form_saved: false,
            form_saved_time: null
        }))
    }

    const handleChangeForm = (e) => {
        const { name, value } = e.target;

        dispatch(sfActions.updateForm({
            [name]: value || null
        }))

        dispatch(sfSetting.update({
            form_saved: false,
            form_saved_time: null
        }))
    }

    const handleChangeWorkStatus = (e) => {
        const { name, value } = e.target;

        dispatch(sfSetting.update({
            form_saved: false,
            form_saved_time: null
        }))

        if (name === 'work_status') {
            dispatch(sfActions.updateForm({
                work_status: {
                    ...(serviceForm?.work_status || {}),
                    closed: value === 'Yes',
                    schedule_date: '',
                    start_time: '',
                    end_time: ''
                }
            }))

            return;
        }

        dispatch(sfActions.updateForm({
            work_status: {
                ...(serviceForm?.work_status || {}),
                [name]: value || ''
            }
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const formProductCount = Object.keys(serviceForm?.service_products || {}).length || 0
        const saveProductCount = Object.values(
            serviceFormSettings?.products ?? {}
        ).filter(product => product?.is_saved === true).length || 0;

        if (formProductCount === saveProductCount && serviceFormSettings?.form_saved) {

            // redirect to next page
            dispatch(sfSetting.page.next(1001))
            return;
        }

        // Save popup
        const modalId = generateUniqueId(6)
        dispatch(modal.push({
            id: modalId,
            title: " ",
            body: <SFormSave modalId={modalId} />,
            freezeClose: true

        }))

    }

    useEffect(() => {
        if (formResources?.input_resources?.length) {
            let colorOptions = (formResources?.input_resources || [])?.filter(r => r.title === 'work_sites')?.[0]?.values || []
            colorOptions = colorOptions.map(v => ({ label: v?.data?.[0], value: v?.data?.[0] }))
            setWorkSites(colorOptions)

            let odorOptions = formResources?.input_resources?.filter(r => r.title === 'water_sources')?.[0]?.values || []
            odorOptions = odorOptions.map(v => ({ label: v?.data?.[0], value: v?.data?.[0] }))
            setWaterSources(odorOptions)
        }

        // Site info
        if (formResources?.site_info) {
            const fields = [
                'work_site',
                'source',
                'tank_capacity_ltr',
                'floor_hight',
                't_hight',
            ];

            const payload = fields.reduce((acc, key) => {
                if (!serviceForm?.[key] && formResources?.site_info?.[key]) {
                    acc[key] = formResources.site_info[key];
                }
                return acc;
            }, {});

            if (Object.keys(payload).length > 0) {
                dispatch(sfActions.updateForm(payload));
            }
        }

        // eslint-disable-next-line
    }, [formResources])



    return (
        <div className="tech-service-form-page sf-page-one">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.find(p => p.key === pageKey)?.title}</h3>
                <p>{serviceFormPageRoute?.find(p => p.key === pageKey)?.description}</p>
            </div>

            {/* Product list */}
            <div className="products-chart">
                {formResources?.product_stretcher?.length > 0 ?
                    <>{formResources?.product_stretcher?.map((section, sectionIdx) => {
                        return <div className="group-product" key={sectionIdx}>
                            <div className="sub-title-section" style={{ marginBottom: "10px" }}>
                                <h3 className='form-sub-title'>{section?.title}</h3>
                                <Badge value={`${section?.productIds?.length || 0} Items`} severity={'primary'} />
                            </div>

                            {section?.productIds?.map((productId) => {

                                const product = formResources?.products?.find(p => p.product_id === productId)
                                const productPackage = product?.package?.package_id ? product?.package : null

                                const productWarranty = Boolean(
                                    !productPackage &&
                                    product?.product?.wr_expire_date &&
                                    (normalizeDate(new Date()) <= normalizeDate(new Date(product?.product?.wr_expire_date))))

                                const upcomingServiceType = getUpcomingServiceType(product?.service?.next_service_date || null, product?.service?.package_expire_date || null)
                                const lowTokens = productPackage?.expire_types?.includes(packageExpireTypes?.REMAINING_TOKENS) && productPackage?.remaining_tokens < 2 ? true : false

                                const isWorked = serviceForm?.service_products?.[productId]?.service_data?.category_id ? true : false
                                const isSubmitted = serviceFormSettings?.products?.[productId]?.is_submitted || false
                                const isSaved = serviceFormSettings?.products?.[productId]?.is_saved || false

                                const alertText = (lowTokens && isWorked) ? 'This product expire today, Please top-up the tokens'
                                    : lowTokens ? 'May be chance to expire the product package on this service' : ''

                                const statusInfo = isSaved
                                    ? { label: 'Service details saved', type: 'saved' }
                                    : isSubmitted
                                        ? { label: 'Service submitted', type: 'submitted' }
                                        : isWorked
                                            ? { label: 'Service in progress', type: 'in-progress' }
                                            : null

                                const isRepeatWork = Array.isArray(formResources?.repeat_works) && formResources.repeat_works.some(rw => {
                                    return rw?.product_id === productId
                                })

                                return <div className="single-product" key={productId}
                                    onClick={() => selectProduct(product?.product_id, product?.product_type, productPackage?.package_name)}>
                                    <div className="product-card-top">
                                        <div className="badge-group">
                                            <span className="product-id-pill">
                                                {product?.product_id}
                                            </span>
                                            {upcomingServiceType && (
                                                <span className="service-type-pill">
                                                    {upcomingServiceType}
                                                </span>
                                            )}
                                            {isRepeatWork && (
                                                <span className="repeat-pill" title="Repeat service work">
                                                    Repeat
                                                </span>
                                            )}
                                        </div>
                                        <TbChevronRight className="arrow-icon" />
                                    </div>

                                    <div className="product-title">
                                        <h4>{product?.product_name}</h4>
                                    </div>

                                    {(productPackage?.package_name || productWarranty) && (
                                        <div className="package-info">
                                            {productPackage?.package_name && (
                                                <div className="package-item" style={{ color: productPackage?.color_code }}>
                                                    <IconCrown className="pkg-icon" size={17} />
                                                    <span className="pkg-name">{productPackage?.package_name} Subscription</span>
                                                </div>
                                            )}

                                            {productPackage?.package_name && productWarranty && (
                                                <span className="meta-dot">•</span>
                                            )}

                                            {productWarranty && (
                                                <div className="warranty-item">
                                                    <TbShieldCheck className="warranty-icon" size={17} />
                                                    <span className="warranty-name">Product warranty</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {alertText ? (
                                        <div className="alert-banner warning">
                                            <TbAlertCircle className="alert-icon" />
                                            <p>{alertText}</p>
                                        </div>
                                    ) : statusInfo ? (
                                        <div className={`status-banner ${statusInfo.type}`}>
                                            <span className="status-dot"></span>
                                            <p>{statusInfo.label}</p>
                                        </div>
                                    ) : null}
                                </div>
                            })}
                        </div>
                    })} </>
                    : <EmptyState
                        size='sm'
                        icon={<TbSitemap />}
                        title={'Customer products not listed'}
                        description={'Service products not available, please contact the administrator'}
                        hight='50vh'
                    />}
            </div >

            {/* Install Add-ons Section */}
            <div className="install-addons-card">
                <div className="card-header">
                    <div className="icon-wrapper">
                        <TbPlus className="plus-icon" />
                    </div>
                    <div className="header-text">
                        <h4>Install Add-ons</h4>
                        <p className="sub-tag">Create Supplemental Equipment</p>
                    </div>
                </div>

                <p className="card-description">
                    To add a new add-on, click the button below. After submitting the form,
                    the product will be added to the customer’s list.
                </p>

                {serviceForm?.new_add_ons?.length > 0 && (
                    <div className="installed-addons-list">
                        {serviceForm?.new_add_ons?.map((item) => (
                            <div className="installed-addon-item" key={item?.unique_id}>
                                <div className="addon-meta">
                                    <div className="addon-tags">
                                        {item?.variant_code && <span className="sku-pill">{item?.variant_code}</span>}
                                        <span className="type-pill">
                                            {toStandardText(item?.parent_type)}
                                        </span>
                                        {item?.is_zero_fee && (
                                            <span className="zero-fee-pill">Zero Fee</span>
                                        )}
                                    </div>
                                    <h4 className="addon-title">{item?.product_name}</h4>
                                    <p className="addon-price">₹{item?.total_amount?.charged || 0}</p>
                                </div>
                                <Button
                                    icon={<TbTrash />}
                                    rounded
                                    size="small"
                                    outlined
                                    severity="danger"
                                    title="Remove Add-on"
                                    onClick={() => handleDeleteNewAddOn(item?.unique_id)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <Button
                    label="Add New Add-on"
                    icon={<TbPlus />}
                    severity="secondary"
                    size="medium"
                    rounded
                    onClick={clickNewAddOnButton}
                />
            </div>

            {/* Common Data */}
            <div className="site-data-form">
                <form action="" onSubmit={handleSubmit}>
                    <h3>Site Information</h3>
                    <div className="form-section">
                        <Select label={'Work Site'} name={'work_site'} value={serviceForm?.work_site} required
                            options={[{}, ...workSites]} onChange={handleChangeForm} />
                        <Select label={'Water Source'} name={'source'} value={serviceForm?.source} required
                            options={[{}, ...waterSources]} onChange={handleChangeForm} />
                        {formResources?.access?.product_access?.includes('VESSEL_FILTER') && <>
                            <InputText label={'Storage Capacity (Ltr)'} name={'tank_capacity_ltr'} value={(serviceForm?.tank_capacity_ltr)} required
                                onChange={handleChangeForm} type='number' step={0.1} min={0} />
                            <InputText label={'Floor Hight (Feet)'} name={'floor_hight'} value={(serviceForm?.floor_hight)} required
                                onChange={handleChangeForm} type='number' step={0.1} min={0} />
                            <InputText label={'T Hight (Feet)'} name={'t_hight'} value={(serviceForm?.t_hight)} required
                                onChange={handleChangeForm} type='number' step={0.1} min={0} />
                        </>}

                    </div>

                    {/* Work Status */}
                    <h3 style={{ marginTop: '20px' }}>Work Status</h3>
                    <div className="form-section">
                        <div className="work-status-cards-grid">
                            <RadioCard
                                label="Work Closed"
                                description="Registration closed"
                                name="work_status"
                                id="work_status_closed"
                                radioValue="Yes"
                                onChange={handleChangeWorkStatus}
                                checked={serviceForm?.work_status?.closed === true}
                                required
                            />
                            <RadioCard
                                label="Not Closed"
                                description="Pending & Reschedule"
                                name="work_status"
                                id="work_status_not_closed"
                                radioValue="No"
                                onChange={handleChangeWorkStatus}
                                checked={serviceForm?.work_status?.closed === false}
                                required
                            />
                        </div>

                        {serviceForm?.work_status?.closed === false && <>
                            <InputText label={'Next Schedule Date'} name={'schedule_date'} value={serviceForm?.work_status?.schedule_date} required
                                onChange={handleChangeWorkStatus} type='date' min={isoToYYYYMMDD(new Date())} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <InputText label={'Start Time'} name={'start_time'} value={serviceForm?.work_status?.start_time} required
                                    onChange={handleChangeWorkStatus} type='time' max={serviceForm?.work_status?.end_time} />
                                <InputText label={'End Time'} name={'end_time'} value={serviceForm?.work_status?.end_time} required
                                    onChange={handleChangeWorkStatus} type='time' min={serviceForm?.work_status?.start_time} />
                            </div>
                        </>}
                    </div>

                    <div className="submit-section">
                        <Button label={'Save & Review'} rounded severity={'primary'} style={{ width: '100%' }} />
                    </div>

                </form>
            </div>

        </div >
    )
}

export default Home