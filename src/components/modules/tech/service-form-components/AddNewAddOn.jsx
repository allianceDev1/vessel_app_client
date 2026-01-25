import React, { useEffect, useState } from 'react'
import './add-new-addon.scss'
import Radio from '../../../UI_Primitives/inputs/Radio'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Checkbox from '../../../UI_Primitives/inputs/Checkbox'
import Button from '../../../UI_Primitives/buttons/Button'
import { isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions } from '../../../../redux/features/persisted/applicationSlice'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'

const AddNewAddOn = ({ availableAddOns, addOnSpareList }) => {
    const dispatch = useDispatch();
    const [form, setForm] = useState({})
    const [totalAmount, setTotalAmount] = useState({})
    const { serviceForm } = useSelector((state) => state.application)

    const handleChange = (e) => {
        // product type
        if (e.target.name === 'purchase_type') {

            setForm({
                ...form,
                [e.target.name]: e.target.value,
                is_zero_fee: false
            })

            return;
        }

        // is_zero_fee
        if (e.target.name === 'is_zero_fee') {
            setForm({
                ...form,
                [e.target.name]: e.target.checked
            })

            return;
        }

        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleChangeProduct = (e) => {
        const product = availableAddOns?.filter(a => a.item_uuid === e.target.value)?.[0]

        // Set to form
        setForm({
            ...form,
            item_id: product?.item_id,
            item_uuid: product?.item_uuid,
            product_name: product?.product_name,
            selling_rate: product?.selling_rate || 0,
            purchase_rate: product?.purchase_rate || 0,
            rent_renewal_charge: product?.rental?.renewal_charge || 0
        })
    }

    const handleChangeElement = (e) => {
        const element = addOnSpareList?.filter(a => a.spare_uuid === e.target.value)?.[0]

        // Set to form
        setForm({
            ...form,
            element: {
                spare_uuid: element?.spare_uuid,
                qty_type: element?.qty_type,
                qty: 1,
                selling_rate: element?.selling_rate || 0,
                purchase_rate: element?.purchase_rate || 0,
            }
        })
    }

    const handleChangeElementQty = (e) => {
        setForm({
            ...form,
            element: {
                ...(form.element),
                qty: Number(e.target.value),
            }
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const obj = {
            unique_id: new Date().getTime(),
            item_id: form?.item_id,
            item_uuid: form?.item_uuid,
            product_name: form?.product_name,
            purchase_type: form?.purchase_type,
            is_zero_fee: form?.is_zero_fee,
            expire_date: form?.expire_date,
            element: {
                spare_uuid: form?.element?.spare_uuid,
                qty: form?.element?.qty,
                price: {
                    list_price: totalAmount?.element?.list_price || 0,
                    charged: totalAmount?.element?.charged || 0,
                    ledger_cost: totalAmount?.element?.ledger_cost || 0
                }
            },
            product_price: {
                list_price: totalAmount?.product?.list_price || 0,
                charged: totalAmount?.product?.charged || 0,
                ledger_cost: totalAmount?.product?.ledger_cost || 0
            },
            total_amount: {
                list_price: totalAmount?.total || 0,
                charged: totalAmount?.total || 0,
                ledger_cost: totalAmount?.total || 0
            }
        }

        dispatch(sfActions.updateForm({
            new_add_ons: [...(serviceForm?.new_add_ons || []), obj]
        }))

        dispatch(modal.pull.all())

    }

    useEffect(() => {
        const element = {}, product = {}
        let total = 0

        if (form?.purchase_type === 'in_warranty' && form?.is_zero_fee === true) {
            // Element
            const unitElemSellingRate = form?.element?.selling_rate || 0
            const unitElemPurchaseRate = form?.element?.purchase_rate || 0
            const unitElemQty = form?.element?.qty || 0
            const totalElemCharged = unitElemSellingRate * unitElemQty
            const totalLedgerCost = unitElemPurchaseRate * unitElemQty


            element.list_price = totalElemCharged
            element.charged = 0
            element.ledger_cost = totalLedgerCost

            // Product
            const unitProductCharged = form?.selling_rate || 0
            const unitProductPurchaseRate = form?.purchase_rate || 0


            product.list_price = unitProductCharged
            product.charged = 0
            product.ledger_cost = unitProductPurchaseRate

            total = 0
        }

        if (form?.purchase_type === 'in_warranty' && !form?.is_zero_fee) {
            // Element
            const unitElemSellingRate = form?.element?.selling_rate || 0
            const unitElemQty = form?.element?.qty || 0
            const totalElemCharged = unitElemSellingRate * unitElemQty

            element.list_price = totalElemCharged
            element.charged = totalElemCharged
            element.ledger_cost = totalElemCharged

            // Product
            const unitProductCharged = form?.selling_rate || 0

            product.list_price = unitProductCharged
            product.charged = unitProductCharged
            product.ledger_cost = unitProductCharged

            total = totalElemCharged + unitProductCharged
        }

        if (form?.purchase_type === 'rental') {
            // Element
            const unitElemSellingRate = form?.element?.selling_rate || 0
            const unitElemQty = form?.element?.qty || 0
            const totalElemCharged = unitElemSellingRate * unitElemQty

            element.list_price = totalElemCharged
            element.charged = totalElemCharged
            element.ledger_cost = totalElemCharged

            // Product
            const unitProductCharged = form?.rent_renewal_charge || 0

            product.list_price = unitProductCharged
            product.charged = unitProductCharged
            product.ledger_cost = unitProductCharged

            total = totalElemCharged + unitProductCharged
        }

        setTotalAmount({ element, product, total })

    }, [form])


    return (
        <div className='tech-new-add-on-select-comp'>
            <form onSubmit={handleSubmit}>
                <div className="product-amount-box">
                    <div className="side-one">
                        <p>Product Price</p>
                    </div>
                    <div className="side-two">
                        <p>₹{totalAmount?.total || 0}</p>
                    </div>
                </div>
                <div className="radio-group">
                    <h4>Purchase Type <span>*</span></h4>
                    <div>
                        <Radio label={'In Warranty'} name={'purchase_type'} radioValue={'in_warranty'}
                            checked={form?.purchase_type === 'in_warranty'} onChange={handleChange} required />
                        <Radio label={'Rent'} name={'purchase_type'} radioValue={'rental'} required
                            checked={form?.purchase_type === 'rental'} onChange={handleChange} />
                    </div>
                </div>
                <Select label={'Product'} name={'product'} options={[{}, ...(availableAddOns?.map(a => ({ label: `${a?.item_id} - ${a?.product_name}`, value: a?.item_uuid })) || [])]}
                    onChange={handleChangeProduct} required value={form?.item_uuid} />
                <Select label={'Filling element'} name={'spare'} options={[{}, ...(addOnSpareList?.map(a => ({ label: a.spare_name, value: a?.spare_uuid })) || [])]}
                    onChange={handleChangeElement} required value={form?.element?.spare_uuid} />
                <Select label={'Filling element qty'} name={'spare_qty'} options={[...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(a => ({ label: `${a} ${form?.element?.qty_type || ''}`, value: a })) || [])]}
                    onChange={handleChangeElementQty} required value={form?.element?.qty} disabled={!form?.element?.spare_uuid} />
                {form?.purchase_type === 'in_warranty' && <Checkbox label={'It is zero fee item.'} name={'is_zero_fee'} value={'Yes'}
                    isChecked={form?.is_zero_fee === true} onChange={handleChange} />}
                <InputText label={'Expire Date'} name={'expire_date'} value={form?.expire_date} onChange={handleChange}
                    type='date' required min={isoToYYYYMMDD(new Date())} />

                <Button label={'Add Product'} rounded style={{ marginTop: '20px' }} />
            </form>
        </div>
    )
}

export default AddNewAddOn