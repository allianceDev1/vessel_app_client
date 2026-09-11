import { useState } from 'react'
import './style.scss'
import { useDispatch } from 'react-redux'
import { price_unit_objects } from '../../../../assets/javascript/pre_data/units';
import { TbMoodAnnoyed } from 'react-icons/tb';
import { toast, modal } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { api } from '../../../../api'
import InputText from '../../../UI_Primitives/inputs/InputText';
import Select from '../../../UI_Primitives/inputs/Select';
import Radio from '../../../UI_Primitives/inputs/Radio';
import Button from '../../../UI_Primitives/buttons/Button';
import ErrorState from '../../../UI_Primitives/ui-states/ErrorState';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import SkeletonGrid from '../../../UI_Primitives/skeleton/SkeletonGrid';
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect';



const CreatePackageService = ({ productType, packageId }) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient()
    const [loading, setLoading] = useState('')
    const [form, setForm] = useState({});



    const { data, isLoading, error } = useQuery({
        queryKey: ['cn', 'create_package_service', productType, 'resources'],
        queryFn: async () => {
            const fields = 'service_name,mode,coverage,service_charge_applied,eligibility_rules'
            const categoryRes = await api.vfCv2Axios.get(`/config/service-categories/list?product_type=${productType}&fields=${fields}`)
            const rulesRes = await api.vfCv2Axios.get(`/config/eligibility-rules`)

            return {
                categories: categoryRes,
                eligibility_rules: rulesRes?.filter(i => i.enabled)
            }
        },
        staleTime: 60_000
    })


    const handleChangeServiceCategory = (e) => {

        const selectedCategory = data?.categories?.find(c => c?.category_id === e.target.value)

        const currentSpareParts = selectedCategory?.coverage?.find(i => i?.coverage_id === 'SPARE_PARTS' && i?.position === 'CURRENT')
        const currentServiceWork = selectedCategory?.coverage?.find(i => i?.coverage_id === 'SERVICE_WORK' && i?.position === 'CURRENT')
        const targetSpareParts = selectedCategory?.coverage?.find(i => i?.coverage_id === 'SPARE_PARTS' && i?.position === 'TARGET')
        const targetServiceWork = selectedCategory?.coverage?.find(i => i?.coverage_id === 'SERVICE_WORK' && i?.position === 'TARGET')

        let preData = {
            [e.target.name]: e.target.value,
            mode: selectedCategory?.mode,
            eligibility_rules: selectedCategory?.eligibility_rules || [],
            current_spare_parts_access: currentSpareParts?.access || false,
            current_spare_parts_price_type: currentSpareParts?.price_type || null,
            current_service_work_access: currentServiceWork?.access || false,
            current_service_work_price_type: currentServiceWork?.price_type || null,
            service_charge_applied: selectedCategory?.service_charge_applied || false,
        }

        if (selectedCategory?.mode === 'RENEWAL') {
            preData = {
                ...preData,
                target_spare_parts_access: targetSpareParts?.access || false,
                target_spare_parts_price_type: targetSpareParts?.price_type || null,
                target_service_work_access: targetServiceWork?.access || false,
                target_service_work_price_type: targetServiceWork?.price_type || null,
            }
        }

        setForm(preData)

    }

    const handleChangeForm = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleMultiInputChange = (e) => {

        setForm({
            ...form,
            [e.name]: e.selectedValues?.map((c) => c.value) || []
        })
    }

    const handleChangePositionValue = (e) => {
        const value = e.target.value || null;

        if (value) {
            switch (e.target.name) {
                case 'current_spare_parts_price_type':
                    setForm({ ...form, current_spare_parts_access: true, current_spare_parts_price_type: e.target.value })
                    break;
                case 'current_service_work_price_type':
                    setForm({ ...form, current_service_work_access: true, current_service_work_price_type: e.target.value })
                    break;
                case 'target_spare_parts_price_type':
                    setForm({ ...form, target_spare_parts_access: true, target_spare_parts_price_type: e.target.value })
                    break;
                case 'target_service_work_price_type':
                    setForm({ ...form, target_service_work_access: true, target_service_work_price_type: e.target.value })
                    break;

                default:
                    break;
            }
        } else {
            switch (e.target.name) {
                case 'current_spare_parts_price_type':
                    setForm({ ...form, current_spare_parts_access: false, current_spare_parts_price_type: null })
                    break;
                case 'current_service_work_price_type':
                    setForm({ ...form, current_service_work_access: false, current_service_work_price_type: null })
                    break;
                case 'target_spare_parts_price_type':
                    setForm({ ...form, target_spare_parts_access: false, target_spare_parts_price_type: null })
                    break;
                case 'target_service_work_price_type':
                    setForm({ ...form, target_service_work_access: false, target_service_work_price_type: null })
                    break;

                default:
                    break;
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Update
        setLoading('submit')
        try {

            const body = {
                category_id: form?.service_category,
                coverage: [
                    {
                        coverage_id: "SPARE_PARTS",
                        position: "CURRENT",
                        access: form?.current_spare_parts_access || false,
                        price_type: form?.current_spare_parts_price_type || null
                    },
                    {
                        coverage_id: "SERVICE_WORK",
                        position: "CURRENT",
                        access: form?.current_service_work_access || false,
                        price_type: form?.current_service_work_price_type || null
                    }
                ],
                service_limit: form?.service_limit || 0,
                service_charge_applied: form?.service_charge_applied || false,
                eligibility_rules: form?.eligibility_rules || []
            }

            if (form?.mode === 'RENEWAL') {
                body.coverage.push(
                    {
                        coverage_id: "SPARE_PARTS",
                        position: "TARGET",
                        access: form?.target_spare_parts_access || false,
                        price_type: form?.target_spare_parts_price_type || null
                    },
                    {
                        coverage_id: "SERVICE_WORK",
                        position: "TARGET",
                        access: form?.target_service_work_access || false,
                        price_type: form?.target_service_work_price_type || null
                    }
                )
            }

            await api.vfCv2Axios.post(`/config/service-package/${packageId}/service-category`, body)

            queryClient.refetchQueries({
                queryKey: ['cn', 'service_package', packageId]
            })

            dispatch(modal.pull.all())
        } catch (error) {
            dispatch(toast.push({
                type: 'danger',
                head: "Form validation failed",
                message: error.message
            }))
        } finally {
            setLoading('')
        }

    }




    if (isLoading) {
        return <div className="update-pack-service-modal">
            <SkeletonGrid
                rows={8}
                columns={1}
                height={48}
            />
        </div>
    }

    // Error
    if (error) {
        return <ErrorState
            hight='400px'
            title={'Data fetching failed!'}
            message={error?.message}
            icon={<TbMoodAnnoyed />}
        />
    }

    return (
        <div className="update-pack-service-modal">
            <form action="" onSubmit={handleSubmit} >
                <div className="inputs">
                    <div className="section">
                        <Select label={'Service Category'} name={'service_category'} required onChange={handleChangeServiceCategory} value={form.service_category}
                            options={[{ label: '', value: '' }, ...data?.categories?.map(i => ({ label: i?.service_name, value: i?.category_id }))]}
                        />

                        <MultiSelectInput label={'Eligibility rules'} name={'eligibility_rules'}
                            onChange={handleMultiInputChange}
                            options={data?.eligibility_rules?.map(r => ({ label: r?.rule_name, value: r?.uuid }))}
                            selected={data?.eligibility_rules.filter(item => form?.eligibility_rules?.includes(item.uuid))?.map(r => ({ label: r?.rule_name, value: r?.uuid }))}
                        />

                        <InputText label={'Service limit'} name='service_limit' type='number' value={form.service_limit} onChange={handleChangeForm} required min={0}
                            helperText={'Enter the service limit. Set 0 for unlimited services.'} />

                        <h4 className='radio-input-label'>Service charge applied <span className={'required-span'}>*</span></h4>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <Radio label={'Yes'} name={'service_charge_applied'} required radioValue={true} onChange={handleChangeForm} checked={form?.service_charge_applied === true} />
                            <Radio label={'No'} name={'service_charge_applied'} radioValue={false} onChange={handleChangeForm} checked={form?.service_charge_applied === false} />
                        </div>

                        <h3 className='sub-title'>Current position price types</h3>
                        <div className="section" style={{ display: 'grid', gridTemplateColumns: "1fr 1fr" }}>
                            <Select label={'Price of Spares'} name={'current_spare_parts_price_type'} options={[{ label: 'No Access', value: "" }, ...price_unit_objects]}
                                onChange={handleChangePositionValue} value={form.current_spare_parts_price_type || '_NO'} />
                            <Select label={'Price of service work'} name={'current_service_work_price_type'} options={[{ label: 'No Access', value: "" }, ...price_unit_objects]}
                                onChange={handleChangePositionValue} value={form.current_service_work_price_type || '_NO'} />
                        </div>

                        {form?.mode === 'RENEWAL' && <>
                            <h3 className='sub-title'>Target position price types</h3>
                            <div className="section" style={{ display: 'grid', gridTemplateColumns: "1fr 1fr" }}>
                                <Select label={'Price of Spares'} name={'target_spare_parts_price_type'} options={[{ label: 'No Access', value: "" }, ...price_unit_objects]}
                                    onChange={handleChangePositionValue} value={form.target_spare_parts_price_type || '_NO'} />
                                <Select label={'Price of service work'} name={'target_service_work_price_type'} options={[{ label: 'No Access', value: "" }, ...price_unit_objects]}
                                    onChange={handleChangePositionValue} value={form.target_service_work_price_type || '_NO'} />
                            </div>
                        </>}



                    </div>
                </div>
                <div className="button-div">
                    <Button label={'Create category'} severity={'primary'} rounded style={{ width: '100%' }} spinIcon={loading === 'submit'} />
                </div>
            </form>
        </div>
    )
}

export default CreatePackageService