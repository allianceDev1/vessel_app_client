import { useEffect, useState } from 'react'
import './add-new-addon.scss'
import Select from '../../../UI_Primitives/inputs/Select'
import Checkbox from '../../../UI_Primitives/inputs/Checkbox'
import Button from '../../../UI_Primitives/buttons/Button'
import { useDispatch, useSelector } from 'react-redux'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { toStandardText } from '../../../../utils/helpers/text-formatting'

const AddNewAddOn = () => {
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        purchase_type: "IN_WARRANTY"
    })
    const [totalAmount, setTotalAmount] = useState(0)
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
            selling_rate: product?.selling_rate || 0
        })
    }

    const handleChangeElement = (e) => {
        setForm({
            ...form,
            element: {
                spare_uuid: e.target.value,
                qty: 1
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
                qty: form?.element?.qty
            },
            charged_amount: totalAmount || 0
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

        const total = form?.is_zero_fee ? 0 : (form?.selling_rate ?? 0)

        setTotalAmount(total)
        
        // eslint-disable-next-line
    }, [form?.is_zero_fee, form?.variant_uuid])


    return (
        <div className='tech-new-add-on-select-comp'>
            <form onSubmit={handleSubmit}>
                <div className="product-amount-box">
                    <div className="side-one">
                        <p>Product Price</p>
                    </div>
                    <div className="side-two">
                        <p>₹{totalAmount ?? 0}</p>
                    </div>
                </div>

                <Select label={'Parent product type'} name={'parent_type'} onChange={handleChange} required value={form?.parent_type}
                    options={[{}, ...(formResources?.access?.product_access?.filter(i => i !== 'ADD_ON')?.map(a => ({ label: toStandardText(a), value: a })) || [])]} />
                <Select label={'Product'} name={'product'} onChange={handleChangeProduct} required value={form?.variant_uuid}
                    options={[{}, ...(formResources?.add_on_products?.filter(a => a?.variant_code)?.map(a => ({ label: `${a?.variant_code} - ${a?.product_name}`, value: a?.variant_uuid })) || [])]} />
                <Select label={'Filling element'} name={'spare'} options={[{}, ...(formResources?.spare_list?.filter(e => e.spare_category === 'CHEMICALS')?.map(a => ({ label: a.spare_name, value: a?.spare_uuid })) || [])]}
                    onChange={handleChangeElement} required value={form?.element?.spare_uuid} />
                <Select label={'Filling element qty'} name={'spare_qty'} options={[...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(a => ({ label: `${a} ${form?.element?.unit || ''}`, value: a })) || [])]}
                    onChange={handleChangeElementQty} required value={form?.element?.qty} disabled={!form?.element?.spare_uuid} />


                <Checkbox label={'It is zero fee item.'} name={'is_zero_fee'} value={'Yes'}
                    isChecked={form?.is_zero_fee === true} onChange={handleChange} />
                <p><b>Zero Fee:</b> This item will be provided at no charge, and its warranty will expire on the same date as the parent product.</p>


                <Button label={'Add Product'} rounded style={{ marginTop: '20px' }} severity={'secondary'} />

            </form>
        </div>
    )
}

export default AddNewAddOn