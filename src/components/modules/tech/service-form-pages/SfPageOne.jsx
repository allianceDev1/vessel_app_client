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
import { packageExpireTypes } from '../../../../assets/javascript/pre_data/package'

const SfPageOne = ({ page, customer, customerProducts }) => {
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
            {customer?.images?.length > 0 ?
                <div className="images-list">
                    {customer?.images?.map((image, index) => {
                        return <div className="image" key={index}>
                            <img alt='product ' src={image?.thump?.url} />
                        </div>
                    })}
                </div>
                : ''}

            {/* Product list */}
            <div className="products-chart">
                {customer?.productStretcher?.length > 0 ?
                    <>{customer?.productStretcher?.map((pg, pgIndx) => {
                        return <div className="group-product" key={pgIndx}>
                            {pg?.map((item, productIndex) => {

                                const product = customerProducts?.filter(p => p.product_id === item?.product_id)?.[0]
                                const productPackage = product?.package?.package_status === 'ACTIVE' ? product?.package : null
                                const packageFreeze = product?.package?.package_status === 'FROZEN' ? true : false
                                const packageExpire = product?.package?.package_status === 'EXPIRED' ? true : false
                                const upcomingServiceType = getUpcomingServiceType(product?.service?.next_service_date || null, product?.service?.package_expire_date || null)
                                const alertText = packageFreeze ? "The current product package is frozen"
                                    : packageExpire ? "The current product package is expired"
                                        : productPackage?.expire_types?.includes(packageExpireTypes?.REMAINING_TOKENS) && productPackage?.remaining_tokens < 2 ? 'May be chance to expire the product package on this service'
                                            : ''
                                const isSubmitted = serviceFormSettings?.products?.[product?.product_id]?.is_submitted || false


                                return <div className="single-product" key={productIndex} onClick={() => selectProduct(product?.product_id, product?.order_id)}>
                                    <div className={`order-box`}>
                                        <div className={`order-index ${isSubmitted ? 'submitted' : ''}`}>
                                            <p>{product?.product_type === 'Vessel' ? (product?.order_id || "UN") : 'AD'}</p>
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
                        icon={<TbSitemap />}
                        title={'Customer products not listed'}
                        description={'Vessel filter products not available, please contact the administrator'}
                        hight='50vh'
                    />}
            </div >


        </div >
    )
}

export default SfPageOne