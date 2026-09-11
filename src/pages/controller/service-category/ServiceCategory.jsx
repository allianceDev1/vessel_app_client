import { useEffect } from 'react'
import './service-category.scss'
import { useDispatch, useSelector } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { api } from '../../../api';
import { TbCarouselHorizontal, TbCheck, TbChevronDown, TbInfoCircle, TbPlus, TbPointFilled, TbX } from 'react-icons/tb';
import { toStandardText } from '../../../utils/helpers/text-formatting';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import EmptyState from '../../../components/UI_Primitives/ui-states/EmptyState';
import Button from '../../../components/UI_Primitives/buttons/Button'
import CreateUpdateServiceCategory from '../../../components/forms/controller/service-category/CreateUpdateServiceCategory';
import { useQuery } from '@tanstack/react-query';
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { parent_product_types } from '../../../config/app_config';



const ServiceCategory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useSelector((state) => state.user)

    const { data, isLoading, error } = useQuery({
        queryKey: ['cn', 'service_category_list', (searchParams.get('parent_product') || parent_product_types[0])],
        queryFn: async () => {
            const fields = 'service_name,is_active,package_product_only'
            const productType = (searchParams.get('parent_product') || parent_product_types[0])
            const res = await api.vfCv2Axios.get(`/config/service-categories/list?product_type=${productType}&hidden=Yes&fields=${fields}`)
            return res
        },
        staleTime: 10_000
    })

    const openCreateModal = (item) => {
        dispatch(modal.push({
            title: 'Create service category',
            body: <CreateUpdateServiceCategory action={'CREATE'} serviceCategory={item} />,
            style: { width: '700px' }
        }))
    }

    const handleChangeParentProduct = (type) => {
        setSearchParams({ parent_product: type })
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Service Categories', note: "Manage and categorize services workflows." }))

        // eslint-disable-next-line
    }, [])

    // loading
    if (isLoading) {
        return <div className="service-category-page-load">
            <SkeletonGrid
                rows={3}
                columns={3}
                height={150}
                responsive={{
                    sm: { columns: 1, rows: 3 },
                    sm: { columns: 2, rows: 3 },
                    lg: { columns: 3, rows: 3 }
                }}
            />
        </div>
    }

    if (error) {
        return <ErrorState
            hight='70vh'
            title={'Data fetching failed!'}
            message={error?.message}
            icon={<TbCarouselHorizontal />}
        />
    }

    return (
        <div className="service-category-page-container">
            <div className="action-section">
                <Dropdown
                    button={{
                        label: toStandardText(searchParams.get('parent_product') || parent_product_types[0]),
                        icon: < TbChevronDown />, iconPos: 'right', severity: 'secondary',
                        rounded: true, outlined: true, size: 'small', style: { width: '150px' }
                    }}
                    list={[{
                        items: parent_product_types?.map((t) => ({
                            label: toStandardText(t),
                            value: t,
                            onClick: () => handleChangeParentProduct(t)
                        }))
                    }]}
                    selected={searchParams.get('parent_product') || parent_product_types[0]} />

                <Button label={'Category'} icon={<TbPlus />} severity={'primary'} size='small' rounded style={{ width: '130px' }}
                    onClick={openCreateModal}
                />
            </div>


            {!data?.length && <EmptyState
                hight='70vh' title={'No Categories'} description={'Category data not found.'} icon={<TbCarouselHorizontal />} />}
            {data?.length > 0 && <div className="items-container">
                {data?.map((item) => {
                    return (
                        <div className="item" key={item?.category_uuid} onClick={() => navigate(`/controller/app-config/service-categories/${item?.category_id}`)}>
                            <div className="head">
                                <h3>{item?.service_name}</h3>
                                <div>
                                    <p>{item?.category_id}</p>
                                    <TbPointFilled />
                                    <p>Mode : {toStandardText(item?.mode)}</p>
                                </div>
                            </div>
                            {item?.package_product_only && <div className='info-note'> <TbInfoCircle /> This category only for packages.</div>}
                            <div className={`status-fold ${item.is_active ? 'active' : 'inactive'}`}>
                                {item.is_active ? <TbCheck /> : <TbX />}
                                <p>{item.is_active ? 'Active' : 'Inactive'}</p>
                            </div>
                        </div>)
                })}
            </div>}
        </div>
    )
}

export default ServiceCategory