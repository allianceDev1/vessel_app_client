import React, { useEffect, useMemo, useState } from 'react'
import './components-list.scss'
import { TbComponents, TbSearch, TbX, TbChevronDown, TbChevronUp } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions } from '../../../../../redux/features/persisted/applicationSlice'
import InputText from '../../../../UI_Primitives/inputs/InputText'
import Button from '../../../../UI_Primitives/buttons/Button'
import EmptyState from '../../../../UI_Primitives/ui-states/EmptyState'
import { toStandardText } from '../../../../../utils/helpers/text-formatting'
import ProductSpareCard from './ProductSpareCard'
import AllSpareCard from './AllSpareCard'
import { findSpareTypeAmount } from '../../../../../utils/flows/service_form_utils'
import { normalizeDate } from '../../../../../utils/helpers/date-helpers'

// Temporary dummy data for analysis & preview
export const DUMMY_PRODUCT_SPARES = [
    {
        spare_uuid: "sp-prod-001",
        component_uuid: "comp-uuid-984",
        spare_id: "SPR-00001",
        spare_name: "Booster Pump 100 GPD (Kemflo)",
        is_warranty_item: true,
        pricing: {
            mrp: 1850,
            actual: 1550.00
        },
        is_active: false,
        spare_category: "Pump",
        is_selected: true,
        selection_type: "SAME",
        is_deleted: false
    },
    {
        spare_uuid: "sp-prod-002",
        component_uuid: "comp-uuid-412",
        spare_id: "SPR-00015",
        spare_name: "RO Membrane 75 GPD Dow Filmtec",
        is_warranty_item: false,
        pricing: {
            mrp: 2200,
            actual: 1850.00
        },
        is_active: true,
        spare_category: "Membrane",
        is_selected: true,
        selection_type: "REPLACE",
        is_deleted: false
    },
    {
        spare_uuid: "sp-prod-003",
        component_uuid: "comp-uuid-731",
        spare_id: "SPR-00028",
        spare_name: "SMPS Power Supply Adapter 24V 2.5A",
        is_warranty_item: false,
        pricing: {
            mrp: 850,
            actual: 750.00
        },
        is_active: true,
        spare_category: "Electronics",
        is_selected: false,
        selection_type: null,
        is_deleted: false
    },
    {
        spare_uuid: "sp-prod-004",
        component_uuid: "comp-uuid-105",
        spare_id: "SPR-00034",
        spare_name: "Solenoid Valve (SV) 24V DC",
        is_warranty_item: true,
        pricing: {
            mrp: 450,
            actual: 400.00
        },
        is_active: true,
        spare_category: "Valves",
        is_selected: false,
        selection_type: null,
        is_deleted: true
    }
]

export const DUMMY_ALL_SPARES = [
    {
        spare_uuid: "sp-all-001",
        spare_id: "SPR-10042",
        spare_name: "Sediment Filter Cartridge 10\" 5 Micron",
        pricing: {
            mrp: 450,
            actual: 350.00
        },
        is_active: true,
        spare_category: "Filter",
        is_selected: false,
        qty: 0,
        selection_type: null
    },
    {
        spare_uuid: "sp-all-002",
        spare_id: "SPR-10081",
        spare_name: "Activated Carbon Block Pre-Filter 10\"",
        pricing: {
            mrp: 650,
            actual: 550.00
        },
        is_active: true,
        spare_category: "Filter",
        is_selected: true,
        qty: 1,
        selection_type: "SAME"
    },
    {
        spare_uuid: "sp-all-003",
        spare_id: "SPR-10115",
        spare_name: "Post Carbon Filter Inline Taste Enhancer",
        pricing: {
            mrp: 500,
            actual: 420.00
        },
        is_active: true,
        spare_category: "Filter",
        is_selected: true,
        qty: 2,
        selection_type: "SAME"
    },
    {
        spare_uuid: "sp-all-004",
        spare_id: "SPR-10220",
        spare_name: "High Pressure Switch (HPS)",
        pricing: {
            mrp: 350,
            actual: 280.00
        },
        is_active: true,
        spare_category: "Electronics",
        is_selected: false,
        qty: 0,
        selection_type: null
    },
    {
        spare_uuid: "sp-all-005",
        spare_id: "SPR-10333",
        spare_name: "UF Ultrafiltration Hollow Fiber Membrane",
        pricing: {
            mrp: 900,
            actual: 800.00
        },
        is_active: false,
        spare_category: "Membrane",
        is_selected: false,
        qty: 0,
        selection_type: null
    }
]

const ComponentsList = ({ itemsList, product, subPage, setWorkMenu, productInForm, changeSubmitStatus, workMenu, serviceCategory }) => {
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('')
    const [enableSearch, setEnableSearch] = useState(false)
    const [data, setData] = useState([])
    const [sectionId, setSectionId] = useState('PRODUCT_SPARE')
    const { formResources, serviceFormSettings } = useSelector((state) => state.application)

    const selectSection = (id) => {
        setSectionId(id)
    }

    // Dummy state for demonstration & testing
    const [productSparesList, setProductSparesList] = useState(DUMMY_PRODUCT_SPARES)
    const [allSparesList, setAllSparesList] = useState(DUMMY_ALL_SPARES)

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
                is_selected: selectedItem ? true : false,
                selection_type: selectedItem ? selectedItem?.replaced_spare_uuid === productSpare?.spare_uuid ? 'DEFAULT' : 'REPLACE' : null,
                is_removed: isRemoved,
                pricing: priceObject
            }

        })

    }, [formResources, productInForm, serviceCategory, searchText])

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

            const selectedItem = productInForm?.work?.components_list?.find(c => !c?.component_uuid && c?.replaced_spare_uuid === spare?.spare_uuid);

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
                qty: selectSection?.qty || 0,
                pricing: priceObject
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

    }, [serviceFormSettings, searchText, formResources, serviceCategory])

    // Handlers for Product Spare card
    const handleSelectProductSpare = (item, selectionType) => {
        setProductSparesList((prev) =>
            prev.map((p) => {
                if (p.spare_uuid !== item.spare_uuid) return p
                return {
                    ...p,
                    is_selected: Boolean(selectionType),
                    selection_type: selectionType
                }
            })
        )
    }

    const handleDeleteProductSpare = (item) => {
        setProductSparesList((prev) =>
            prev.map((p) => (p.spare_uuid === item.spare_uuid ? { ...p, is_deleted: true } : p))
        )
    }

    const handleUndoDeleteProductSpare = (item) => {
        setProductSparesList((prev) =>
            prev.map((p) => (p.spare_uuid === item.spare_uuid ? { ...p, is_deleted: false } : p))
        )
    }

    // Handlers for All Spares card
    const handleSelectAllSpare = (item) => {
        setAllSparesList((prev) =>
            prev.map((s) => {
                if (s.spare_uuid !== item.spare_uuid) return s
                const nextQty = s.qty > 0 ? s.qty : 1
                return { ...s, is_selected: true, qty: nextQty }
            })
        )
    }

    const handleDeleteAllSpare = (item) => {
        setAllSparesList((prev) =>
            prev.map((s) =>
                s.spare_uuid === item.spare_uuid ? { ...s, is_selected: false, qty: 0 } : s
            )
        )
    }

    const handleQtyChangeAllSpare = (item, newQty) => {
        setAllSparesList((prev) =>
            prev.map((s) => {
                if (s.spare_uuid !== item.spare_uuid) return s
                return {
                    ...s,
                    qty: Number(newQty),
                    is_selected: Number(newQty) > 0
                }
            })
        )
    }

    const handleIncrementAllSpare = (item) => {
        setAllSparesList((prev) =>
            prev.map((s) => {
                if (s.spare_uuid !== item.spare_uuid) return s
                const nextQty = Number(s.qty || 0) + 1
                return { ...s, is_selected: true, qty: nextQty }
            })
        )
    }

    const handleDecrementAllSpare = (item) => {
        setAllSparesList((prev) =>
            prev.map((s) => {
                if (s.spare_uuid !== item.spare_uuid) return s
                const nextQty = Number(s.qty || 0) - 1
                return {
                    ...s,
                    qty: Math.max(0, nextQty),
                    is_selected: nextQty > 0
                }
            })
        )
    }

    const addToSpareList = (item) => {
        const existingList = productInForm?.work?.components_list || [];

        const existingIndex = existingList?.findIndex((comp) => comp.spare_id === item.spare_id && comp.spare_type === workMenu?.type);

        let updatedSpareList;
        //  If spare already exists → adjust qty
        if (existingIndex !== -1) {
            updatedSpareList = existingList.map((comp, index) =>
                index === existingIndex
                    ? {
                        ...comp,
                        qty: Number(comp.qty || 0) + 1
                    }
                    : comp
            );
        }
        //  If spare does not exist → push new
        else {
            updatedSpareList = [
                ...existingList,
                {
                    ...item,
                    qty: 1
                }
            ];
        }

        changeSubmitStatus(false)

        dispatch(sfActions.updateProduct.innerFields({
            work: {
                ...productInForm?.work,
                components_list: updatedSpareList
            }
        }));
    }

    const removeFromSpareList = (item) => {
        const existingList = productInForm?.work?.components_list || [];

        const updatedSpareList = existingList
            .map((comp) => {
                if (comp.spare_id !== item.spare_id || comp.spare_type !== workMenu?.type) return comp;

                const updatedQty = Number(comp.qty || 0) - 1;

                // qty will be handled in filter step
                return {
                    ...comp,
                    qty: updatedQty
                };
            })
            //  Remove item if qty becomes 0
            .filter((comp) => comp.qty > 0);

        changeSubmitStatus(false)

        dispatch(
            sfActions.updateProduct.innerFields({
                work: {
                    ...productInForm?.work,
                    components_list: updatedSpareList
                }
            })
        );
    };

    const removeSpare = (item) => {
        if (!item?.is_customer_product || item?.is_removed || item?.qty) return;

        changeSubmitStatus(false)

        dispatch(sfActions.updateProduct.innerFields({
            work: {
                ...productInForm?.work,
                removed_components_list: [
                    ...(productInForm?.work?.removed_components_list || []),
                    {
                        spare_uuid: item?.spare_uuid,
                        spare_type: item?.spare_type
                    }
                ]
            }
        }));
    }

    const undoRemove = (item) => {
        changeSubmitStatus(false)
        dispatch(sfActions.updateProduct.innerFields({
            work: {
                ...productInForm?.work,
                removed_components_list: productInForm?.work?.removed_components_list?.filter(r => r?.spare_uuid !== item?.spare_uuid || r?.spare_type !== item?.spare_type)
            }
        }))
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
                        onSelect={handleSelectProductSpare}
                        onDelete={handleDeleteProductSpare}
                        onUndoDelete={handleUndoDeleteProductSpare}
                    />
                )}
                {sectionId === 'ALL_SPARES' && (
                    <AllSpares
                        productInForm={productInForm}
                        serviceCategory={serviceCategory}
                        workMenu={workMenu}
                        product={product}
                        searchText={sectionId === 'ALL_SPARES' && searchText ? searchText : ''}
                        onSelect={handleSelectAllSpare}
                        onDelete={handleDeleteAllSpare}
                        onQtyChange={handleQtyChangeAllSpare}
                        onIncrement={handleIncrementAllSpare}
                        onDecrement={handleDecrementAllSpare}
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

const ProductSpares = ({ productInForm, serviceCategory, workMenu, product, searchText, onSelect, onDelete, onUndoDelete }) => {
    const dispatch = useDispatch();
    const [enableSearch, setEnableSearch] = useState(false)
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
                is_selected: selectedItem ? true : false,
                selection_type: selectedItem ? selectedItem?.replaced_spare_uuid === productSpare?.spare_uuid ? 'DEFAULT' : 'REPLACE' : null,
                is_removed: isRemoved,
                pricing: priceObject
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
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onUndoDelete={onUndoDelete}
                />
            ))}
        </div>
    )
}

const AllSpares = ({
    productInForm, serviceCategory, workMenu, product, searchText,
    onSelect,
    onDelete,
    onQtyChange,
    onIncrement,
    onDecrement
}) => {

    const dispatch = useDispatch();

    const [enableSearch, setEnableSearch] = useState(false)
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

            const selectedItem = productInForm?.work?.components_list?.find(c => !c?.component_uuid && c?.replaced_spare_uuid === spare?.spare_uuid);

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
                pricing: priceObject
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

    }, [serviceFormSettings, searchText, formResources, serviceCategory])


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
                                        onSelect={onSelect}
                                        onDelete={onDelete}
                                        onQtyChange={onQtyChange}
                                        onIncrement={onIncrement}
                                        onDecrement={onDecrement}
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