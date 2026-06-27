import React, { useEffect } from 'react'
import './service-area-list.scss'
import { useDispatch } from 'react-redux';
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import { TbMap } from 'react-icons/tb';
import { api } from '../../../api';
import EmptyState from '../../../components/UI_Primitives/ui-states/EmptyState';
import { isoToDDMonYYYY } from '../../../utils/helpers/date-helpers';
import { useQuery } from '@tanstack/react-query';

const ServiceAreaList = () => {
    const dispatch = useDispatch();
  

    const { isLoading, data, error } = useQuery({
        queryKey: ['tech_branch_area_access_list'],
        queryFn: async () => {

            const cityResponse = await api.vfTv2Axios.get('/service/area')
            return cityResponse
        },
        staleTime: 60_000 
    })
   

    const openCity = (city) => {
        dispatch(modal.push({
            title: city?.city_name,
            body: <CityView data={city} />
        }))
    }

    useEffect(() => {
        dispatch(page.setTitle({ title: 'Service Area', note: "Service activated area for you." }))
       
        // eslint-disable-next-line
    }, [])


    // loading
    if (isLoading) {
        return <div className="tech-service-page-load">
            <SkeletonGrid rows={10} columns={1} height={60} />
        </div>
    }

    // Error
    if (error) {
        return <ErrorState
            hight='70vh'
            title={'City fetch failed !'}
            message={error?.message}
            icon={<TbMap />}
        />
    }

    // Success
    return (
        <div className="tech-service-area-list-container">
            {!data?.length ? <div>
                <EmptyState size='sm' hight='70vh' title={"No Service Area Found"} description={"The service area not assign for you"} icon={<TbMap />} />
            </div> : data?.map((city, index) => {
                return <div className='list-item' key={city?.city_id} onClick={() => openCity(city)}>
                    <p className="city-name">{index + 1}. {city?.city_name}</p>
                    <p className="city-date">{isoToDDMonYYYY(city?.from_date)} to {isoToDDMonYYYY(city?.to_date)}</p>
                </div>
            })}
        </div>
    )
}

export default ServiceAreaList




const CityView = ({ data }) => {
    return (
        <div className="tech-city-view-container">
            {/* Post Offices */}
            <div className="list-border">
                <h4>Post Offices</h4>
                <div className="list">
                    <ol>
                        {data?.post_offices?.map((po) => <li key={po}>{po}</li>)}
                    </ol>
                </div>
            </div>

            {/* Pin */}
            <div className="list-border">
                <h4>Pin codes</h4>
                <div className="list">
                    <ol>
                        {data?.pin_codes?.map((pin) => <li key={pin}>{pin}</li>)}
                    </ol>
                </div>
            </div>
        </div>
    )
}