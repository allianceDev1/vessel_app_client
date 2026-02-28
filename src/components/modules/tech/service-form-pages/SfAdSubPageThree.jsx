import React, { useMemo } from 'react'
import './sub-page-style.scss';
import { serviceFormAddOnSubPageRoute } from '../../../../assets/javascript/pre_data/service';
import { useDispatch, useSelector } from 'react-redux';
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice';
import Radio from '../../../UI_Primitives/inputs/Radio';
import InputText from '../../../UI_Primitives/inputs/InputText';
import Button from '../../../UI_Primitives/buttons/Button';

const SfAdSubPageThree = ({ page, changeSubmitStatus }) => {
    const dispatch = useDispatch();
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)

    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);

    const handleChange = (e, subKey) => {
        changeSubmitStatus(false)
        if (e.target.name === 'leak_status' || e.target.name === 'working_status') {
            dispatch(sfActions.updateProduct({
                evaluation: {
                    [subKey]: {
                        status: e.target.value,
                        comment: ''
                    }
                }
            }))
        } else {
            dispatch(sfActions.updateProduct({
                evaluation: {
                    [subKey]: {
                        ...(productInForm?.evaluation?.[subKey] || {}),
                        [e.target.name]: e.target.value || null
                    }
                }
            }))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const productId = serviceFormSettings?.activeProduct?.[0]

        dispatch(sfSetting.updateSubmitStatus({ product_id: productId, is_submitted: true }))
        dispatch(sfSetting.setActiveSubPage(null))
        dispatch(sfSetting.setActiveProduct(null))
    }

    return (
        <div className="tech-service-form-subpage">
            {/* Title */}
            <div className="title-section">
                <h3>AD : {serviceFormAddOnSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.title}</h3>
                <p>{serviceFormAddOnSubPageRoute?.filter(p => p.key === page?.index)?.[0]?.description}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3 className='subtitle'>Working Status</h3>
                    <div className="box-col1">
                        <Radio label={"It's working"} name={'working_status'} radioValue={'Good'} onChange={(e) => handleChange(e, 'working')}
                            checked={productInForm?.evaluation?.working?.status === 'Good'} required />
                        <Radio label={"It's not working"} name={'working_status'} radioValue={'Bad'} onChange={(e) => handleChange(e, 'working')}
                            checked={productInForm?.evaluation?.working?.status === 'Bad'} required />
                        {productInForm?.evaluation?.working?.status === 'Bad' &&
                            <InputText label={'Comments'} id={'comment_working'} name={'comment'} value={productInForm?.evaluation?.working?.comment}
                                onChange={(e) => handleChange(e, 'working')} required />}
                    </div>
                </div>

                <div className="form-section">
                    <h3 className='subtitle'>Leak / Crack</h3>
                    <div className="box-col1">
                        <Radio label={"Yes"} name={'leak_status'} radioValue={'Yes'} onChange={(e) => handleChange(e, 'lead_crack')}
                            checked={productInForm?.evaluation?.lead_crack?.status === 'Yes'} required />
                        <Radio label={"No"} name={'leak_status'} radioValue={'No'} onChange={(e) => handleChange(e, 'lead_crack')}
                            checked={productInForm?.evaluation?.lead_crack?.status === 'No'} required />
                        {productInForm?.evaluation?.lead_crack?.status === 'Yes' &&
                            <InputText label={'Comments'} id={'comment_leak'} name={'comment'} value={productInForm?.evaluation?.lead_crack?.comment}
                                onChange={(e) => handleChange(e, 'lead_crack')} required />}
                    </div>
                </div>

                <div className="submit-section">
                    <Button label={'Save Report'} severity={'primary'} rounded style={{ width: '100%' }} />
                </div>

            </form>
        </div>
    )
}

export default SfAdSubPageThree