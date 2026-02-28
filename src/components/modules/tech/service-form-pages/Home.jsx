import React, { useEffect, useState } from 'react'
import './home.scss'
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service'
import { TbAlertCircle, TbPlus, TbSitemap, TbTrash } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { getUpcomingServiceType } from '../../../../utils/services/product_service'
import { getContrastText } from '../../../../utils/helpers/color-utils'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import { PACKAGE_STATUSES, packageExpireTypes } from '../../../../assets/javascript/pre_data/package'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers'
import { generateUniqueId } from '../../../../utils/helpers/generate_Id'
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState'
import Badge from '../../../UI_Primitives/badge/Badge'
import Button from '../../../UI_Primitives/buttons/Button'
import AddNewAddOn from '../service-form-components/AddNewAddOn'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import SFormSave from '../service-form-components/SFormSave'
import Radio from '../../../UI_Primitives/inputs/Radio'



const Home = ({ page, customer, customerProducts, availableAddOns, addOnSpareList, resources, repeatWork, serviceCharges }) => {
    const dispatch = useDispatch();
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)
    const [workSites, setWorkSites] = useState([])
    const [waterSources, setWaterSources] = useState([])


    const selectProduct = (productId, orderId = null, productType, packageName) => {
        dispatch(sfSetting.setActiveSubPage(200))
        dispatch(sfSetting.setActiveProduct([productId, orderId, productType, packageName]))
    }

    const clickNewAddOnButton = () => {
        dispatch(modal.push({
            title: 'Select New Add-On',
            body: <AddNewAddOn availableAddOns={availableAddOns} serviceCharges={serviceCharges}
                addOnSpareList={addOnSpareList?.filter(e => e.spare_category === 'CHEMICALS')} />
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

    const handleChangeRepeat = (e) => {
        const { name, value } = e.target;

        if (name === 'repeat_status') {
            dispatch(sfActions.updateForm({
                repeat: {
                    ...(serviceForm?.repeat || {}),
                    tech_say: value === 'Yes',
                    comment: ''
                }
            }))

            return;
        }

        if (name === 'repeat_comment') {
            dispatch(sfActions.updateForm({
                repeat: {
                    ...(serviceForm?.repeat || {}),
                    comment: e.target.value || ""
                }
            }))
        }

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
            dispatch(sfSetting.setActivePage(101))
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
        if (!customer) return;

        const fields = [
            'work_site',
            'source',
            'tank_capacity_ltr',
            'floor_hight',
            't_hight',
        ];

        const payload = fields.reduce((acc, key) => {
            if (!serviceForm?.[key] && customer?.[key]) {
                acc[key] = customer[key];
            }
            return acc;
        }, {});

        if (Object.keys(payload).length > 0) {
            dispatch(sfActions.updateForm(payload));
        }

    }, [customer])

    useEffect(() => {
        if (!repeatWork) return;

        if (!serviceForm?.repeat) {
            dispatch(sfActions.updateForm({
                repeat: {
                    system_say: repeatWork?.is_repeat,
                    tech_say: repeatWork?.is_repeat,
                    comment: null
                }
            }));
        }

    }, [repeatWork])

    useEffect(() => {
        let colorOptions = resources?.filter(r => r.title === 'work_sites')?.[0]?.values || []
        colorOptions = colorOptions.sort((a, b) => a.order - b.order)
        colorOptions = colorOptions.map(v => ({ label: v?.data?.[0], value: v?.data?.[0] }))
        setWorkSites(colorOptions)

        let odorOptions = resources?.filter(r => r.title === 'water_sources')?.[0]?.values || []
        odorOptions = odorOptions.sort((a, b) => a.order - b.order)
        odorOptions = odorOptions.map(v => ({ label: v?.data?.[0], value: v?.data?.[0] }))
        setWaterSources(odorOptions)

    }, [resources])

    return (
        <div className="tech-service-form-page sf-page-one">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
                <p>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
            </div>

            {/* Page Section */}
            {/* {customer?.images?.length > 0 ?
                <div className="images-list">
                    {customer?.images?.map((image, index) => {
                        return <div className="image" key={index}>
                            <img alt='product ' src={image?.thump?.url} />
                        </div>
                    })}
                </div>
                : ''} */}

            {/* Product list */}
            <div className="products-chart">
                {customer?.productStretcher?.length > 0 ?
                    <>{customer?.productStretcher?.map((pg, pgIndx) => {
                        return <div className="group-product" key={pgIndx}>
                            {pg?.map((item, productIndex) => {

                                const product = customerProducts?.filter(p => p.product_id === item?.product_id)?.[0]
                                const productPackage = product?.package?.package_status === PACKAGE_STATUSES.ACTIVE ? product?.package : null
                                const packageFreeze = product?.package?.package_status === PACKAGE_STATUSES.FROZEN ? true : false
                                const packageExpire = product?.package?.package_status === PACKAGE_STATUSES.EXPIRED ? true : false
                                const upcomingServiceType = getUpcomingServiceType(product?.service?.next_service_date || null, product?.service?.package_expire_date || null)
                                const lowTokens = productPackage?.expire_types?.includes(packageExpireTypes?.REMAINING_TOKENS) && productPackage?.remaining_tokens < 2 ? true : false
                                const isWorked = serviceForm?.service_products?.[item?.product_id]?.service_data?.category_id ? true : false
                                const alertText = packageFreeze ? "The current product package is frozen"
                                    : packageExpire ? "The current product package is expired"
                                        : lowTokens ? 'May be chance to expire the product package on this service'
                                            : (lowTokens && isWorked) ? 'This product expire today, Please top-up the tokens' : ''
                                const isSubmitted = serviceFormSettings?.products?.[product?.product_id]?.is_submitted || false
                                const isSaved = serviceFormSettings?.products?.[product?.product_id]?.is_saved || false

                                return <div className="single-product" key={productIndex} onClick={() => selectProduct(product?.product_id, product?.order_id, product?.product_type, productPackage?.package_name)}>
                                    <div className={`order-box`}>
                                        <div className={`order-index ${isSaved ? 'saved' : isSubmitted ? 'submitted' : ''}`}>
                                            <p>{product?.product_type === 'VESSEL_FILTER' ? (product?.order_id || "UN") : 'AD'}</p>
                                        </div>
                                        {pg?.length !== productIndex + 1 && <div className="order-line"></div>}
                                    </div>
                                    <div className="product-content">
                                        <div className="id-status">
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <p>{product?.product_id}</p>
                                                {productPackage?.package_id && <Badge value={productPackage?.package_name}
                                                    style={{ backgroundColor: product?.package?.color_code, color: getContrastText(product?.package?.color_code) }} />}
                                            </div>
                                            <p>
                                                {upcomingServiceType}
                                                {(productPackage?.package_id && upcomingServiceType) && ` - S${productPackage?.service_count + 1 || 1}`}
                                            </p>
                                        </div>
                                        <div className="name">
                                            <p>{product?.product_name}</p>
                                        </div>

                                        {/* Alert */}
                                        {alertText && <div className="alert"><TbAlertCircle /> <p>{alertText}</p>  </div>}
                                    </div>
                                </div>
                            })}
                        </div>
                    })} </>
                    : <EmptyState
                        size='sm'
                        icon={<TbSitemap />}
                        title={'Customer products not listed'}
                        description={'Vessel filter products not available, please contact the administrator'}
                        hight='50vh'
                    />}
            </div >

            {/* New Add-On */}
            {!serviceForm?.new_add_ons?.length && <div className="new-product-initial-box">
                <h4>Install Add-ons</h4>
                <p>To add a new add-on, click the button below. After submitting the form, the product will be added to
                    the customer’s list. You can add the product as either a rental or a new item.</p>
                <Button label={'Select Add-on'} severity={'info'} outlined style={{ width: '150px' }} rounded size='small'
                    icon={<TbPlus />} onClick={clickNewAddOnButton} />
            </div>}

            {serviceForm?.new_add_ons?.length ? <div className="new-product-list">
                <h3>Install Add-ons</h3>

                <div className="addon-list">
                    {serviceForm?.new_add_ons?.map((item) =>
                        <div className="addon-item-border" key={item?.unique_id}>
                            <div className="product-name">
                                <h4>{item?.product_name}</h4>
                                <p>₹{item?.total_amount?.charged || 0}</p>
                            </div>
                            <div className="action-section">
                                <Button icon={<TbTrash />} rounded size='small' outlined severity={'danger'}
                                    onClick={() => handleDeleteNewAddOn(item?.unique_id)} />
                            </div>
                        </div>
                    )}
                </div>

                <Button label={'Select Add-on'} severity={'info'} outlined style={{ width: '150px' }} rounded size='small'
                    icon={<TbPlus />} onClick={clickNewAddOnButton} />
            </div> : ''}

            {/* Common Data */}
            <div className="site-data-form">
                <form action="" onSubmit={handleSubmit}>
                    <h3>Site Information</h3>
                    <div className="form-section">
                        <Select label={'Work Site'} name={'work_site'} value={serviceForm?.work_site} required
                            options={[{}, ...workSites]} onChange={handleChangeForm} />
                        <Select label={'Water Source'} name={'source'} value={serviceForm?.source} required
                            options={[{}, ...waterSources]} onChange={handleChangeForm} />
                        <InputText label={'Storage Capacity (Ltr)'} name={'tank_capacity_ltr'} value={(serviceForm?.tank_capacity_ltr)} required
                            onChange={handleChangeForm} type='number' step={0.1} min={0} />
                        <InputText label={'Floor Hight (Feet)'} name={'floor_hight'} value={(serviceForm?.floor_hight)} required
                            onChange={handleChangeForm} type='number' step={0.1} min={0} />
                        <InputText label={'T Hight (Feet)'} name={'t_hight'} value={(serviceForm?.t_hight)} required
                            onChange={handleChangeForm} type='number' step={0.1} min={0} />
                    </div>

                    {/* Repeat */}
                    {serviceForm?.repeat?.system_say && <>
                        <h3 style={{ marginTop: '20px' }}>Repeat Work</h3>
                        <div className="form-section">
                            <Radio label={"It is repeat work"} name={'repeat_status'} radioValue={'Yes'} onChange={handleChangeRepeat}
                                checked={serviceForm?.repeat?.tech_say} required />
                            <Radio label={"Not repeat work"} name={'repeat_status'} radioValue={'No'} onChange={handleChangeRepeat}
                                checked={!serviceForm?.repeat?.tech_say} required />

                            {!serviceForm?.repeat?.tech_say && <InputText label={'Comments'} id={'comment'} name={'repeat_comment'} value={serviceForm?.repeat?.comment}
                                onChange={handleChangeRepeat} required />}
                        </div>
                    </>}

                    {/* Work Status */}
                    <h3 style={{ marginTop: '20px' }}>Work Status</h3>
                    <div className="form-section">
                        <Radio label={'Work Closed'} name={'work_status'} radioValue={'Yes'} onChange={handleChangeWorkStatus}
                            checked={serviceForm?.work_status?.closed === true} required />
                        <Radio label={'Not Closed'} name={'work_status'} radioValue={'No'} onChange={handleChangeWorkStatus}
                            checked={serviceForm?.work_status?.closed === false} required />

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