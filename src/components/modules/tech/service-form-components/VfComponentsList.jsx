import React, { useEffect, useState } from 'react'
import './vf-components-list.scss'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { TbComponents, TbMinus, TbPlus, TbTrash } from 'react-icons/tb'
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState'
import { useDispatch } from 'react-redux'
import { sfActions } from '../../../../redux/features/persisted/applicationSlice'

const VfComponentsList = ({ componentsList, componentsPage, setWorkMenu, productInForm, changeSubmitStatus }) => {
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('')
    const [data, setData] = useState([])


    const addToSpareList = (item) => {
        const existingList = productInForm?.work?.components_list || [];

        const existingIndex = existingList?.findIndex((comp) => comp.spare_id === item.spare_id);

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
                    spare_id: item?.spare_id,
                    spare_name: item?.spare_name,
                    spare_type: item?.spare_type,
                    pricing: item?.pricing,
                    qty: 1,
                    qty_type: item?.qty_type,
                    under_warranty: item?.under_warranty,
                    warranty_period_months: item?.warranty_period_months,
                    is_customer_product: item?.is_customer_product,
                    is_removed: item?.is_removed
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
                if (comp.spare_id !== item.spare_id) return comp;

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
                        spare_id: item?.spare_id,
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
                removed_components_list: productInForm?.work?.removed_components_list?.filter(r => r?.spare_id !== item?.spare_id)
            }
        }))
    }



    useEffect(() => {
        let preData = componentsList

        //filter
        if (searchText) {
            const regex = new RegExp(searchText, 'i');
            preData = componentsList?.filter((i) => regex.test(i?.spare_id?.split('-')?.[2]) || regex.test(i?.spare_name))
        }

        setData(preData)
    }, [searchText, componentsList])


    return (
        <div className="vf-components-list-comp-container">
            <div className="search-section">
                <InputText label={'Search components'} size='small' name={'key'} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            </div>

            <div className="components-list-border">
                <div className="title">
                    <h3>{componentsPage?.title}</h3>
                </div>

                {(!componentsList?.length || !data?.length) &&
                    <EmptyState
                        icon={<TbComponents />}
                        title={!componentsList?.length ? 'Components not available' : 'No matched components'}
                        hight='250px'
                    />}
                {data?.length ?
                    <div className="components-list">
                        {data?.map((item) => {
                            const itemTempId = item?.spare_id?.split('-')?.[2]?.toUpperCase()
                            const existedCount = productInForm?.work?.components_list?.filter(
                                (c) => c?.spare_type === componentsPage?.id
                            ).length || 0;

                            return <div className={`item ${item?.is_customer_product ? 'blue-box' : ''} ${item?.qty ? 'select-box' : ''}`} key={item?.spare_id}>
                                <div className="item-content">
                                    <p className='id'>#{itemTempId}</p>
                                    <h4>{item?.spare_name}</h4>
                                    <div className="price">
                                        {item?.pricing?.list_price !== item?.pricing?.charged && <p className="hash-price">₹{item?.pricing?.list_price}</p>}
                                        <p className="real-price">₹{item?.pricing?.charged}</p>
                                    </div>
                                </div>
                                {item?.is_removed
                                    ? <div className="single-button">
                                        <Button label={'Undo Remove'} rounded size='small' onClick={() => undoRemove(item)} />
                                    </div>
                                    : <div className="dual-buttons">
                                        {item?.qty > 0
                                            ? <Button icon={<TbMinus />} rounded size='small' severity={'danger'} onClick={() => removeFromSpareList(item)} />
                                            : <Button icon={<TbTrash />} rounded size='small' severity={'danger'} onClick={() => removeSpare(item)}
                                                disabled={!componentsPage?.deleteItem || !item?.is_customer_product} />}

                                        <p>{item?.qty || 0} {item?.qty_type || ''}</p>

                                        <Button icon={<TbPlus />} rounded size='small' severity={'success'} onClick={() => addToSpareList(item)}
                                            disabled={componentsPage?.max && existedCount >= componentsPage.max} />
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