import  { useEffect, useState } from 'react'
import './add-new-addon.scss'
import Select from '../../../UI_Primitives/inputs/Select'
import Checkbox from '../../../UI_Primitives/inputs/Checkbox'
import Button from '../../../UI_Primitives/buttons/Button'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { toStandardText } from '../../../../utils/helpers/text-formatting'

const AddNewAddOn = ({ addOnSpareList, serviceCharges }) => {
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        purchase_type: "IN_WARRANTY",
        service_charge: serviceCharges?.[0]?.charge_amount || 0,
    })
    const [totalAmount, setTotalAmount] = useState({})
    const { formResources, serviceForm } = useSelector((state) => state.application)



    const handleChange = (e) => {

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
        const product = formResources?.add_on_products?.find(a => a.variant_uuid === e.target.value)

        // Set to form
        setForm({
            ...form,
            variant_code: product?.variant_code,
            variant_uuid: product?.variant_uuid,
            product_name: product?.product_name,
            selling_rate: product?.selling_rate || 0,
            purchase_cost: product?.purchase_cost || 0
        })
    }

    const handleChangeElement = (e) => {
        const element = addOnSpareList?.filter(a => a.spare_uuid === e.target.value)?.[0]

        // Set to form
        setForm({
            ...form,
            element: {
                spare_uuid: element?.spare_uuid,
                unit: element?.unit,
                qty: 1,
                selling_rate: element?.pricing?.selling_rate || 0,
                purchase_cost: element?.pricing?.purchase_cost || 0,
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
            parent_type: form?.parent_type,
            variant_code: form?.variant_code,
            variant_uuid: form?.variant_uuid,
            product_name: form?.product_name,
            purchase_type: form?.purchase_type,
            is_zero_fee: form?.is_zero_fee,
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
            service_charge: {
                list_price: form?.service_charge || 0,
                charged: totalAmount?.service_charge || 0,
                ledger_cost: totalAmount?.service_charge || 0
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

        dispatch(sfSetting.update({
            form_saved: false,
            form_saved_time: null
        }))

        dispatch(modal.pull.all())

    }

    useEffect(() => {
        const element = {}, product = {}
        let service_charge = 0, total = 0

        if (form?.is_zero_fee === true) {
            // Element
            const unitElemSellingRate = form?.element?.selling_rate || 0
            const unitElemPurchaseRate = form?.element?.purchase_cost || 0
            const unitElemQty = form?.element?.qty || 0
            const totalElemCharged = unitElemSellingRate * unitElemQty
            const totalLedgerCost = unitElemPurchaseRate * unitElemQty


            element.list_price = totalElemCharged
            element.charged = 0
            element.ledger_cost = totalLedgerCost

            // Product
            const unitProductCharged = form?.selling_rate || 0
            const unitProductPurchaseRate = form?.purchase_cost || 0

            product.list_price = unitProductCharged
            product.charged = 0
            product.ledger_cost = unitProductPurchaseRate

            total = 0
        }

        if (!form?.is_zero_fee) {
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

        if (form?.service_charge && !form?.is_zero_fee) {
            service_charge = Number(form?.service_charge) || 0
        }

        total += service_charge

        setTotalAmount({ element, product, service_charge, total })

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

                <Select label={'Parent product type'} name={'parent_type'} onChange={handleChange} required value={form?.parent_type}
                    options={[{}, ...(formResources?.access?.product_access?.filter(i => i !== 'ADD_ON')?.map(a => ({ label: toStandardText(a), value: a })) || [])]} />
                <Select label={'Product'} name={'product'} onChange={handleChangeProduct} required value={form?.variant_uuid}
                    options={[{}, ...(formResources?.add_on_products?.filter(a => a?.variant_code)?.map(a => ({ label: `${a?.variant_code} - ${a?.product_name}`, value: a?.variant_uuid })) || [])]} />
                <Select label={'Filling element'} name={'spare'} options={[{}, ...(addOnSpareList?.map(a => ({ label: a.spare_name, value: a?.spare_uuid })) || [])]}
                    onChange={handleChangeElement} required value={form?.element?.spare_uuid} />
                <Select label={'Filling element qty'} name={'spare_qty'} options={[...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(a => ({ label: `${a} ${form?.element?.unit || ''}`, value: a })) || [])]}
                    onChange={handleChangeElementQty} required value={form?.element?.qty} disabled={!form?.element?.spare_uuid} />
                <Select label={'Service Charge'} name={'service_charge'} options={[{}, ...(serviceCharges?.map(a => ({ label: a.charge_amount, value: a?.charge_amount })) || [])]}
                    onChange={handleChange} required value={form?.service_charge} />

                <Checkbox label={'It is zero fee item.'} name={'is_zero_fee'} value={'Yes'}
                    isChecked={form?.is_zero_fee === true} onChange={handleChange} />
                <p><b>Zero Fee:</b> This item will be provided at no charge, and its warranty will expire on the same date as the parent product.</p>


                <Button label={'Add Product'} rounded style={{ marginTop: '20px' }} severity={'secondary'} />

            </form>
        </div>
    )
}

export default AddNewAddOn