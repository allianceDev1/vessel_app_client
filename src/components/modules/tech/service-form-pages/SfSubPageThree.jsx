import React, { useEffect, useMemo, useState } from 'react'
import './sub-page-style.scss'
import { useSelector } from 'react-redux'
import { SERVICE_SECTIONS, serviceFormSubPageRoute, SPARE_SECTIONS } from '../../../../assets/javascript/pre_data/service'
import VfServiceCategories from '../service-form-components/VfServiceCategories'
import VfServiceWorkHome from '../service-form-components/VfServiceWorkHome'
import VfComponentsList from '../service-form-components/VfComponentsList'
import { findSpareTypeAmount } from '../../../../utils/flows/service_form_utils'
import { normalizeDate } from '../../../../utils/helpers/date-helpers'
import VfServiceList from '../service-form-components/VfServiceList'


const SfSubPageThree = ({
  page, categories, customerProducts, regData, vesselsEligibilities,
  materialsList, bagList, spareList, vesselServiceList, changeSubmitStatus
}) => {

  const { serviceFormSettings, serviceForm } = useSelector((state) => state.application)
  const orderId = serviceFormSettings?.activeProduct?.[1] || null
  const [workMenu, setWorkMenu] = useState({ type: null, id: null })
  const [itemsList, setItemList] = useState([])
  const [subPage, setSubPage] = useState({ title: null, id: null, max: 0, deleteItem: false })


  const productInForm = useMemo(() => {
    const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
    return current || {}

    // eslint-disable-next-line
  }, [serviceForm?.service_products]);

  const product = useMemo(() => {
    if (!customerProducts || !serviceFormSettings?.activeProduct?.[0]) return null;

    return customerProducts.find(
      p => p.product_id === serviceFormSettings?.activeProduct?.[0]
    ) || null;

    // eslint-disable-next-line
  }, [customerProducts, serviceFormSettings?.activeProduct?.[0]]);

  const productEligibility = useMemo(() => {
    if (!vesselsEligibilities || !serviceFormSettings?.activeProduct?.[0]) return null;

    return vesselsEligibilities.find(
      e => e.product_id === serviceFormSettings?.activeProduct?.[0]
    ) || null;

    // eslint-disable-next-line
  }, [vesselsEligibilities, serviceFormSettings?.activeProduct?.[0]]);

  const category = useMemo(() => {
    const workServiceId = productInForm?.service_data?.service_id || null
    const workCategoryId = productInForm?.service_data?.category_id

    if (!workServiceId && !workCategoryId) return null;

    const currentCategory = categories?.filter(c => (c?.service_id || null) === workServiceId && c?.category_id === workCategoryId)?.[0]

    return currentCategory

    // eslint-disable-next-line
  }, [categories, productInForm])


  useEffect(() => {
    if (!workMenu?.type) return;

    // components
    if (["RENEWAL_SPARE", "PACKAGE_SPARE"].includes(workMenu?.type)) {

      switch (workMenu?.id) {
        case 'MATERIALS_SECTION':
          if (!category?.coverage?.find(c => c.coverage_id === 'MATERIAL')?.access) {
            setItemList([])
            return;
          };

          setItemList(materialsList?.map(i => {
            const inForm = productInForm?.work?.components_list?.filter(s => s?.spare_id === i?.spare_id && s?.spare_type === workMenu?.type)?.[0]
            if (inForm) return inForm

            let obj = {
              spare_id: i?.spare_id,
              spare_uuid: i?.spare_uuid,
              spare_name: i?.spare_name,
              spare_category: i?.spare_category,
              spare_section: 'MATERIALS_SECTION',
              spare_type: workMenu?.type,
              pricing: findSpareTypeAmount(i, category?.coverage?.find(c => c.coverage_id === 'MATERIAL')?.price_type, category?.package_id || null)
                || { list_price: 0, charged: 0, ledger_cost: 0 },
              qty: 0,
              unit: i?.unit,
              under_warranty: false,
              warranty_period_months: 0,
              is_customer_product: false,
              is_removed: false
            }

            return obj
          }))
          setSubPage({ title: 'Materials', id: 'MATERIALS_SECTION', max: 0, deleteItem: false })
          break;

        case 'BAG_SECTION':
          if (!category?.coverage?.find(c => c.coverage_id === 'MATERIALS_BAG')?.access) {
            setItemList([])
            return;
          };

          const customerBag = product?.product?.spares?.find(s => s.spare_category === 'MATERIALS_BAG') || {}
          const warrantyBag = customerBag?.wr_expire_date &&
            normalizeDate(new Date(customerBag?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false

          setItemList(bagList?.map(i => {
            const inForm = productInForm?.work?.components_list?.filter(s => s?.spare_id === i?.spare_id && s?.spare_type === workMenu?.type)?.[0]
            if (inForm) return inForm

            const { reason, ...amountObj } = findSpareTypeAmount(i, category?.coverage?.find(c => c.coverage_id === 'MATERIALS_BAG')?.price_type, category?.package_id || null, warrantyBag)
              || { list_price: 0, charged: 0, ledger_cost: 0 }

            let obj = {
              spare_id: i?.spare_id,
              spare_uuid: i?.spare_uuid,
              spare_name: i?.spare_name,
              spare_category: i?.spare_category,
              spare_section: 'BAG_SECTION',
              spare_type: workMenu?.type,
              pricing: amountObj,
              qty: 0,
              unit: i?.unit,
              under_warranty: warrantyBag,
              non_receivable_reason: (!amountObj?.charged && warrantyBag) ? 'Bag warranty override' : reason,
              warranty_period_months: amountObj?.charged > 0 ? (i?.warranty_period || 0) : 0,
              is_customer_product: i?.spare_uuid === customerBag?.spare_uuid,
              is_removed: false
            }

            return obj
          }))
          setSubPage({ title: 'Bags', id: 'BAG_SECTION', max: 1, deleteItem: false })

          break;

        case 'SPARE_SECTION':
          if (!category?.coverage?.find(c => c.coverage_id === 'PRIMARY_SPARES')?.access) {
            setItemList([])
            return;
          };

          setItemList(spareList?.map(i => {
            const inForm = productInForm?.work?.components_list?.filter(s => s?.spare_id === i?.spare_id && s?.spare_type === workMenu?.type)?.[0]
            if (inForm) return inForm

            const spareInCustomer = product?.product?.spares?.filter(s => s?.spare_uuid === i?.spare_uuid)?.[0]
            const spareInRemoveList = productInForm?.work?.removed_components_list?.filter(s => s?.spare_uuid === i?.spare_uuid && s?.spare_type === workMenu?.type)?.[0] ? true : false

            const warrantySpare = spareInCustomer?.wr_expire_date &&
              normalizeDate(new Date(spareInCustomer?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false

            const { reason, ...amountObj } = findSpareTypeAmount(i, category?.coverage?.find(c => c.coverage_id === 'PRIMARY_SPARES')?.price_type, category?.package_id || null, warrantySpare)
              || { list_price: 0, charged: 0, ledger_cost: 0 }

            let obj = {
              spare_id: i?.spare_id,
              spare_uuid: i?.spare_uuid,
              spare_name: i?.spare_name,
              spare_category: i?.spare_category,
              spare_section: 'SPARE_SECTION',
              spare_type: workMenu?.type,
              pricing: amountObj,
              qty: 0,
              unit: i?.unit,
              under_warranty: warrantySpare,
              non_receivable_reason: (!amountObj?.charged && warrantySpare) ? 'Spare warranty override' : reason,
              warranty_period_months: amountObj?.charged > 0 ? (i?.warranty_period || 0) : 0,
              is_customer_product: i?.spare_uuid === spareInCustomer?.spare_uuid,
              is_removed: spareInRemoveList
            }

            return obj
          }))
          setSubPage({ title: 'Spares', id: 'SPARE_SECTION', max: 0, deleteItem: true })
          break;

        default:
          break;
      }
    }

    if (workMenu?.type === 'ADDITIONAL_SPARE') {
      switch (workMenu?.id) {
        case 'MATERIALS_SECTION':

          setItemList(materialsList?.map(i => {
            const inForm = productInForm?.work?.components_list?.filter(s => s?.spare_id === i?.spare_id && s?.spare_type === workMenu?.type)?.[0]
            if (inForm) return inForm

            let obj = {
              spare_id: i?.spare_id,
              spare_uuid: i?.spare_uuid,
              spare_name: i?.spare_name,
              spare_category: i?.spare_category,
              spare_section: 'MATERIALS_SECTION',
              spare_type: workMenu?.type,
              pricing: findSpareTypeAmount(i, "SELLING_RATE", null)
                || { list_price: 0, charged: 0, ledger_cost: 0 },
              qty: 0,
              unit: i?.unit,
              under_warranty: false,
              warranty_period_months: 0,
              is_customer_product: false,
              is_removed: false
            }

            return obj
          }))
          setSubPage({ title: 'Materials', id: 'MATERIALS_SECTION', max: 0, deleteItem: false })
          break;

        case 'BAG_SECTION':
          const customerBag = product?.product?.spares?.find(s => s.spare_category === 'MATERIALS_BAG') || {}

          const warrantyBag = customerBag?.wr_expire_date &&
            normalizeDate(new Date(customerBag?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false

          setItemList(bagList?.map(i => {
            const inForm = productInForm?.work?.components_list?.filter(s => s?.spare_id === i?.spare_id && s?.spare_type === workMenu?.type)?.[0]
            if (inForm) return inForm

            const { reason, ...amountObj } = findSpareTypeAmount(i, "SELLING_RATE", null, warrantyBag)
              || { list_price: 0, charged: 0, ledger_cost: 0 }

            let obj = {
              spare_id: i?.spare_id,
              spare_uuid: i?.spare_uuid,
              spare_name: i?.spare_name,
              spare_category: i?.spare_category,
              spare_section: 'BAG_SECTION',
              spare_type: workMenu?.type,
              pricing: amountObj,
              qty: 0,
              unit: i?.unit,
              under_warranty: warrantyBag,
              non_receivable_reason: (!amountObj?.charged && warrantyBag) ? 'Bag warranty override' : reason,
              warranty_period_months: amountObj?.charged > 0 ? (i?.warranty_period || 0) : 0,
              is_customer_product: i?.spare_uuid === customerBag?.spare_uuid,
              is_removed: false
            }

            return obj
          }))
          setSubPage({ title: 'Bags', id: 'BAG_SECTION', max: 1, deleteItem: false })

          break;

        case 'SPARE_SECTION':
          setItemList(spareList?.map(i => {
            const inForm = productInForm?.work?.components_list?.filter(s => s?.spare_id === i?.spare_id && s?.spare_type === workMenu?.type)?.[0]
            if (inForm) return inForm

            const spareInCustomer = product?.product?.spares?.filter(s => s?.spare_uuid === i?.spare_uuid)?.[0]
            const spareInRemoveList = productInForm?.work?.removed_components_list?.filter(s => s?.spare_uuid === i?.spare_uuid && s?.spare_type === workMenu?.type)?.[0] ? true : false

            const warrantySpare = spareInCustomer?.wr_expire_date &&
              normalizeDate(new Date(spareInCustomer?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false

            const { reason, ...amountObj } = findSpareTypeAmount(i, "SELLING_RATE", null, warrantySpare)
              || { list_price: 0, charged: 0, ledger_cost: 0 }

            let obj = {
              spare_id: i?.spare_id,
              spare_uuid: i?.spare_uuid,
              spare_name: i?.spare_name,
              spare_category: i?.spare_category,
              spare_section: 'SPARE_SECTION',
              spare_type: workMenu?.type,
              pricing: amountObj,
              qty: 0,
              unit: i?.unit,
              under_warranty: warrantySpare,
              non_receivable_reason: (!amountObj?.charged && warrantySpare) ? 'Spare warranty override' : reason,
              warranty_period_months: amountObj?.charged > 0 ? (i?.warranty_period || 0) : 0,
              is_customer_product: i?.spare_uuid === spareInCustomer?.spare_uuid,
              is_removed: spareInRemoveList
            }

            return obj
          }))
          setSubPage({ title: 'Spares', id: 'SPARE_SECTION', max: 0, deleteItem: true })
          break;

        default:
          break;
      }
    }

    // Service work
    if (["RENEWAL_SERVICE", "PACKAGE_SERVICE"].includes(workMenu?.type)) {

      if (!category?.coverage?.find(c => c.coverage_id === 'SERVICE_WORK')?.access) {
        setItemList([])
        return;
      };

      setItemList(vesselServiceList?.map(i => {
        const inForm = productInForm?.work?.services_list?.filter(s => s?.service_id === i?.work_id && s?.service_type === workMenu?.type)?.[0]

        const customerBag = product?.product?.spares?.find(s => s.spare_category === 'MATERIALS_BAG') || {}
        const warrantyBag = customerBag?.wr_expire_date &&
          normalizeDate(new Date(customerBag?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false

        const warrantyEnabled = !i?.reinstallation_included && warrantyBag

        const { reason, ...amountObj } = findSpareTypeAmount(i, category?.coverage?.find(c => c.coverage_id === 'SERVICE_WORK')?.price_type, category?.package_id || null, warrantyEnabled)
          || { list_price: 0, charged: 0, ledger_cost: 0 }

        let obj = {
          service_id: i?.work_id,
          service_uuid: i?.work_uuid,
          service_name: i?.work_name,
          service_type: workMenu?.type,
          pricing: amountObj,
          call_rate: i?.call_rate,
          refill_included: i?.refill_included,
          reinstallation_included: i?.reinstallation_included,
          selected: inForm ? true : false,
          under_warranty: warrantyEnabled,
          non_receivable_reason: (!amountObj?.charged && warrantyEnabled) ? 'Bag warranty override' : reason
        }

        return obj
      }))

      setSubPage({ title: 'Service Works', id: 'SERVICE', max: 0, deleteItem: false })
    }

    if (workMenu?.type === 'ADDITIONAL_SERVICE') {
      setItemList(vesselServiceList?.map(i => {
        const inForm = productInForm?.work?.services_list?.filter(s => s?.service_id === i?.work_id && s?.service_type === workMenu?.type)?.[0]

        const customerBag = product?.product?.spares?.find(s => s.spare_category === 'MATERIALS_BAG') || {}
        const warrantyBag = customerBag?.wr_expire_date &&
          normalizeDate(new Date(customerBag?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false

        const warrantyEnabled = !i?.reinstallation_included && warrantyBag

        const { reason, ...amountObj } = findSpareTypeAmount(i, 'SELLING_RATE', null, warrantyEnabled)
          || { list_price: 0, charged: 0, ledger_cost: 0 }

        let obj = {
          service_id: i?.work_id,
          service_uuid: i?.work_uuid,
          service_name: i?.work_name,
          service_type: workMenu?.type,
          pricing: amountObj,
          call_rate: i?.call_rate,
          refill_included: i?.refill_included,
          reinstallation_included: i?.reinstallation_included,
          selected: inForm ? true : false,
          under_warranty: warrantyEnabled,
          non_receivable_reason: (!amountObj?.charged && warrantyEnabled) ? 'Bag warranty override' : reason
        }

        return obj
      }))

      setSubPage({ title: 'Service Works', id: 'SERVICE', max: 0, deleteItem: false })
    }

    // eslint-disable-next-line
  }, [workMenu, productInForm])


  return (
    <div className="tech-service-form-subpage sf-subpage-three">
      {/* Title */}
      <div className="title-section">
        <h3>{orderId ? `${orderId} : ` : ''}{serviceFormSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
        <p>{serviceFormSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
      </div>

      {/* Service Categories */}
      {(!productInForm?.service_data?.category_id || !productInForm?.service_data?.mode) &&
        <VfServiceCategories categories={categories} product={product} productEligibility={productEligibility}
          regData={regData} changeSubmitStatus={changeSubmitStatus} />
      }

      {(productInForm?.service_data?.category_id && productInForm?.service_data?.mode) &&
        <>{workMenu?.type
          ? <>
            {SPARE_SECTIONS.includes(workMenu?.type) &&
              <VfComponentsList setWorkMenu={setWorkMenu} itemsList={itemsList} subPage={subPage} category={category}
                productInForm={productInForm} changeSubmitStatus={changeSubmitStatus} workMenu={workMenu} />}
            {SERVICE_SECTIONS.includes(workMenu?.type) &&
              <VfServiceList setWorkMenu={setWorkMenu} itemsList={itemsList} subPage={subPage}
                productInForm={productInForm} changeSubmitStatus={changeSubmitStatus} workMenu={workMenu} />}
          </>
          : <VfServiceWorkHome category={category} setWorkMenu={setWorkMenu} changeSubmitStatus={changeSubmitStatus} />}
        </>
      }

    </div>
  )
}

export default SfSubPageThree