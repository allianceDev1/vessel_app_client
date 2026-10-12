import React, { useMemo, useState } from 'react'
import './sub-page-style.scss'
import { useSelector } from 'react-redux'
import { SERVICE_SECTIONS, SPARE_SECTIONS } from '../../../../assets/javascript/pre_data/service.js'
import ServiceCategories from '../service-form-components/work-section/ServiceCategories.jsx'
import WorkHome from '../service-form-components/work-section/WorkHome.jsx'
import ComponentsList from '../service-form-components/work-section/ComponentsList.jsx'
import ServiceList from '../service-form-components/work-section/ServiceList.jsx'


const WorkSection = () => {
    const { serviceFormSettings, serviceForm, formResources } = useSelector((state) => state.application)
    const [workMenu, setWorkMenu] = useState('')


    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);

    const product = useMemo(() => {
        if (!serviceFormSettings?.activeProduct?.[0]) return null;

        return formResources?.products?.find(
            p => p.product_id === serviceFormSettings?.activeProduct?.[0]
        ) || null;

        // eslint-disable-next-line
    }, [formResources?.products, serviceFormSettings?.activeProduct?.[0]]);

    const serviceCategory = useMemo(() => {
        const category = formResources?.service_categories?.find(
            (c) =>
                c?.category_id === productInForm?.service_data?.category_id &&
                (!productInForm?.service_data?.package_id || c?.package_id === productInForm?.service_data?.package_id)
        )

        return category
    }, [formResources?.service_categories, productInForm?.service_data])


    return (
        <div className="tech-service-form-subpage">

            {/* Title */}
            <div className="title-section">
                <h3>Action Taken</h3>
                <p>Record the solution or repair performed during the service</p>
            </div>

            {/* Service Categories */}
            {(!productInForm?.service_data?.category_id || !productInForm?.service_data?.mode) &&
                <ServiceCategories />}

            {(productInForm?.service_data?.category_id && productInForm?.service_data?.mode) &&
                <>{workMenu
                    ? <>
                        {SPARE_SECTIONS.includes(workMenu) &&
                            <ComponentsList setWorkMenu={setWorkMenu} product={product} serviceCategory={serviceCategory}
                                productInForm={productInForm} workMenu={workMenu} />}
                        {SERVICE_SECTIONS.includes(workMenu) &&
                            <ServiceList setWorkMenu={setWorkMenu} productInForm={productInForm} workMenu={workMenu}
                                product={product} serviceCategory={serviceCategory} />}
                    </>
                    : <WorkHome setWorkMenu={setWorkMenu} />}
                </>}

        </div>
    )
}

export default WorkSection