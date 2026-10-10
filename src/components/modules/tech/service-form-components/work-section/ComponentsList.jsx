import React, { useEffect, useMemo, useState } from 'react'
import './components-list.scss'
import { TbComponents, TbMinus, TbPlus, TbSearch, TbTrash, TbX } from 'react-icons/tb'
import { useDispatch } from 'react-redux'
import { sfActions } from '../../../../../redux/features/persisted/applicationSlice'
import InputText from '../../../../UI_Primitives/inputs/InputText'
import Button from '../../../../UI_Primitives/buttons/Button'
import EmptyState from '../../../../UI_Primitives/ui-states/EmptyState'
import { toStandardText } from '../../../../../utils/helpers/text-formatting'
import { render } from '@testing-library/react'


const ComponentsList = ({ itemsList, subPage, setWorkMenu, productInForm, changeSubmitStatus, workMenu, category }) => {
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('')
    const [enableSearch, setEnableSearch] = useState(false)
    const [data, setData] = useState([])
    const [sectionId, setSectionId] = useState('PRODUCT_SPARE')

    const productSpares = useMemo(() => {

    }, [])

    const allSpares = useMemo(() => {

    }, [])

    const selectSection = (id) => {
        setSectionId(id)
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
                
                {sectionId === 'PRODUCT_SPARE' && <ProductSpares />}
                {sectionId === 'ALL_SPARES' && <AllSpares />}

                <div className="fixed-section">
                    <div className="submit-button">
                        <Button label={'Done'} severity={'secondary'} rounded style={{ width: '100%' }} onClick={() => setWorkMenu('')} />
                    </div>
                </div>
            </div>
        </div>
    )
}

const AllSpares = () => {
    return (<div>

        <EmptyState
            size='sm'
            icon={<TbComponents />}
            // title={!itemsList?.length ? 'No Access' : 'No matched components'}
            hight='250px'
        />
    </div>)
}


const ProductSpares = () => {
    return (<div className='spare-list product-spare-list'></div>)
}


export default ComponentsList