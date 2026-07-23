import React, { useMemo, useState } from 'react'
import './search-customer-by-key.scss'
import { useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { api } from '../../../../api';
import { TbGrid3X3, TbLetterCase, TbNumber123 } from 'react-icons/tb';
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';
import InputText from '../../../UI_Primitives/inputs/InputText';
import Select from '../../../UI_Primitives/inputs/Select';
import Button from '../../../UI_Primitives/buttons/Button';
import { useQuery } from '@tanstack/react-query';


const SearchCustomerByKey = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams()
    const [cityOptions, setCityOptions] = useState([])
    const [postOptions, setPostOptions] = useState([])
    const [form, setForm] = useState({
        key: searchParams.get('key'),
        key_type: searchParams.get('key_type'),
        city_id: searchParams.get('city_id'),
        post: searchParams.get('post')
    })
    const [keyType, setKeyType] = useState(searchParams.get('key_type') || 'id')


    const keyTypes = ['letter', 'number', 'id']

    const handleSubmit = (e) => {
        e.preventDefault();

        // validation
        if (!form.key && !form.city_id && !form.post) {
            return;
        }

        const newSearchParams = new URLSearchParams(searchParams)

        if (form?.key) {
            newSearchParams.set('key', form?.key)
            newSearchParams.set('key_type', keyType)
        } else {
            newSearchParams.delete('key')
            newSearchParams.delete('key_type')
        }

        if (form?.city_id) {
            newSearchParams.set('city_id', form?.city_id)
        } else {
            newSearchParams.delete('city_id')
        }

        if (form?.post) {
            newSearchParams.set('post', form?.post)
        } else {
            newSearchParams.delete('post')
        }

        navigate(`/controller/customers/search?${newSearchParams.toString()}`)

        dispatch(modal.pull.all())

    }

    const toggleKeyType = () => {
        const currentIndex = keyTypes.indexOf(keyType);
        const nextIndex = (currentIndex + 1) % keyTypes.length;
        setKeyType(keyTypes[nextIndex]);
        setForm({
            ...form,
            key: ''
        })
    };

    const handleChangeForm = e => {

        // choose cities 
        if (e.target.name === 'city_id') {
            setForm({ ...form, [e.target.name]: e.target.value, post: '' })
            const selectedCity = cityList?.find((c) => c.city_id === e.target.value)
            setPostOptions(selectedCity?.post_offices?.sort((a, b) => a.localeCompare(b))?.map((p) => ({ value: p, label: p })) || [])
            return;
        }

        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const {
        data: cityList = [],
        isLoading: cityLoading
    } = useQuery({
        queryKey: ['city_input_list'],
        queryFn: async () => {
            const res = await api.cnPv2Axios('/l/location/city?area_type=service')
            return res
        },
        staleTime: 30 * 60_000
    })

    useMemo(() => {
        if (cityList?.length) {
            setCityOptions(cityList?.map((a) => ({ label: a.city_name, value: a.city_id })))
            setPostOptions(cityList?.reduce((acc, city) => acc.concat(city.post_offices), [])?.sort((a, b) => a.localeCompare(b))?.map(p => ({ label: p, value: p })))
        }

    }, [cityList])



    // loading
    if (cityLoading) {
        return <div className="search-customer-by-key-comp-load" >
            <SkeletonGrid rows={4} columns={1} height={45} />
        </div>
    }

    return (
        <div className="search-customer-by-key-comp">
            <form action="" onSubmit={handleSubmit}>
                <div className="key-search-input">
                    <InputText label={`Enter ${keyType}`} name='key' type={keyType === 'letter' ? 'text' : 'number'} value={form.key} onChange={handleChangeForm}
                        className={keyType === 'id' ? 'key-upper-case' : ''} />
                    <div className={`key-type-icon`} onClick={toggleKeyType} title={keyType}>
                        {keyType === 'letter' ? <TbLetterCase />
                            : keyType === 'number' ? <TbNumber123 />
                                : keyType === 'id' ? <TbGrid3X3 /> : ''}

                    </div>
                </div>
                <Select label={'Cities'} name={'city_id'} options={[{ label: '', value: '' }, ...cityOptions]} onChange={handleChangeForm} value={form.city_id} />
                <Select label={'Post offices'} name={'post'} options={[{ label: '', value: '' }, ...postOptions]} onChange={handleChangeForm} value={form.post} />
                <Button label={'Search'} severity={'primary'} rounded disabled={!form.key && !form.city_id && !form.post} />
            </form>
        </div>
    )
}

export default SearchCustomerByKey 