import React, { useEffect } from 'react'
import './service-category.scss'
import { useDispatch, useSelector } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { api } from '../../../api';
import { TbCarouselHorizontal, TbCheck, TbEdit, TbInfoCircle, TbPointFilled, TbX } from 'react-icons/tb';
import { serviceChargeSort, toStandardText } from '../../../utils/helpers/text-formatting';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import EmptyState from '../../../components/UI_Primitives/ui-states/EmptyState';
import Button from '../../../components/UI_Primitives/buttons/Button'
import UpdateServiceCategory from '../../../components/forms/controller/update-service-category/UpdateServiceCategory';
import { serviceCategoryListStretcher } from '../../../utils/services/package_service';
import { useQuery } from '@tanstack/react-query';

const ServiceCategory = () => {
    const dispatch = useDispatch();
   
    const { user } = useSelector((state) => state.user)


    const handelEditCategory = (item) => {
        dispatch(modal.push({
            title: 'Update Service Category',
            body: <UpdateServiceCategory serviceCategory={item} />,
            style: { width: '700px' }
        }))
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ['service_category_list', 'controller'],
        queryFn: async () => {
            const fields = 'service_name,service_charges,package_charge_applied,target_package,coverage,service_charge_applied,is_active,package_product_only'
            const res = await api.vfCv2Axios.get(`/config/service-categories/list?hidden=Yes&fields=${fields}`)
            return serviceCategoryListStretcher(res)
        },
        staleTime: 10_000
    })


    useEffect(() => {
        dispatch(page.setTitle({ title: 'Service Categories', note: "Manage and categorize services workflows." }))

        // eslint-disable-next-line
    }, [])

    // loading
    if (isLoading) {
        return <div className="service-category-page-load">
            <SkeletonGrid
                rows={1}
                columns={3}
                height={500}
                responsive={{
                    sm: { columns: 1, rows: 3 },
                    lg: { columns: 2, rows: 2 }
                }}
            />
        </div>
    }

    if (error) {
        return <ErrorState
            hight='80vh'
            title={'Data fetching failed!'}
            message={error?.message}
            icon={<TbCarouselHorizontal />}
        />
    }

    return (
        <div className="service-category-page-container">
            {!data?.length && <EmptyState
                hight='80vh' title={'No Categories'} description={'Category data not found.'} icon={<TbCarouselHorizontal />} />}
            {data?.length > 0 && <div className="items-container">
                {data?.map((item) => {
                    return (
                        <div className="item" key={item?.category_uuid}>
                            <div className="head">
                                <h3>{item?.service_name}</h3>
                                <div>
                                    <p>{item?.category_id}</p>
                                    <TbPointFilled />
                                    <p>Mode : {toStandardText(item?.mode)}</p>
                                </div>
                            </div>
                            <div className="list-section">
                                <div className="list-item">
                                    <div className={`part part-one`}>
                                        <p>Materials Charge & Access</p>
                                    </div>
                                    <div className={`part part-two`}>
                                        {item?.coverage?.MATERIAL?.access ? <p>{serviceChargeSort(item?.coverage?.MATERIAL?.price_type)}</p> : ''}
                                    </div>
                                    <div className={`part part-three ${item?.coverage?.MATERIAL?.access ? 'success' : 'danger'}`}>
                                        {item?.coverage?.MATERIAL?.access ? <TbCheck /> : <TbX />}
                                    </div>
                                </div>
                                <div className="list-item">
                                    <div className={`part part-one`}>
                                        <p>Bag Charge & Access</p>
                                    </div>
                                    <div className={`part part-two`}>
                                        {item?.coverage?.MATERIALS_BAG?.access ? <p>{serviceChargeSort(item?.coverage?.MATERIALS_BAG?.price_type)}</p> : ''}
                                    </div>
                                    <div className={`part part-three ${item?.coverage?.MATERIALS_BAG?.access ? 'success' : 'danger'}`}>
                                        {item?.coverage?.MATERIALS_BAG?.access ? <TbCheck /> : <TbX />}
                                    </div>
                                </div>
                                <div className="list-item">
                                    <div className={`part part-one`}>
                                        <p>Spare Charge & Access</p>
                                    </div>
                                    <div className={`part part-two`}>
                                        {item?.coverage?.PRIMARY_SPARES?.access ? <p>{serviceChargeSort(item?.coverage?.PRIMARY_SPARES?.price_type)}</p> : ''}
                                    </div>
                                    <div className={`part part-three ${item?.coverage?.PRIMARY_SPARES?.access ? 'success' : 'danger'}`}>
                                        {item?.coverage?.PRIMARY_SPARES?.access ? <TbCheck /> : <TbX />}
                                    </div>
                                </div>
                                <div className="list-item">
                                    <div className={`part part-one`}>
                                        <p>Service Work & Access</p>
                                    </div>
                                    <div className={`part part-two`}>
                                        {item?.coverage?.SERVICE_WORK?.access ? <p>{serviceChargeSort(item?.coverage?.SERVICE_WORK?.price_type)}</p> : ''}
                                    </div>
                                    <div className={`part part-three ${item?.coverage?.SERVICE_WORK?.access ? 'success' : 'danger'}`}>
                                        {item?.coverage?.SERVICE_WORK?.access ? <TbCheck /> : <TbX />}
                                    </div>
                                </div>
                                <div className="list-item">
                                    <div className={`part part-one`}>
                                        <p>Package Fund</p>
                                    </div>
                                    <div className={`part part-two`}>
                                        {item?.package_charge_applied ? <p>{item?.target_package}*</p> : ''}
                                    </div>
                                    <div className={`part part-three ${item?.package_charge_applied ? 'success' : 'danger'}`}>
                                        {item?.package_charge_applied ? <TbCheck /> : <TbX />}
                                    </div>
                                </div>
                                <div className="list-item">
                                    <div className={`part part-one`}>
                                        <p>Service Charge</p>
                                    </div>
                                    <div className={`part part-two`}></div>
                                    <div className={`part part-three ${item?.service_charge_applied ? 'success' : 'danger'}`}>
                                        {item?.service_charge_applied ? <TbCheck /> : <TbX />}
                                    </div>
                                </div>
                            </div>
                            {item?.service_charges?.length && <div className="list-section">
                                <h4 className='section-title'>Service Charges</h4>
                                {item?.service_charges?.map((charge, index) => {
                                    return (
                                        <div className="list-item" key={index}>
                                            <div className={`part part-one`}>
                                                <p>Charge {index + 1}</p>
                                            </div>
                                            <div className={`part part-two`}>
                                                <p>₹ {charge?.charge_amount}</p>
                                            </div>
                                            <div className={`part part-three`}>
                                                <p>{charge?.call_count} Call</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>}
                            {item?.package_product_only && <div className='info-note'> <TbInfoCircle /> This category only for packages.</div>}
                            {user?.allowed_origins?.includes('vessel_c_admin') && <div className="buttons">
                                <Button icon={<TbEdit />} rounded outlined size='small' onClick={() => handelEditCategory(item)} />
                            </div>}
                        </div>)
                })}
            </div>}

            <p className='info-text'>
                PC (Purchase Cost): The customer pays nothing. The company covers the product’s purchase cost. <br></br>
                P2 (Package Price): A predefined package base rate is applied. Both the customer and the company follow the configured package price. <br></br>
                SR (Selling Rate): The actual selling price of the product. Both the customer and the company use the same rate. <br></br> <br></br>
                * This is package id not package name.<br></br>
            </p>
        </div>
    )
}

export default ServiceCategory