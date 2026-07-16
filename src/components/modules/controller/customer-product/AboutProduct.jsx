import React from 'react'
import '../customer-view/about-customer.scss'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../../../api'
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState'
import { TbAlignLeft, TbArrowUpRight, TbCalendarCheck, TbDropletStar, TbFlagShare, TbLink, TbLinkOff, TbPencil, } from 'react-icons/tb'
import Badge from '../../../UI_Primitives/badge/Badge'
import Button from '../../../UI_Primitives/buttons/Button'
import Dropdown from '../../../UI_Primitives/dropdown/Dropdown'
import { toStandardText } from '../../../../utils/helpers/text-formatting'
import { isoToDDMonYYYY } from '../../../../utils/helpers/date-helpers'
import { getContrastText } from '../../../../utils/helpers/color-utils'
import { IoIosArrowDown } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice'
import ChangeProductStatus from '../../../forms/controller/product/ChangeProductStatus'
import UpdateProduct from '../../../forms/controller/product/UpdateProduct'
import EditNote from '../../../forms/controller/product/EditNote'
import UpdateServiceDate from '../../../forms/controller/product/UpdateServiceDate'
import TransferOwnership from '../../../forms/controller/product/TransferOwnership'

const AboutProduct = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { product_id } = useParams();
    const { user } = useSelector((state) => state.user)



    const { data, isLoading, error } = useQuery({
        queryKey: ['controller_customer_product_info', product_id],
        queryFn: async () => {
            const data = await api.vfCv2Axios(`/product/${product_id}/about`)
            return data;
        },
        staleTime: 60_000
    })

    const dropdownOptions = [
        {
            items: [
                { label: 'Change Service Date', icon: <TbCalendarCheck />, onClick: () => openUpdateServiceDateModel() },
                { label: 'Edit Note', icon: <TbAlignLeft />, onClick: () => openUpdateNoteModel() },
            ]
        }
    ]

    if (user?.allowed_origins?.includes('vessel_c_admin')) {
        dropdownOptions[0].items.push(
            { type: "divider" },
            ...(data?.product_active ? [{ label: 'Disconnect', theme: 'danger', icon: <TbLinkOff />, onClick: () => openStatusChangeModel('DISCONNECT') }] : []),
            { label: 'Transfer', theme: 'danger', icon: <TbFlagShare />, onClick: () => openTransferOwnerShip() }
        )

    }

    const openTransferOwnerShip = (status) => {
        dispatch(modal.push({
            title: 'Transfer Ownership',
            body: <TransferOwnership productId={product_id} customerId={data?.customer_id} />
        }))
    }

    const openStatusChangeModel = (status) => {
        dispatch(modal.push({
            title: status === 'DISCONNECT' ? 'Disconnect the Product' : 'Reconnect the Product',
            body: <ChangeProductStatus status={status} productId={product_id} customerId={data?.customer_id} />
        }))
    }

    const openUpdateProductModel = () => {
        dispatch(modal.push({
            title: 'Update Product Details',
            body: <UpdateProduct data={data} productId={product_id} customerId={data?.customer_id} />
        }))
    }

    const openUpdateNoteModel = () => {
        dispatch(modal.push({
            title: 'Edit Note',
            body: <EditNote note={data?.note} productId={product_id} customerId={data?.customer_id} />
        }))
    }

    const openUpdateServiceDateModel = () => {
        dispatch(modal.push({
            title: 'Change Service Date',
            body: <UpdateServiceDate data={data} productId={product_id} customerId={data?.customer_id} />
        }))
    }


    if (isLoading) {
        return <div>
            <SkeletonGrid rows={4} columns={3} height={'60px'} gap={'10px'} responsive={{
                md: { rows: 6, columns: 2 },
                sm: { rows: 8, columns: 1 },
            }} />
            <SkeletonGrid rows={3} columns={3} height={'60px'} gap={'10px'} style={{ marginTop: '30px' }} responsive={{
                md: { rows: 4, columns: 2 },
                sm: { rows: 5, columns: 1 },
            }} />
        </div>
    }

    if (error) {
        return <div>
            <ErrorState
                icon={<TbDropletStar />}
                title={'Data fetching Failed'}
                message={error?.message}
                hight='400px'
            />
        </div>
    }

    return (
        <div className="controller-about-customer-container">
            {user?.allowed_origins?.some(a => ['vessel_c_writer', 'vessel_c_admin'].includes(a)) &&
                <div className="menu-buttons">
                    {user?.allowed_origins?.includes('vessel_c_admin') && <>
                        {!data?.product_active &&
                            <Button icon={<TbLink />} label={'Reconnect'} size='small' severity={'success'} rounded style={{ width: '120px' }}
                                onClick={() => openStatusChangeModel('CONNECT')} />}
                    </>}
                    <Button icon={<TbPencil />} label={'Update'} size='small' outlined rounded style={{ width: '120px' }}
                        onClick={() => openUpdateProductModel()} />
                    <Dropdown
                        button={{
                            icon: <IoIosArrowDown />,
                            label: 'Action',
                            size: "small",
                            rounded: true,
                            outlined: true,
                            style: { width: '100px' }
                        }}
                        list={dropdownOptions}
                    />
                </div>}
            <div className="reg-content">
                <div className="list">
                    <div className="item action-button" onClick={() => navigate(`/controller/customer/${data?.customer_id}/about`)}>
                        <p className='label'>Customer ID & Name</p>
                        <div>
                            <p className='text-value'>{data?.customer_name} ({data?.customer_id})</p>
                        </div>
                        <div className="right-icon">
                            <TbArrowUpRight />
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Product Id & Status</p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <p className='text-value'>{data?.product_id} </p>
                            {data?.product_active
                                ? <Badge value={'Connected'} severity={'success'} />
                                : <Badge value={'Disconnected'} severity={'danger'} />}

                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Product Name & Order Id</p>
                        <div>
                            <p className='text-value'>{data?.product_name} {data?.order_id ? `(${data?.order_id})` : ''} </p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Product Type & Origin</p>
                        <div>
                            <p className='text-value'>{toStandardText(data?.product_type)} - {toStandardText(data?.origin_category)}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>SKU</p>
                        <div>
                            <p className='text-value'>{data?.sku}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Installation Mode</p>
                        <div>
                            <p className='text-value'>{data?.installation_mode}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Product Warranty</p>
                        <div >
                            {data?.warranty?.has_warranty
                                ? <p className='text-value'>{isoToDDMonYYYY(data?.warranty?.start_date)} to {isoToDDMonYYYY(data?.warranty?.expire_date)} </p>
                                : <p className='text-value'>No Warranty</p>}
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Note</p>
                        <div>
                            <p className='text-value'>{data?.note || "Nil"}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Blocked Packages</p>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {data?.blocked_packages?.map(p => (
                                <Badge key={p?.package_id} value={p?.package_name}
                                    style={{ backgroundColor: p?.color_code, color: getContrastText(p?.color_code) }} />
                            ))}
                            {data?.blocked_packages?.length === 0 && <p className='text-value'>Nil</p>}
                        </div>
                    </div>
                </div>
            </div>
            <h3 className='sub-title' style={{ marginTop: "25px" }}>Installation</h3>
            <div className="reg-content">
                <div className="list">
                    <div className="item">
                        <p className='label'>Installation Date</p>
                        <div>
                            <p className='text-value'>{data?.installation?.installation_date ? isoToDDMonYYYY(data?.installation?.installation_date) : "Nil"}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Installation Srl No</p>
                        <div>
                            <p className='text-value'>{data?.installation?.installation_srl_no || 'Nil'}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Enquiry Srl No</p>
                        <div>
                            <p className='text-value'>{data?.installation?.enquiry_srl_no || 'Nil'}</p>
                        </div>
                    </div>
                </div>
            </div>
            <h3 className='sub-title' style={{ marginTop: "25px" }}>Service & Rent</h3>
            <div className="reg-content">
                <div className="list">
                    <div className="item">
                        <p className='label'>Subscription</p>
                        <div>
                            {data?.package?.package_id
                                ? <Badge value={data?.package?.package_name}
                                    style={{ backgroundColor: data?.package?.color_code, color: getContrastText(data?.package?.color_code) }} />
                                : <p className='text-value'>No Package</p>}
                        </div>
                    </div>
                    {data?.package?.package_id && <div className="item">
                        <p className='label'>Package Duration</p>
                        <div>
                            <p className='text-value'>{isoToDDMonYYYY(data?.package?.start_date)} to {isoToDDMonYYYY(data?.package?.expire_date)} </p>
                        </div>
                    </div>}
                    <div className="item">
                        <p className='label'>Next Service Date</p>
                        <div>
                            <p className='text-value'>{data?.service?.next_service_date ? isoToDDMonYYYY(data?.service?.next_service_date) : "Nil"}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Last Visit Date</p>
                        <div>
                            <p className='text-value'>{data?.service?.last_service_date ? isoToDDMonYYYY(data?.service?.last_service_date) : "Nil"}</p>
                        </div>
                    </div>
                    <div className="item">
                        <p className='label'>Rent Duration</p>
                        <div >
                            {data?.rental?.has_rental
                                ? <p className='text-value'>{isoToDDMonYYYY(data?.rental?.rent_start_date)} to {isoToDDMonYYYY(data?.rental?.rent_end_date)} </p>
                                : <p className='text-value'>Not rental</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AboutProduct