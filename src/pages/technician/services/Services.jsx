import React, { useEffect, useMemo, useState } from 'react'
import './services.scss';
import { useDispatch } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { TbArrowDown, TbArrowsDownUp, TbCategory2, TbFilter, TbRefresh } from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../api';
import { extractCustomerFieldsInServiceCard } from '../../../utils/services/customer_services';
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown'
import UpcomingServiceCard from '../../../components/modules/tech/service-card/UpcomingServiceCard';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import ServiceFilter from '../../../components/forms/tech/tech-services/ServiceFilter';
import ServiceSort from '../../../components/forms/tech/tech-services/ServiceSort';
import { isoToYYYYMMDD } from '../../../utils/helpers/date-helpers';


const Services = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState('fetch')
    const [error, setError] = useState({ error: false, title: null, message: null })
    const [data, setData] = useState({ complaints: [], services: [], renewals: [], overdue: [] })
    const [filterOptions, setFilterOptions] = useState({})


    const tabData = useMemo(() => {
        const valid = searchParams.get("tab") || 'Complaints';
        return data[valid.toLowerCase()] || [];
        // eslint-disable-next-line
    }, [data, searchParams.get("tab")]);

    const finalData = useMemo(() => {
        let result = [...tabData];

        // apply filters
        if (searchParams.get('fl') === 'Yes') {
            if (searchParams.get('customer_id') || null) {
                result = result.filter(item => item.customer?.[0] === searchParams.get('customer_id'));
            }

            if ((searchParams.get('city_id')?.split(' ') || []).length > 0) {
                result = result.filter(item => (searchParams.get('city_id')?.split(' ') || [])?.includes(item.address?.[4]));
            }

            if ((searchParams.get('post')?.split(' ') || []).length > 0) {
                result = result.filter(item => (searchParams.get('post')?.split(' ') || [])?.includes(item.address?.[2]));
            }

            if ((searchParams.get('packages')?.split(' ') || []).length > 0) {
                result = result.filter(item => (searchParams.get('packages')?.split(' ') || [])?.some(i => item.product_packages?.includes(i)));
            }

            if (searchParams.get('from_date')) {
                result = result.filter(i => !isNaN(new Date(i.registration?.[2] || i.service_date)) &&
                    new Date(i.registration?.[2] || i.service_date) >= new Date(searchParams.get('from_date')))
            }

            if (searchParams.get('to_date')) {
                result = result.filter(i => !isNaN(new Date(i.registration?.[2] || i.service_date)) &&
                    new Date(i.registration?.[2] || i.service_date) <= new Date(searchParams.get('to_date')))
            }
        }

        // apply sorting
        if (searchParams.get('sr') === 'Yes') {
            result = result.sort((a, b) => {
                const field = searchParams.get('field');
                const order = searchParams.get('order') === "asc" ? 1 : -1;

                if (field === 'customer_id') {
                    return order * a.customer[0].localeCompare(b.customer[0]);
                }
                if (field === 'city') {
                    return order * a.address[3].localeCompare(b.address[3]);
                }
                if (field === 'post') {
                    return order * a.address[2].localeCompare(b.address[2]); // Added return here
                }
                if (field === 'date') {
                    const dateA = isoToYYYYMMDD(new Date(a.registration?.[2] || a.service_date));
                    const dateB = isoToYYYYMMDD(new Date(b.registration?.[2] || b.service_date));
                    return order * dateA.localeCompare(dateB);
                }

                return 0; // Default return when no field matches
            });
        }

        return result;

        // eslint-disable-next-line
    }, [tabData, searchParams.get('customer_id'), searchParams.get('city_id'), searchParams.get('post'), searchParams.get('packages'), searchParams.get('from_date'), searchParams.get('to_date'), searchParams.get('field'), searchParams.get('order')]);


    const handleChangeTab = (value) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('tab', value)
        setSearchParams(newSearchParams)
    }

    const handleOpenFilter = () => {
        dispatch(modal.push({
            title: 'Filter Services',
            body: <ServiceFilter filterFields={filterOptions} />
        }))
    }

    const handleOpenSort = () => {
        dispatch(modal.push({
            title: 'Sort Services',
            body: <ServiceSort filterFields={filterOptions} />
        }))
    }


    const subPageOptions = [
        {
            items: [
                { label: 'Complaints', value: 'Complaints', onClick: () => handleChangeTab('Complaints') },
                { label: 'Services', value: 'Services', onClick: () => handleChangeTab('Services') },
                { label: 'Renewals', value: 'Renewals', onClick: () => handleChangeTab('Renewals') },
                { label: 'Overdue', value: 'Overdue', onClick: () => handleChangeTab('Overdue'), }
            ]
        }
    ]

    const fetchApi = async () => {
        try {
            setLoading('fetch')
            setError({ error: false, title: null, message: null })
            const { complaints, services, renewals, overdue } = await api.vfTv2Axios.get('/service/upcoming-services')


            setData({ complaints, services, renewals, overdue })
            setFilterOptions(extractCustomerFieldsInServiceCard([...(complaints || []), ...(services || []), ...(renewals || []), ...(overdue || [])]))

        } catch (error) {
            setError({ error: true, title: 'Data fetching failed', message: error.message })
        } finally {
            setLoading('')
        }
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Upcoming services', note: "Complaints, services, renewal and Overdue" }))

        // fetch data
        fetchApi()

        // eslint-disable-next-line
    }, [])



    // loading
    if (loading === 'fetch') {
        return <div className="tech-service-page-load">
            <SkeletonGrid rows={1} columns={1} height={50} />
            <SkeletonGrid rows={5} columns={1} height={110} style={{ marginTop: '15px' }} />
        </div>
    }

    // Error
    if (error?.error) {
        return <ErrorState
            hight='70vh'
            title={error?.title}
            message={error?.message}
            icon={<TbCategory2 />}
        />
    }

    // Data
    return (
        <div className="tech-service-page">
            <div className="top-section">
                <div className="section-one">
                    <Dropdown
                        button={{
                            label: `${searchParams.get('tab') || 'Complaints'} ${finalData.length ? '| ' + finalData.length : ""}`,
                            icon: <TbArrowDown />,
                            iconPos: 'right',
                            rounded: true, text: true, size: 'small',
                        }}
                        list={subPageOptions}
                        selected={searchParams.get('tab') || 'Complaints'}
                    />
                </div>
                <div className="section-two">
                    <span onClick={fetchApi}>
                        <TbRefresh />
                    </span>
                    <span className={searchParams.get('sr') === 'Yes' ? 'active' : ''} onClick={handleOpenSort}>
                        <TbArrowsDownUp />
                    </span>
                    <span className={searchParams.get('fl') === 'Yes' ? 'active' : ''} onClick={handleOpenFilter}>
                        <TbFilter />
                    </span>
                </div>
            </div>
            <div className="service-card-container">
                {!finalData?.length ?
                    <ErrorState
                        hight='60vh'
                        title='No data found'
                        icon={<TbCategory2 />}
                    /> : <>
                        {finalData?.map((card) => <UpcomingServiceCard data={card} key={card.customer[0]} />)}
                    </>}
            </div>
        </div>
    )
}

export default Services 