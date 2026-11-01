import React, { useEffect, useMemo, useState } from 'react'
import './sub-page-style.scss'
import { useDispatch, useSelector } from 'react-redux'
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service'
import Select from '../../../UI_Primitives/inputs/Select'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import Button from '../../../UI_Primitives/buttons/Button'
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect'
import { toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { TbTrash } from 'react-icons/tb'



const WpInspection = ({ pageKey }) => {
    const dispatch = useDispatch();
    const { formResources, serviceFormSettings, serviceForm } = useSelector((state) => state.application)
    const [natures, setNatures] = useState([])
    const [reasons, setReasons] = useState([])
    const [solutions, setSolutions] = useState([])
    const [form, setForm] = useState({ nature: null, reasons: [], solutions: [] })

    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);

    const handleChangeNature = (e) => {

        if (!e.target.value) {
            setForm({ ...form, nature: null, reasons: [], solutions: [] })
            setReasons([])
            setSolutions([])
            return;
        }

        const chosenNature = natures?.filter(n => n?.[0] === e.target.value)?.[0] || []

        setReasons(chosenNature?.[1]?.map(r => ({ label: r, value: r })) || [])
        setSolutions(chosenNature?.[2]?.map(s => ({ label: s, value: s })) || [])

        setForm({ ...form, nature: e.target.value, reasons: [], solutions: [] })
    }

    const handleMultiInputChange = (e) => {
        setForm({ ...form, [e.name]: e.selectedValues?.map((c) => c.value) })
    }

    const handleSubmitSubForm = () => {
        // Validation
        if (!form?.nature || !form?.reasons?.length || !form?.solutions?.length) {
            return;
        }

        const existed = productInForm?.inspection_report?.tech_analyze?.filter(t => t.nature === form?.nature)
        if (existed?.length) {
            dispatch(toast.push({
                type: 'danger',
                head: 'The nature already existed'
            }))

            return;
        }

        dispatch(sfSetting.productSubmit.resetStatus());

        dispatch(sfActions.updateProduct.innerFields({
            inspection_report: {
                tech_analyze: [
                    ...(productInForm?.inspection_report?.tech_analyze || []),
                    form
                ]
            }
        }))

        setForm({ nature: '', reasons: [], solutions: [] })
        setReasons([])
        setSolutions([])

    }

    const handleDelete = (nature) => {
        dispatch(sfSetting.productSubmit.resetStatus());
        dispatch(sfActions.updateProduct.innerFields({
            inspection_report: {
                tech_analyze: productInForm?.inspection_report?.tech_analyze?.filter(t => t.nature !== nature)
            }
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!productInForm?.inspection_report?.tech_analyze?.length) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Add at least one analyze'
            }))

            return;
        }

        dispatch(sfSetting.page.next(1104))
    }

    useEffect(() => {

        if (formResources?.input_resources?.length) {
            let colorOptions = formResources?.input_resources?.find(r => r.title === 'purifier_service_analyze_natures')?.values || []
            colorOptions = colorOptions.map(v => v.data)
            setNatures(colorOptions)
        }

    }, [formResources])


    return (
        <div className="tech-service-form-subpage sf-subpage-two">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.find(p => p.key === pageKey)?.title}</h3>
                <p>{serviceFormPageRoute?.find(p => p.key === pageKey)?.description}</p>
            </div>

            <form onSubmit={handleSubmit}>

                {/* Tech Analyze */}
                <div className="form-section">
                    <h3 className='subtitle'>Tech analyze</h3>

                    {productInForm?.inspection_report?.tech_analyze?.length > 0 &&
                        <table className='nature-table'>
                            <tbody>
                                <tr>
                                    <th>Nature</th>
                                    <th>Reasons</th>
                                    <th>Solutions</th>
                                    <th></th>
                                </tr>
                                {productInForm?.inspection_report?.tech_analyze?.map((data, index) => (
                                    <tr key={`${data?.nature}${index}`}>
                                        <td>{data?.nature}</td>
                                        <td>{data?.reasons?.join(', ')}</td>
                                        <td>{data?.solutions?.join(', ')}</td>
                                        <td className='trash'>
                                            <span onClick={() => handleDelete(data?.nature)}><TbTrash /></span>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>}

                    <div className="box-col1 sub-form">
                        <Select label={'Complaint nature'} name={'nature'} value={form?.nature} onChange={handleChangeNature}
                            options={[{}, ...(natures?.map(n => ({ label: n?.[0], value: n?.[0] })) || [])]} />
                        <MultiSelectInput label={'Complaint reasons'} name={'reasons'} options={reasons} searchable
                            onChange={handleMultiInputChange} selected={form?.reasons?.map((r) => ({ label: r, value: r })) || []} />
                        <MultiSelectInput label={'Complaint solutions'} name={'solutions'} options={solutions} searchable
                            onChange={handleMultiInputChange} selected={form?.solutions?.map((r) => ({ label: r, value: r })) || []} />

                        <Button label={'Add to list'} rounded outlined style={{ width: '150px' }} type='button' size='small'
                            severity={'secondary'} onClick={handleSubmitSubForm}
                            disabled={!form?.nature || !form?.reasons?.length || !form?.solutions?.length} />
                    </div>
                </div>

                <div className="submit-section">
                    <Button label={'Next'} severity={'secondary'} rounded style={{ width: '100%' }}
                        disabled={!productInForm?.inspection_report?.tech_analyze?.length} />
                </div>

            </form>
        </div>
    )
}

export default WpInspection