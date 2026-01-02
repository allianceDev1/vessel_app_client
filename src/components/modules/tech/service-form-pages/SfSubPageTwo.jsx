import React, { useEffect, useMemo, useState } from 'react'
import './sub-page-style.scss'
import { useDispatch, useSelector } from 'react-redux'
import { serviceFormSubPageRoute } from '../../../../assets/javascript/pre_data/service'
import Select from '../../../UI_Primitives/inputs/Select'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Radio from '../../../UI_Primitives/inputs/Radio'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import Button from '../../../UI_Primitives/buttons/Button'
import MultiSelectInput from '../../../UI_Primitives/inputs/MultiSelect'
import { toast } from '../../../../redux/features/non_persisted/miniSystemSlice'
import { TbTrash } from 'react-icons/tb'

const SfSubPageTwo = ({ page, resources }) => {
    const dispatch = useDispatch();
    const { serviceFormSettings, serviceForm } = useSelector((state) => state.application)
    const orderId = serviceFormSettings?.activeProduct?.[1] || null
    const [natures, setNatures] = useState([])
    const [reasons, setReasons] = useState([])
    const [solutions, setSolutions] = useState([])
    const [form, setForm] = useState({ nature: null, reasons: [], solutions: [] })

    const product = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}
    }, [serviceForm?.service_products]);


    const updateProductCondition = (e) => {
        const { name, value } = e.target;

        if (name === 'condition' && value === 'Good') {
            dispatch(sfActions.updateProduct({
                inspection_report: {
                    [name]: value || null
                }
            }))

            return;
        }

        dispatch(sfActions.updateProduct({
            inspection_report: { [name]: value || null }
        }))
    }

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

        const existed = product?.inspection_report?.tech_analyze?.filter(t => t.nature === form?.nature)
        if (existed?.length) {
            dispatch(toast.push({
                type: 'danger',
                head: 'The nature already existed'
            }))

            return;
        }

        dispatch(sfActions.updateProduct({
            inspection_report: {
                tech_analyze: [
                    ...(product?.inspection_report?.tech_analyze || []),
                    form
                ]
            }
        }))

        setForm({ nature: '', reasons: [], solutions: [] })
        setReasons([])
        setSolutions([])

    }

    const handleDelete = (nature) => {
        dispatch(sfActions.updateProduct({
            inspection_report: {
                tech_analyze: product?.inspection_report?.tech_analyze?.filter(t => t.nature !== nature)
            }
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (product?.inspection_report?.condition === 'Bad' && !product?.inspection_report?.tech_analyze?.length) {
            dispatch(toast.push({
                type: 'danger',
                head: 'Add at least one analyze'
            }))

            return;
        }

        dispatch(sfSetting.setActiveSubPage(202))
    }

    useEffect(() => {
        let natureOptions = resources?.filter(r => r.title === 'service_analyze_natures')?.[0]?.values || []
        natureOptions = natureOptions.sort((a, b) => a.order - b.order)
        natureOptions = natureOptions.map(v => v.data)
        setNatures(natureOptions)

    }, [resources])


    return (
        <div className="tech-service-form-subpage sf-subpage-two">
            {/* Title */}
            <div className="title-section">
                <h3>{orderId ? `${orderId} : ` : ''}{serviceFormSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
                <p>{serviceFormSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Product condition */}
                <div className="form-section">
                    <h3 className='subtitle'>Product condition</h3>
                    <div className="box-col1">
                        <Radio label={"Ok, it's normal"} name={'condition'} radioValue={'Good'} onChange={updateProductCondition}
                            checked={product?.inspection_report?.condition === 'Good'} />
                        <Radio label={"Not ok, Have a problem"} name={'condition'} radioValue={'Bad'} onChange={updateProductCondition}
                            checked={product?.inspection_report?.condition === 'Bad'} />
                    </div>
                </div>

                {/* Tech Analyze */}
                {product?.inspection_report?.condition === 'Bad' &&
                    <div className="form-section">
                        <h3 className='subtitle'>Tech analyze</h3>

                        {product?.inspection_report?.tech_analyze?.length > 0 &&
                            <table className='nature-table'>
                                <tbody>
                                    <tr>
                                        <th>Nature</th>
                                        <th>Reasons</th>
                                        <th>Solutions</th>
                                        <th></th>
                                    </tr>
                                    {product?.inspection_report?.tech_analyze?.map((data, index) => (
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
                            <MultiSelectInput label={'Complaint reasons'} name={'reasons'} options={reasons}
                                onChange={handleMultiInputChange} selected={form?.reasons?.map((r) => ({ label: r, value: r })) || []} />
                            <MultiSelectInput label={'Complaint solutions'} name={'solutions'} options={solutions}
                                onChange={handleMultiInputChange} selected={form?.solutions?.map((r) => ({ label: r, value: r })) || []} />

                            <Button label={'Add to list'} rounded outlined style={{ width: '150px' }} type='button' size='small'
                                onClick={handleSubmitSubForm} disabled={!form?.nature || !form?.reasons?.length || !form?.solutions?.length} />
                        </div>
                    </div>}




                <div className="submit-section">
                    <Button label={'Next'} rounded style={{ width: '100%' }} />
                </div>

            </form>
        </div>
    )
}

export default SfSubPageTwo