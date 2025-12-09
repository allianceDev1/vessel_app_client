import React, { useEffect, useState } from 'react'
import './search-customer-by-key.scss'
import { useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { modal, toast } from '../../../redux/features/non_persisted/miniSystemSlice';
import { api } from '../../../api';
import { TbGrid3X3, TbLetterCase, TbNumber123 } from 'react-icons/tb';
import SkeletonGrid from '../../UI_Primitives/skeleton/SkeletonGrid';
import InputText from '../../UI_Primitives/inputs/InputText';
import Select from '../../UI_Primitives/inputs/Select';
import Button from '../../UI_Primitives/buttons/Button';


const SearchCustomerByKey = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = useState('')
    const [cityList, setCityList] = useState([])
    const [cityOptions, setCityOptions] = useState([])
    const [postOptions, setPostOptions] = useState([])
    const [form, setForm] = useState({
        key: searchParams.get('key'),
        key_type: searchParams.get('key_type'),
        city_id: searchParams.get('city_id'),
        post: searchParams.get('post')
    })
    const [keyType, setKeyType] = useState(searchParams.get('key_type') || 'letter')


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

        if (form.key) return;

        const currentIndex = keyTypes.indexOf(keyType);
        const nextIndex = (currentIndex + 1) % keyTypes.length;
        setKeyType(keyTypes[nextIndex]);
    };

    const handleChangeForm = e => {

        // enter the key type id 
        if (e.target.name === 'key' && keyType === 'id') {
            setForm({ ...form, [e.target.name]: (e.target.value).toUpperCase() })
            return;
        }

        // choose cities 
        if (e.target.name === 'city_id') {
            setForm({ ...form, [e.target.name]: e.target.value, post: '' })
            const selectedCity = cityList?.find((c) => c.city_id === e.target.value)
            setPostOptions(selectedCity?.post_offices?.sort((a, b) => a.localeCompare(b))?.map((p) => ({ value: p, label: p })) || [])
            return;
        }

        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const fetchApi = async () => {
        try {
            setLoading('fetch')

            const areas = await api.cnPv2Axios.get('/l/location/city?area_type=service')
            setCityList(areas?.map((a) => ({ city_id: a.city_id, city_name: a.city_name, post_offices: a.post_offices })))
            setCityOptions(areas?.map((a) => ({ label: a.city_name, value: a.city_id })))
            setPostOptions(areas.reduce((acc, city) => acc.concat(city.post_offices), [])?.sort((a, b) => a.localeCompare(b))?.map(p => ({ label: p, value: p })))

        } catch (error) {
            dispatch(modal.pull.all())
            dispatch(toast.push({
                type: 'danger',
                head: 'City fetch failed',
                message: "Try again later"
            }))
        } finally {
            setLoading('')
        }
    }

    useEffect(() => {
        fetchApi()
    }, [])

    // loading
    if (loading === 'fetch') {
        return <div className="search-customer-by-key-comp-load" >
            <SkeletonGrid rows={4} columns={1} height={45} />
        </div>
    }

    return (
        <div className="search-customer-by-key-comp">
            <form action="" onSubmit={handleSubmit}>
                <div className="key-search-input">
                    <InputText label={`Enter ${keyType}`} name='key' type={keyType === 'number' ? 'number' : 'text'} value={form.key} onChange={handleChangeForm}
                        className={keyType === 'id' ? 'key-upper-case' : ''} />
                    <div className={`key-type-icon ${form?.key && 'key-type-disable'}`} onClick={toggleKeyType} title={keyType}>
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