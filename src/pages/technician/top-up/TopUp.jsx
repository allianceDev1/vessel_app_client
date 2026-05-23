import React, { useEffect } from 'react'
import TokenTopUp from '../../../components/forms/common/token-top-up/TokenTopUp'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useDispatch } from 'react-redux';
import { api } from '../../../api'

const TopUp = () => {
    const dispatch = useDispatch();


    const fetchCustomerProducts = async (customerId) => {
        return await api.vfTv2Axios.get(`/customer/${customerId}/top-up/products`)
    }

    const doTopUp = async (customerId, body) => {
        return await api.vfTv2Axios.post(`/customer/${customerId}/top-up`, body)
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Token Top-up', note: "Top up token base products services" }))
        // eslint-disable-next-line
    }, [])

    return (
        <div className="tech-token-top-up-page">
            <TokenTopUp fetchCustomerApi={fetchCustomerProducts} doTopUpApi={doTopUp} redirectUrl='/tech/more' />
        </div>
    )
}

export default TopUp