import React, { useEffect, useMemo, useState } from 'react'
import './sub-page-style.scss'
import { useDispatch, useSelector } from 'react-redux'
import { serviceFormSubPageRoute } from '../../../../assets/javascript/pre_data/service'
import Select from '../../../UI_Primitives/inputs/Select'
import Radio from '../../../UI_Primitives/inputs/Radio'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import Button from '../../../UI_Primitives/buttons/Button'
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect'
import { toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { TbTrash } from 'react-icons/tb'
import VfServiceCategories from '../service-form-components/VfServiceCategories'
import VfServiceWorkHome from '../service-form-components/VfServiceWorkHome'
import VfComponentsList from '../service-form-components/VfComponentsList'
import { findSpareTypeAmount } from '../../../../utils/flows/service_form_utils'
import { normalizeDate } from '../../../../utils/helpers/date-helpers'
import { min } from 'moment'
import VfServiceList from '../service-form-components/VfServiceList'


const SfSubPageThree = ({
  page, categories, customerProducts, regData, vesselsEligibilities, materialsList, bagList, spareList, vesselServiceList
}) => {
  const dispatch = useDispatch();
  const { serviceFormSettings, serviceForm } = useSelector((state) => state.application)
  const orderId = serviceFormSettings?.activeProduct?.[1] || null
  const [workMenu, setWorkMenu] = useState({ type: null, id: null })
  const [componentsList, setComponentsList] = useState([])
  const [servicesList, setServicesList] = useState([])
  const [componentsPage, setComponentsPage] = useState({ title: null, id: null, max: 0, deleteItem: false })



  const productInForm = useMemo(() => {
    const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
    return current || {}
  }, [serviceForm?.service_products]);

  const product = useMemo(() => {
    if (!customerProducts || !serviceFormSettings?.activeProduct?.[0]) return null;

    return customerProducts.find(
      p => p.product_id === serviceFormSettings?.activeProduct?.[0]
    ) || null;
  }, [customerProducts, serviceFormSettings?.activeProduct?.[0]]);

  const productEligibility = useMemo(() => {
    if (!vesselsEligibilities || !serviceFormSettings?.activeProduct?.[0]) return null;

    return vesselsEligibilities.find(
      e => e.product_id === serviceFormSettings?.activeProduct?.[0]
    ) || null;
  }, [vesselsEligibilities, serviceFormSettings?.activeProduct?.[0]]);

  const category = useMemo(() => {
    const workServiceId = productInForm?.service_data?.service_id || null
    const workCategoryId = productInForm?.service_data?.category_id

    if (!workServiceId && !workCategoryId) return null;

    const currentCategory = categories?.filter(c => (c?.service_id || null) === workServiceId && c?.category_id === workCategoryId)?.[0]

    return currentCategory
  }, [categories, productInForm])


  useEffect(() => {
    if (!workMenu?.type) return;

    // components 
    if (workMenu?.type === 'components') {

      if (workMenu?.id === 'materials') {
        setComponentsList(materialsList?.map(i => {
          const inForm = productInForm?.work?.components_list?.filter(s => s?.spare_id === i?.material_uuid)?.[0]
          if (inForm) return inForm

          let obj = {
            spare_id: i?.material_uuid,
            spare_name: i?.brand_name ? `${i?.material_name} - ${i?.brand_name}` : i?.material_name,
            spare_type: 'materials',
            pricing: findSpareTypeAmount(i, category?.spare_policies?.materials?.price_type)
              || { list_price: 0, charged: 0, ledger_cost: 0 },
            qty: 0,
            qty_type: i?.qty_type,
            under_warranty: false,
            warranty_period_months: 0,
            is_customer_product: false,
            is_removed: false
          }

          return obj
        }))
        setComponentsPage({ title: 'Materials', id: 'materials', max: 0, deleteItem: false })
        return;
      }

      if (workMenu?.id === 'bags') {
        const allowedBags = bagList?.filter(b => (b.supported_vessels?.type === 'all' || b.supported_vessels?.vessel_list?.includes(product?.product?.vessel_uuid)))

        const warrantyBag = product?.product?.bag_warranty_expire_date &&
          normalizeDate(new Date(product?.product?.bag_warranty_expire_date)) >= normalizeDate(new Date()) ? true : false

        setComponentsList(allowedBags?.map(i => {
          const inForm = productInForm?.work?.components_list?.filter(s => s?.spare_id === i?.bag_uuid)?.[0]
          if (inForm) return inForm

          let obj = {
            spare_id: i?.bag_uuid,
            spare_name: i?.bag_name,
            spare_type: 'bags',
            pricing: findSpareTypeAmount(i, category?.spare_policies?.bag?.price_type, warrantyBag)
              || { list_price: 0, charged: 0, ledger_cost: 0 },
            qty: 0,
            qty_type: 'nos',
            under_warranty: warrantyBag,
            warranty_period_months: 0,
            is_customer_product: i?.bag_uuid === product?.product?.bag_uuid,
            is_removed: false
          }

          return obj
        }))
        setComponentsPage({ title: 'Bags', id: 'bags', max: 1, deleteItem: false })
        return;
      }

      if (workMenu?.id === 'spares') {

        setComponentsList(spareList?.map(i => {
          const inForm = productInForm?.work?.components_list?.filter(s => s?.spare_id === i?.spare_uuid)?.[0]
          if (inForm) return inForm

          const spareInCustomer = product?.product?.spares?.filter(s => s?.spare_uuid === i?.spare_uuid)?.[0]
          const spareInRemoveList = productInForm?.work?.removed_components_list?.filter(s => s?.spare_id === i?.spare_uuid)?.[0] ? true : false

          const warrantySpare = spareInCustomer?.wr_expire_date &&
            normalizeDate(new Date(spareInCustomer?.wr_expire_date)) >= normalizeDate(new Date()) ? true : false

          let obj = {
            spare_id: i?.spare_uuid,
            spare_name: i?.brand_name ? `${i?.spare_name} - ${i?.brand_name}` : i?.spare_name,
            spare_type: 'spares',
            pricing: findSpareTypeAmount(i, category?.spare_policies?.primary_spare?.price_type, warrantySpare)
              || { list_price: 0, charged: 0, ledger_cost: 0 },
            qty: 0,
            qty_type: i?.qty_type,
            under_warranty: warrantySpare,
            warranty_period_months: 0,
            is_customer_product: i?.spare_uuid === spareInCustomer?.spare_uuid,
            is_removed: spareInRemoveList
          }

          return obj
        }))
        setComponentsPage({ title: 'Spares', id: 'spares', max: 0, deleteItem: true })
        return;
      }
    }

    if (workMenu?.type === 'services') {
      setServicesList(vesselServiceList?.map(i => {
        const inForm = productInForm?.work?.services_list?.filter(s => s?.service_id === i?.work_uuid)?.[0]
        if (inForm) return inForm

        const warrantyBag = product?.product?.bag_warranty_expire_date &&
          normalizeDate(new Date(product?.product?.bag_warranty_expire_date)) >= normalizeDate(new Date()) ? true : false


        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here

        // The spare policies not included the service work access and price type 
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here
        // ? Start Here


        let obj = {
          service_id: i?.work_uuid,
          service_name: i?.work_name,
          pricing: findSpareTypeAmount(i, category?.spare_policies?.primary_spare?.price_type, warrantySpare)
            || { list_price: 0, charged: 0, ledger_cost: 0 },
          qty: 0,
          qty_type: i?.qty_type,
          under_warranty: warrantySpare,
          warranty_period_months: 0,
          is_customer_product: i?.spare_uuid === spareInCustomer?.spare_uuid,
          is_removed: spareInRemoveList
        }

        return obj
      }))

      setComponentsPage({ title: 'Service Works', id: 'services', max: 0, deleteItem: false })
    }
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
          regData={regData} />
      }

      <VfServiceList />

      {(productInForm?.service_data?.category_id && productInForm?.service_data?.mode) &&
        <>{workMenu?.type
          ? <>
            {workMenu?.type === 'components' &&
              <VfComponentsList setWorkMenu={setWorkMenu} componentsList={componentsList} componentsPage={componentsPage}
                productInForm={productInForm} />}
            {workMenu?.type === 'services' &&
              <VfServiceList setWorkMenu={setWorkMenu} componentsList={componentsList} componentsPage={componentsPage}
                productInForm={productInForm} />}
          </>
          : <VfServiceWorkHome category={category} setWorkMenu={setWorkMenu} />}
        </>
      }

    </div>
  )
}

export default SfSubPageThree