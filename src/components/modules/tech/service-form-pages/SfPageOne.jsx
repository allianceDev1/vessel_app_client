import React from 'react'
import './page-style.scss'
import './sf-page-one.scss'
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service'
import { TbAlertCircle, TbSitemap } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { getUpcomingServiceType } from '../../../../utils/services/product_service'
import { getContrastText } from '../../../../utils/helpers/color-utils'
import EmptyState from '../../../../components/UI_Primitives/ui-states/EmptyState'
import Badge from '../../../../components/UI_Primitives/badge/Badge'
import { sfSetting } from '../../../../redux/features/persisted/applicationSlice'

const SfPageOne = ({ page, custPG, customerProducts, customerPackages }) => {
    const dispatch = useDispatch();
    const { serviceFormSettings } = useSelector((state) => state.application)

    const selectProduct = (productId, orderId = null) => {
        dispatch(sfSetting.setActiveSubPage(200))
        dispatch(sfSetting.setActiveProduct([productId, orderId]))
    }

    return (
        <div className="tech-service-form-page sf-page-one">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
                <p>{serviceFormPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
            </div>

            {/* Page Section */}
            {custPG?.images?.length > 0 ?
                <div className="images-list">
                    {custPG?.images?.map((image, index) => {
                        return <div className="image" key={index}>
                            <img alt='product image' src={image?.thump?.url} />
                        </div>
                    })}
                </div>
                : ''}

            {/* Product list */}
            <div className="products-chart">
                {custPG?.productStretcher?.length > 0 ?
                    <>{custPG?.productStretcher?.map((pg, pgIndx) => {
                        return <div className="group-product" key={pgIndx}>
                            {pg?.map((item, productIndex) => {
                                const product = customerProducts?.filter(p => p.product_id === item?.product_id)?.[0]
                                const productPackage = customerPackages?.filter(p => p.product_id === item?.product_id)?.[0] || {}
                                const upcomingServiceType = getUpcomingServiceType(product?.service?.next_service_date || null, product?.service?.package_expire_date || product?.rental?.rent_end_date || null)
                                return <div className="single-product" key={productIndex} onClick={() => selectProduct(product?.product_id, product?.order_id)}>
                                    <div className={`order-box ${serviceFormSettings.activeProductId === product?.product_id ? 'active' : ''}`}>
                                        <div className="order-index">
                                            <p>{product?.product_type === 'Vessel' ? (product?.order_id || "UN") : 'AD'}</p>
                                        </div>
                                        {pg?.length !== productIndex + 1 && <div className="order-line"></div>}
                                    </div>
                                    <div className="product-content">
                                        <div className="id-status">
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <p>{product?.product_id}</p>
                                                {productPackage?.package_type && <Badge value={'I/W'}
                                                    style={{ backgroundColor: productPackage?.color_code, color: getContrastText(productPackage?.color_code) }} />}
                                            </div>
                                            <p>
                                                {upcomingServiceType}
                                                {(productPackage?.package_type && upcomingServiceType) && ` - S${productPackage?.service_count + 1 || 1}`}
                                            </p>
                                        </div>
                                        <div className="name">
                                            <p>{product?.product_name}</p>
                                        </div>
                                        {/* Alert */}
                                        {productPackage?.expire_types?.includes('work_limit') && productPackage?.remaining_tokens < 2
                                            ? <div className="alert">
                                                <TbAlertCircle />
                                                <p>May be chance to expire the product package on this service.</p>
                                            </div> : ''}

                                    </div>
                                </div>
                            })}
                        </div>
                    })} </>
                    : <EmptyState
                        icon={<TbSitemap />}
                        title={'Customer products not listed'}
                        description={'Vessel filter products not available, please contact the administrator'}
                        hight='50vh'
                    />}
                {/* <div className="group-product">
                    <div className="single-product">
                        <div className="item-border">
                            <div className="order-box active">
                                <div className="order-index">
                                    <p>A1</p>
                                </div>
                                <div className="order-line"></div>
                            </div>
                            <div className="product-content">
                                <div className="id-status">
                                    <p>Product id</p>
                                    <p>Service Type</p>
                                </div>
                                <div className="name">
                                    <p>Name</p>
                                </div>
                                <div className="alert">
                                    <TbAlertCircle />
                                    <p>May be chance to expire the product package on this service May be chance to expire the product package on this service</p>
                                </div>
                            </div>
                        </div>
                        <div className="item-border">
                            <div className="order-box">
                                <div className="order-index">
                                    <p>A1</p>
                                </div>
                                <div className="order-line"></div>
                            </div>
                            <div className="product-content">
                                <div className="id-status">
                                    <p>Product id</p>
                                    <p>Service Type</p>
                                </div>
                                <div className="name">
                                    <p>Name</p>
                                </div>
                                <div className="alert">
                                    <TbAlertCircle />
                                    <p>Alert Text</p>
                                </div>
                            </div>
                        </div>
                        <div className="item-border">
                            <div className="order-box">
                                <div className="order-index">
                                    <p>A1</p>
                                </div>
                                <div className="order-line"></div>
                            </div>
                            <div className="product-content">
                                <div className="id-status">
                                    <p>Product id</p>
                                    <p>Service Type</p>
                                </div>
                                <div className="name">
                                    <p>Name</p>
                                </div>
                                <div className="alert">
                                    <TbAlertCircle />
                                    <p>Alert Text</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="group-product">
                    <div className="single-product">
                        <div className="item-border" >
                            <div className="order-box active">
                                <div className="order-index">
                                    <p>A1</p>
                                </div>
                                <div className="order-line"></div>
                            </div>
                            <div className="product-content">
                                <div className="id-status">
                                    <p>Product id</p>
                                    <p>Service Type</p>
                                </div>
                                <div className="name">
                                    <p>Name</p>
                                </div>
                                <div className="alert">
                                    <TbAlertCircle />
                                    <p>May be chance to expire the product package on this service May be chance to expire the product package on this service</p>
                                </div>
                            </div>
                        </div>
                        <div className="item-border">
                            <div className="order-box">
                                <div className="order-index">
                                    <p>A1</p>
                                </div>
                                <div className="order-line"></div>
                            </div>
                            <div className="product-content">
                                <div className="id-status">
                                    <p>Product id</p>
                                    <p>Service Type</p>
                                </div>
                                <div className="name">
                                    <p>Name</p>
                                </div>
                                <div className="alert">
                                    <TbAlertCircle />
                                    <p>Alert Text</p>
                                </div>
                            </div>
                        </div>
                        <div className="item-border">
                            <div className="order-box">
                                <div className="order-index">
                                    <p>A1</p>
                                </div>
                                <div className="order-line"></div>
                            </div>
                            <div className="product-content">
                                <div className="id-status">
                                    <p>Product id</p>
                                    <p>Service Type</p>
                                </div>
                                <div className="name">
                                    <p>Name</p>
                                </div>
                                <div className="alert">
                                    <TbAlertCircle />
                                    <p>Alert Text</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div >


        </div >
    )
}

export default SfPageOne