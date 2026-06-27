import React, { useMemo, useState } from 'react'
import './service-filter.scss'
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom'
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice';
import Button from '../../../UI_Primitives/buttons/Button';
import ButtonGroup from '../../../UI_Primitives/buttons/ButtonGroup';
import InputText from '../../../UI_Primitives/inputs/InputText';
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../api';
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState';
import { TbInfoCircle } from 'react-icons/tb';
import Select from '../../../UI_Primitives/inputs/Select';
import { addDurationToDate, isoToYYYYMMDD } from '../../../../utils/helpers/date-helpers';

const ServiceFilter = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [form, setForm] = useState({
        customer_id: searchParams.get('customer_id') || '',
        city_id: searchParams.get('city_id') || '',
        post: searchParams.get('post')?.split(' ') || [],
        packages: searchParams.get('packages')?.split(' ') || [],
        from_date: searchParams.get('from_date') || '',
        to_date: searchParams.get('to_date') || ''
    })
    const [cityOptions, setCityOptions] = useState([])
    const [postOptions, setPostOptions] = useState([])
    const [packageOptions, setPackageOptions] = useState([])


    const {
        data,
        isLoading,
        error
    } = useQuery({
        queryKey: ['city_list_and_service_packages'],
        queryFn: async () => {
            const cities = await api.vfTv2Axios('/service/area')
            const packages = await api.vfTv2Axios('/package/list?product_type=VESSEL_FILTER&fields=package_id,package_name')

            return {
                cityList: cities,
                packageList: packages
            }
        },
        staleTime: 30 * 60_000
    })

    useMemo(() => {
        if (data?.cityList?.length) {
            setCityOptions(data?.cityList?.map((a) => ({ label: a.city_name, value: a.city_id })))
            setPostOptions(data?.cityList?.reduce((acc, city) => acc.concat(city.post_offices), [])?.sort((a, b) => a.localeCompare(b))?.map(p => ({ label: p, value: p })))
        }

        if (data?.packageList?.length) {
            setPackageOptions(data?.packageList?.map((a) => ({ label: a.package_name, value: a.package_id })))
        }

    }, [data])

    const handleChangeForm = e => {
        if (e.target.name === 'city_id' && e.target.value) {
            setForm({ ...form, [e.target.name]: e.target.value, post: [] })
            const selectedCity = data?.cityList?.find((c) => c.city_id === e.target.value)
            setPostOptions(selectedCity?.post_offices?.sort((a, b) => a.localeCompare(b))?.map((p) => ({ value: p, label: p })) || [])
            return;
        } else if (e.target.name === 'city_id' && !e.target.value) {
            setForm({ ...form, [e.target.name]: "", post: [] })
            setPostOptions(data?.cityList?.reduce((acc, city) => acc.concat(city.post_offices), [])?.sort((a, b) => a.localeCompare(b))?.map(p => ({ label: p, value: p })))
            return;
        }

        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleMultiInputChange = (e) => {
        setForm({ ...form, [e.name]: e.selectedValues?.map((c) => c.value) })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        let filterFlag = false

        let newSearchParams = new URLSearchParams(searchParams)

        if (form?.customer_id) {
            newSearchParams.set('customer_id', form?.customer_id)
            filterFlag = true
        } else {
            newSearchParams.delete('customer_id')
        }

        if (form?.city_id) {
            newSearchParams.set('city_id', form?.city_id)
            filterFlag = true
        } else {
            newSearchParams.delete('city_id')
        }

        if (form?.post.length > 0) {
            newSearchParams.set('post', form?.post?.join(' '))
            filterFlag = true
        } else {
            newSearchParams.delete('post')
        }

        if (form?.packages.length > 0) {
            newSearchParams.set('packages', form?.packages?.join(' '))
            filterFlag = true
        } else {
            newSearchParams.delete('packages')
        }

        if (form?.from_date && form?.to_date) {
            newSearchParams.set('from_date', form?.from_date)
            newSearchParams.set('to_date', form?.to_date)
            filterFlag = true
        } else {
            newSearchParams.delete('from_date')
            newSearchParams.delete('to_date')
        }

        if (filterFlag) {
            newSearchParams.set('fl', 'Yes')
            setSearchParams(newSearchParams)
            dispatch(modal.pull.all())
        }
    }

    const clearFilter = () => {
        let newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('customer_id')
        newSearchParams.delete('city_id')
        newSearchParams.delete('post')
        newSearchParams.delete('packages')
        newSearchParams.delete('from_date')
        newSearchParams.delete('to_date')
        newSearchParams.delete('fl')
        setSearchParams(newSearchParams)
        dispatch(modal.pull.all())
    }

    // loading
    if (isLoading) {
        return <div className="search-customer-by-key-comp-load" >
            <SkeletonGrid rows={6} columns={1} height={45} />
        </div>
    }

    // Error
    if (error) {
        return <ErrorState
            hight='300px'
            title={'Data fetching failed!'}
            message={error?.message}
            icon={<TbInfoCircle />}
        />
    }


    return (
        <div className="tech-service-filter-comp">
            <form action="" onSubmit={handleSubmit}>
                <InputText label={'Customer Id'} name={'customer_id'} value={form?.customer_id} onChange={handleChangeForm} />
                <Select label={'Cities'} name={'city_id'} options={[{ label: '', value: '' }, ...cityOptions]} onChange={handleChangeForm} value={form.city_id} />
                <MultiSelectInput label={'Post offices'} name={'post'} options={postOptions} onChange={handleMultiInputChange}
                    selected={postOptions?.filter((p) => form?.post?.includes(p.value)) || []} />
                <MultiSelectInput label={'Packages'} name={'packages'} options={packageOptions} onChange={handleMultiInputChange}
                    selected={packageOptions?.filter((p) => form?.packages?.includes(p.value)) || []} />
                <div className="date-range">
                    <InputText label={'From Date'} type='date' name={'from_date'} value={form?.from_date} onChange={handleChangeForm} max={form.to_date} />
                    <InputText label={'End Date'} type='date' name={'to_date'} value={form?.to_date} onChange={handleChangeForm} min={form.from_date}
                        max={isoToYYYYMMDD(addDurationToDate(new Date(), { days: 30 }))} />
                </div>
                <ButtonGroup style={{ dispatch: "grid", }} rounded>
                    <Button label={'Clear'} type={'button'} severity={'primary'} outlined style={{ width: '100%' }} disabled={searchParams.get('fl') !== 'Yes'}
                        onClick={clearFilter} />
                    <Button label={'Apply Filter'} severity={'primary'} style={{ width: '100%' }} />
                </ButtonGroup>
            </form>
        </div>
    )
}

export default ServiceFilter