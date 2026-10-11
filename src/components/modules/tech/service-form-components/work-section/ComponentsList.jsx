import React, { useMemo, useState } from 'react'
import './components-list.scss'
import { TbComponents, TbSearch, TbX, TbChevronDown, TbChevronUp } from 'react-icons/tb'
import { useSelector } from 'react-redux'
import InputText from '../../../../UI_Primitives/inputs/InputText'
import Button from '../../../../UI_Primitives/buttons/Button'
import EmptyState from '../../../../UI_Primitives/ui-states/EmptyState'
import { toStandardText } from '../../../../../utils/helpers/text-formatting'
import ProductSpareCard from './ProductSpareCard'
import AllSpareCard from './AllSpareCard'
import { findSpareTypeAmount } from '../../../../../utils/flows/service_form_utils'
import { normalizeDate } from '../../../../../utils/helpers/date-helpers'


const ComponentsList = ({ product, setWorkMenu, productInForm, workMenu, serviceCategory }) => {
    const [searchText, setSearchText] = useState('')
    const [enableSearch, setEnableSearch] = useState(false)
    const [sectionId, setSectionId] = useState('PRODUCT_SPARE')


    const selectSection = (id) => {
        setSectionId(id)
    }

    return (
        <div className="vf-components-list-comp-container">

            <div className="components-action">
                {enableSearch
                    ? <div className="search-section">
                        <InputText label={`Search ${toStandardText(sectionId)}`} size='small' name={'key'} value={searchText} onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: '100%', borderRadius: "50px" }} />
                        <Button icon={<TbX />} size='small' rounded outlined severity={'secondary'} onClick={() => {
                            setEnableSearch(!enableSearch);
                            setSearchText('');
                        }} />
                    </div>
                    : <div className="menu-section">

                        <Button label={"Product's Spares"} size='small' rounded outlined={sectionId !== 'PRODUCT_SPARE'} style={{ width: '100%' }}
                            onClick={() => selectSection('PRODUCT_SPARE')} severity={'secondary'} />
                        <Button label={'All Spares'} size='small' rounded outlined={sectionId !== 'ALL_SPARES'} style={{ width: '100%' }}
                            onClick={() => selectSection('ALL_SPARES')} severity={'secondary'} />

                        <Button icon={<TbSearch />} size='small' rounded outlined onClick={() => setEnableSearch(!enableSearch)} severity={'secondary'} />
                    </div>}
            </div>

            <div className="components-list-border">

                {sectionId === 'PRODUCT_SPARE' && (
                    <ProductSpares
                        productInForm={productInForm}
                        serviceCategory={serviceCategory}
                        workMenu={workMenu}
                        product={product}
                        searchText={sectionId === 'PRODUCT_SPARE' && searchText ? searchText : ''}
                    />
                )}
                {sectionId === 'ALL_SPARES' && (
                    <AllSpares
                        productInForm={productInForm}
                        serviceCategory={serviceCategory}
                        workMenu={workMenu}
                        product={product}
                        searchText={sectionId === 'ALL_SPARES' && searchText ? searchText : ''}
                    />
                )}

                <div className="fixed-section">
                    <div className="submit-button">
                        <Button label={'Done'} severity={'secondary'} rounded style={{ width: '100%' }} onClick={() => setWorkMenu('')} />
                    </div>
                </div>
            </div>
        </div>
    )
}

const ProductSpares = ({
    productInForm,
    serviceCategory,
    workMenu,
    product,
    searchText
}) => {
    const { formResources, serviceFormSettings } = useSelector((state) => state.application)

    const productSpares = useMemo(() => {
        const activeProduct = formResources?.products?.find(p => p?.product_id === serviceFormSettings?.activeProduct?.[0]) || null
        let productSpares = (activeProduct?.product?.spares || [])?.filter(s => s?.component_uuid && s?.spare_uuid)

        const reg = new RegExp(searchText, 'i')
        if (searchText) {
            productSpares = productSpares.filter((p) => reg.test(p.spare_name) || reg.test(p.spare_id) || reg.test(p.spare_category))
        }

        return productSpares?.map((productSpare) => {
            const spare = formResources?.spare_list?.find(s => s?.spare_uuid === productSpare?.spare_uuid)
            const selectedItem = productInForm?.work?.components_list?.find(c => c?.component_uuid === productSpare?.component_uuid)
            const isRemoved = productInForm?.work?.removed_components_list?.find(c => c?.component_uuid === productSpare?.component_uuid) ? true : false
            const spareWarranty = productSpare?.wr_expire_date && (normalizeDate(new Date()) <= normalizeDate(new Date(productSpare?.wr_expire_date))) ? true : false

            const coverage = serviceCategory?.coverage?.find(c => {
                if (workMenu === 'RENEWAL_SPARE') {
                    return c.coverage_id === 'SPARE_PARTS' && c.position === 'TARGET';
                } else {
                    return c.coverage_id === 'SPARE_PARTS' && c.position === 'CURRENT';
                }
            })

            // For package coverage the additional_spare price_type default is SELLING_RATE
            const priceType = product?.package?.package_id && workMenu === 'ADDITIONAL_SPARE' ? 'SELLING_RATE' : coverage?.price_type

            const priceObject = findSpareTypeAmount(
                (spare?.pricing || {}),
                priceType,
                product?.package?.package_id || null,
                spareWarranty
            )

            return {
                spare_uuid: productSpare?.spare_uuid,
                spare_id: productSpare?.spare_id,
                component_uuid: productSpare?.component_uuid,
                spare_name: productSpare?.spare_name,
                spare_category: productSpare?.spare_category,
                is_warranty_item: spareWarranty,
                wr_expire_date: productSpare?.wr_expire_date,
                is_active: productSpare?.is_active && spare ? true : false,
                unit: productSpare?.unit,
                insert_at: productSpare?.insert_at || null,
                is_selected: selectedItem ? true : false,
                selection_info: {
                    selected_context: selectedItem ? selectedItem?.selection_context : null,
                    policy_mode: selectedItem ? selectedItem?.policy_mode : null,
                    charged_amount: selectedItem?.pricing?.charged || 0,
                    selection_type: selectedItem ? selectedItem?.spare_uuid === productSpare?.spare_uuid ? 'DEFAULT' : 'REPLACE' : null,
                },
                selected_context: selectedItem ? selectedItem?.selection_context : null,
                selection_context: workMenu,
                is_removed: isRemoved,
                pricing: priceObject,
                price_type: priceType,
                package_id: product?.package?.package_id || null,
            }

        })

    }, [formResources, productInForm, serviceCategory, searchText])


    if (!productSpares?.length) {
        return (
            <EmptyState
                size='sm'
                icon={<TbComponents />}
                title='No product spares found'
                hight='calc(100vh - 450px)'
            />
        )
    }

    return (
        <div className='spare-list product-spare-list'>
            {productSpares.map((item) => (
                <ProductSpareCard
                    key={item.spare_uuid || item.spare_id}
                    data={item}
                    productInForm={productInForm}
                />
            ))}
        </div>
    )
}

const AllSpares = ({
    productInForm,
    serviceCategory,
    workMenu,
    product,
    searchText
}) => {

    const { formResources, serviceFormSettings } = useSelector((state) => state.application)

    const allSpares = useMemo(() => {
        const activeProductType = serviceFormSettings?.activeProduct?.[1] || null

        if (!activeProductType) {
            return [];
        }

        let spares = formResources?.spare_list?.filter(s => s?.applicable_for.includes(activeProductType) && s?.spare_uuid)

        const reg = new RegExp(searchText, 'i')
        if (searchText) {
            spares = spares.filter((p) => reg.test(p.spare_name) || reg.test(p.spare_id) || reg.test(p.spare_category))
        }

        spares = spares?.map((spare) => {

            const selectedItem = productInForm?.work?.components_list?.find(c =>
                c?.section_id === 'ALL_SPARE' &&
                c?.spare_uuid === spare?.spare_uuid &&
                c?.selection_context === workMenu
            );

            const coverage = serviceCategory?.coverage?.find(c => {
                if (workMenu === 'RENEWAL_SPARE') {
                    return c.coverage_id === 'SPARE_PARTS' && c.position === 'TARGET';
                } else {
                    return c.coverage_id === 'SPARE_PARTS' && c.position === 'CURRENT';
                }
            })

            // For package coverage the additional_spare price_type default is SELLING_RATE
            const priceType = product?.package?.package_id && workMenu === 'ADDITIONAL_SPARE' ? 'SELLING_RATE' : coverage?.price_type

            const priceObject = findSpareTypeAmount(
                (spare?.pricing || {}),
                priceType,
                product?.package?.package_id || null,
                false
            )

            return {
                spare_uuid: spare?.spare_uuid,
                spare_id: spare?.spare_id,
                spare_name: spare?.spare_name,
                spare_category: spare?.spare_category,
                is_active: true,
                unit: spare?.unit,
                is_selected: selectedItem ? true : false,
                qty: selectedItem?.qty || 0,
                pricing: priceObject,
                warranty_period: priceObject.charged > 0 && spare?.warranty_period ? spare?.warranty_period : 0
            }
        });

        const groups = spares.reduce((acc, spare) => {
            const category = spare.spare_category;

            if (!acc[category]) {
                acc[category] = {
                    spare_category: category,
                    items: [],
                };
            }

            acc[category].items.push(spare);

            return acc;
        }, {});

        return Object.values(groups).sort((a, b) =>
            a.spare_category.localeCompare(b.spare_category)
        );

    }, [serviceFormSettings, searchText, formResources, serviceCategory, productInForm])


    const [openCategory, setOpenCategory] = useState(null)

    const toggleCategory = (categoryKey) => {
        setOpenCategory((prev) => (prev === categoryKey ? null : categoryKey))
    }

    if (!allSpares?.length) {
        return (
            <EmptyState
                size='sm'
                icon={<TbComponents />}
                title='No spares found'
                hight='250px'
            />
        )
    }

    return (
        <div className='spare-list all-spare-list'>
            {allSpares.map((group) => {
                const categoryKey = group?.spare_category || 'Other'
                const isOpen = searchText ? true : openCategory === categoryKey
                const selectedCount = group?.items?.filter((i) => i?.is_selected || Number(i?.qty || 0) > 0)?.length || 0

                return (
                    <div key={categoryKey} className='all-spares-category-group'>
                        <div
                            className={`category-header ${isOpen ? 'is-open' : ''}`}
                            onClick={() => toggleCategory(categoryKey)}
                        >
                            <div className='header-left'>
                                <span className='category-title'>
                                    {toStandardText(categoryKey)}
                                </span>
                                <span className='category-count'>
                                    {group?.items?.length || 0}
                                </span>
                                {selectedCount > 0 && (
                                    <span className='selected-count-badge'>
                                        {selectedCount} selected
                                    </span>
                                )}
                            </div>
                            <div className='header-right'>
                                {isOpen ? (
                                    <TbChevronUp className='toggle-icon' />
                                ) : (
                                    <TbChevronDown className='toggle-icon' />
                                )}
                            </div>
                        </div>

                        {isOpen && (
                            <div className='category-items'>
                                {group?.items?.map((item) => (
                                    <AllSpareCard
                                        key={item.spare_uuid || item.spare_id}
                                        data={item}
                                        productInForm={productInForm}
                                        workMenu={workMenu}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default ComponentsList