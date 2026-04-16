import React, { useEffect, useState } from 'react'
import './vf-components-list.scss'
import { TbComponents, TbMinus, TbPlus, TbSearch, TbTrash, TbX } from 'react-icons/tb'
import { useDispatch } from 'react-redux'
import { sfActions } from '../../../../redux/features/persisted/applicationSlice'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState'


const VfComponentsList = ({ itemsList, subPage, setWorkMenu, productInForm, changeSubmitStatus, workMenu, category }) => {
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('')
    const [enableSearch, setEnableSearch] = useState(false)
    const [data, setData] = useState([])

    const selectSection = (id) => {
        setWorkMenu((state) => {
            return {
                ...state,
                id
            }
        })
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

        dispatch(sfActions.updateProduct({
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
            sfActions.updateProduct({
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

        dispatch(sfActions.updateProduct({
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
        dispatch(sfActions.updateProduct({
            work: {
                ...productInForm?.work,
                removed_components_list: productInForm?.work?.removed_components_list?.filter(r => r?.spare_uuid !== item?.spare_uuid || r?.spare_type !== item?.spare_type)
            }
        }))
    }

    useEffect(() => {
        let preData = [...itemsList]

        //filter
        if (searchText) {
            const regex = new RegExp(searchText, 'i');
            preData = itemsList?.filter((i) => regex.test(i?.spare_id) || regex.test(i?.spare_name))
        }

        setData(preData)
    }, [searchText, itemsList])


    return (
        <div className="vf-components-list-comp-container">

            <div className="components-action">
                {enableSearch
                    ? <div className="search-section">
                        <InputText label={`Search ${subPage?.title}`} size='small' name={'key'} value={searchText} onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: '100%', borderRadius: "50px" }} />
                        <Button icon={<TbX />} size='small' rounded outlined onClick={() => {
                            setEnableSearch(!enableSearch);
                            setSearchText('');
                        }} />
                    </div>
                    : <div className="menu-section">
                        {category?.coverage?.find(c => c.coverage_id === 'PRIMARY_SPARES') &&
                            <Button label={'Spares'} size='small' rounded outlined={workMenu?.id !== 'SPARE_SECTION'} style={{ width: '100%' }}
                                onClick={() => selectSection('SPARE_SECTION')} />}
                        {category?.coverage?.find(c => c.coverage_id === 'MATERIALS_BAG') &&
                            <Button label={'Bags'} size='small' rounded outlined={workMenu?.id !== 'BAG_SECTION'} style={{ width: '100%' }}
                                onClick={() => selectSection('BAG_SECTION')} />}
                        {category?.coverage?.find(c => c.coverage_id === 'MATERIAL') &&
                            <Button label={'Materials'} size='small' rounded outlined={workMenu?.id !== 'MATERIALS_SECTION'} style={{ width: '100%' }}
                                onClick={() => selectSection('MATERIALS_SECTION')} />
                        }

                        <Button icon={<TbSearch />} size='small' rounded outlined onClick={() => setEnableSearch(!enableSearch)}
                            disabled={!itemsList.length} />
                    </div>}
            </div>

            <div className="components-list-border">
                {(!itemsList?.length || !data?.length) &&
                    <EmptyState
                        size='sm'
                        icon={<TbComponents />}
                        title={!itemsList?.length ? 'No Access' : 'No matched components'}
                        hight='250px'
                    />}
                {data?.length ?
                    <div className="components-list">
                        {data?.sort((a, b) => Number(b?.is_customer_product) - Number(a?.is_customer_product))?.map((item) => {

                            const existedCount = productInForm?.work?.components_list?.filter(
                                (c) => c?.spare_section === subPage?.id
                            ).length || 0;

                            return <div className={`item ${item?.is_customer_product ? 'select-box' : ''} ${item?.qty ? 'blue-box' : ''}`} key={item?.spare_id}>
                                <div className="item-content">
                                    <p className='id'>{item?.spare_id}</p>
                                    <h4>{item?.spare_name}</h4>
                                    <div className="price">
                                        {item?.pricing?.list_price !== item?.pricing?.charged && <p className="hash-price">₹{item?.pricing?.list_price}</p>}
                                        <p className="real-price">₹{item?.pricing?.charged}</p>
                                    </div>
                                    {item?.warranty_period_months ? <div className="warranty-badge">
                                        <p>{item?.warranty_period_months} months warranty</p>
                                    </div> : ''}
                                </div>
                                {item?.is_removed
                                    ? <div className="single-button">
                                        <Button label={'Undo Remove'} rounded size='small' onClick={() => undoRemove(item)} />
                                    </div>
                                    : <div className="dual-buttons">
                                        {item?.qty > 0
                                            ? <Button icon={<TbMinus />} rounded size='small' severity={'danger'} onClick={() => removeFromSpareList(item)} />
                                            : <Button icon={<TbTrash />} rounded size='small' severity={'danger'} onClick={() => removeSpare(item)}
                                                disabled={!subPage?.deleteItem || !item?.is_customer_product} />}

                                        {item?.qty ? <p>{item?.qty || 0} {item?.unit || ''}</p> : ""}

                                        <Button icon={<TbPlus />} rounded size='small' severity={'success'} onClick={() => addToSpareList(item)}
                                            disabled={subPage?.max && existedCount >= subPage.max} />
                                    </div>}
                            </div>
                        })}
                    </div> : ''}

                <div className="fixed-section">
                    <div className="submit-button">
                        <Button label={'Done'} rounded style={{ width: '100%' }} onClick={() => setWorkMenu({ type: null, id: null })} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VfComponentsList