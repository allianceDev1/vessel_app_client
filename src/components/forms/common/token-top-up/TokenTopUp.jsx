import React, { useState } from 'react'
import './token-top-up.scss'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Select from '../../../UI_Primitives/inputs/Select'
import Button from '../../../UI_Primitives/buttons/Button'
import Badge from '../../../UI_Primitives/badge/Badge'
import EmptyState from '../../../UI_Primitives/ui-states/EmptyState'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { TbCheck, TbChevronRight, TbCircleLetterT } from 'react-icons/tb'
import { useDispatch } from 'react-redux'
import { toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { getContrastText } from '../../../../utils/helpers/color-utils'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { normalizeMoney } from '../../../../utils/helpers/math-equations'
import Payment from '../payment/Payment'
import { useNavigate } from 'react-router-dom'

const TokenTopUp = ({ fetchCustomerApi, doTopUpApi, redirectUrl = '/404', prePage }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const [pageState, setPackageState] = useState(prePage || 'form') // form / payment / success
    const [topUpForm, setTopUpForm] = useState({})
    const [payment, setPayment] = useState({})
    const [loading, setLoading] = useState(false)
    const [totalAmount, setTotalAmount] = useState(0)


    const readyToPay = () => {
        // Validation
        if (topUpForm?.number_of_tokens <= 0) {
            dispatch(toast.push({
                type: 'danger',
                message: "Choose number of tokens to top-up"
            }))

            return;
        }

        setTotalAmount(Number(topUpForm?.single_token_rate) * Number(topUpForm?.number_of_tokens))
        // Proceed
        setPackageState('payment')
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true)

            await doTopUpApi(
                topUpForm?.customer_id,
                {
                    product_id: topUpForm?.product_id,
                    package_srl_no: topUpForm?.package_srl_no,
                    number_of_tokens: topUpForm?.number_of_tokens,
                    receivable_amount: payment?.receivable_amount,
                    payments: payment?.payments,
                    payment_later: payment?.payment_later
                })
            setPayment({})
            setTopUpForm({})
            setPackageState('success')

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                message: error?.message
            }))
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="token-top-up-container">
            {pageState === 'form' &&
                <TopUpForm fetchCustomerApi={fetchCustomerApi} topUpForm={topUpForm} setTopUpForm={setTopUpForm}
                    readyToPay={readyToPay} />}
            {pageState === 'payment' && <div>
                <form onSubmit={handleSubmit}>
                    <Payment state={payment} setState={setPayment} receivableAmount={totalAmount} />
                    <Button label={'Proceed Top-up'} rounded style={{ width: '100%', marginTop: '15px' }}
                        severity={'primary'} type='submit' spinIcon={loading} disabled={loading} />
                </form>
            </div>}
            {pageState === 'success' && <div className="success">
                <EmptyState
                    icon={<TbCircleLetterT />}
                    title={'Success!'}
                    description={'Token top-up successfully completed.'}
                    hight='400px'
                    footer={<div>
                        <Button label={'Close'} rounded style={{ width: '200px', marginTop: '15px' }}
                            onClick={() => navigate(redirectUrl || '/404')} />
                    </div>}
                />
            </div>}
        </div>
    )
}



const TopUpForm = ({ fetchCustomerApi, topUpForm, setTopUpForm, readyToPay }) => {
    const dispatch = useDispatch();
    const [customerId, setCustomerId] = useState('')
    const [loading, setLoading] = useState('')
    const [apiResponse, setApiResponse] = useState({})

    const handelSearchCustomer = async (e) => {
        e.preventDefault();
        try {
            setLoading('fetch-customer')
            const response = await fetchCustomerApi(customerId)

            setApiResponse(response)
            setTopUpForm({})

        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                message: error?.message
            }))
        } finally {
            setLoading('')
        }
    }

    const chooseProduct = (product) => {
        setTopUpForm({
            customer_id: apiResponse?.customer_id,
            product_id: product?.product_id,
            package_srl_no: product?.package_srl_no,
            single_token_rate: product?.single_token_rate,
            number_of_tokens: 1
        })
    }

    return (
        <div className="token-top-up-form-container">

            {/* Fetch Customer Details */}
            {!apiResponse?.customer_id && <EmptyState
                icon={<TbCircleLetterT />}
                title="Top-up Package Services"
                description={'Enter Customer Id below and top-up'}
                hight={'300px'}
            />}

            <form onSubmit={handelSearchCustomer}>
                <InputText label={"Enter Customer Id"} name={'customer_id'} value={customerId}
                    type='number' onChange={(e) => setCustomerId(e.target.value)} required={true} />
                <Button icon={<TbChevronRight />} type='submit' spinIcon={loading === 'fetch-customer'}
                    disabled={loading === 'fetch-customer'} />
            </form>

            {/* Customer Details */}
            {apiResponse?.customer_id && <div className="customer">
                <h3>{apiResponse?.customer_id} : {apiResponse?.customer_name}</h3>
                <p>{apiResponse?.address?.address}, {apiResponse?.address?.place}, P.O {apiResponse?.address?.post}</p>
            </div>}

            {/* No Products */}
            {apiResponse?.products?.length === 0 && apiResponse?.customer_id && <ErrorState
                icon={<TbCircleLetterT />}
                title={"No Products"}
                message={"No token ending products"}
                hight='400px'
            />}

            {/* Package List */}
            {apiResponse?.products?.length > 0 &&
                <div className="products">
                    {apiResponse?.products?.map((product) => {
                        return <div className="item" key={product?.product_id} onClick={() => chooseProduct(product)}>
                            <div className="input-section">
                                <div className={`dot ${topUpForm?.product_id === product?.product_id && 'active'}`}>
                                    <TbCheck />
                                </div>
                            </div>
                            <div className="content-section">
                                <h4>{product?.product_id} : {product?.product_name} {product?.order_id && `(${product?.order_id})`}</h4>
                                <div className="package">
                                    <Badge value={product?.package_name} style={{
                                        backgroundColor: product?.package_color_code,
                                        color: getContrastText(product?.package_color_code)
                                    }} />
                                    <p>Expire on {isoToDDMonYYYY(new Date(product?.package_expire_date))}, </p>
                                    <p>Token Balance : {product?.remaining_tokens || 0}</p>
                                </div>
                                <div className="token">
                                    <p>Token Rate : ₹{normalizeMoney(product?.single_token_rate)}</p>
                                </div>
                            </div>
                        </div>
                    })}
                </div>}


            {/* TopUp Form */}
            {topUpForm?.product_id && <div className="top-up">
                <Select label={'Number of tokens'} name={'number_of_tokens'}
                    options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]?.map((value) => ({ label: value, value: value }))}
                    value={topUpForm?.number_of_tokens} required={true}
                    onChange={(e) => setTopUpForm({ ...topUpForm, number_of_tokens: e.target.value })}
                />

                {topUpForm?.number_of_tokens && <div className="summery">
                    <div className="line">
                        <p>Single Token Rate</p>
                        <p>₹{normalizeMoney(topUpForm?.single_token_rate)}</p>
                    </div>
                    <div className="line">
                        <p>₹{normalizeMoney(topUpForm?.single_token_rate)} x {topUpForm?.number_of_tokens}</p>
                        <h4>₹{normalizeMoney(Number(topUpForm?.single_token_rate) * Number(topUpForm?.number_of_tokens))}</h4>
                    </div>
                </div>}

                {topUpForm?.number_of_tokens && <Button label={'Ready to Pay'} rounded style={{ width: '100%' }} onClick={readyToPay} />}
            </div>}
        </div>
    )

}

export default TokenTopUp