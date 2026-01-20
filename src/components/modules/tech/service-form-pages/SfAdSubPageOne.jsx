import React, { useMemo } from 'react'
import './sub-page-style.scss';
import { serviceFormAddOnSubPageRoute } from '../../../../assets/javascript/pre_data/service';
import { useDispatch, useSelector } from 'react-redux';
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice';
import Radio from '../../../UI_Primitives/inputs/Radio';
import InputText from '../../../UI_Primitives/inputs/InputText';
import Button from '../../../UI_Primitives/buttons/Button';

const SfAdSubPageOne = ({ page, changeSubmitStatus }) => {
    const dispatch = useDispatch();
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)

    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);


    const updateCurrentStatus = (e, subKey) => {
        changeSubmitStatus(false)
        if (e.target.name === 'leak_status' || e.target.name === 'working_status') {
            dispatch(sfActions.updateProduct({
                current_condition: {
                    [subKey]: {
                        status: e.target.value,
                        comment: ''
                    }
                }
            }))
        } else {
            dispatch(sfActions.updateProduct({
                current_condition: {
                    [subKey]: {
                        ...(productInForm?.current_condition?.[subKey] || {}),
                        [e.target.name]: e.target.value || null
                    }
                }
            }))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        dispatch(sfSetting.setActiveSubPage(201))
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
                        <Radio label={"It's working"} name={'working_status'} radioValue={'Good'} onChange={(e) => updateCurrentStatus(e, 'working')}
                            checked={productInForm?.current_condition?.working?.status === 'Good'} required />
                        <Radio label={"It's not working"} name={'working_status'} radioValue={'Bad'} onChange={(e) => updateCurrentStatus(e, 'working')}
                            checked={productInForm?.current_condition?.working?.status === 'Bad'} required />
                        {productInForm?.current_condition?.working?.status === 'Bad' &&
                            <InputText label={'Comments'} id={'comment_working'} name={'comment'} value={productInForm?.current_condition?.working?.comment}
                                onChange={(e) => updateCurrentStatus(e, 'working')} required />}
                    </div>
                </div>

                <div className="form-section">
                    <h3 className='subtitle'>Leak / Crack</h3>
                    <div className="box-col1">
                        <Radio label={"Yes"} name={'leak_status'} radioValue={'Yes'} onChange={(e) => updateCurrentStatus(e, 'lead_crack')}
                            checked={productInForm?.current_condition?.lead_crack?.status === 'Yes'} required />
                        <Radio label={"No"} name={'leak_status'} radioValue={'No'} onChange={(e) => updateCurrentStatus(e, 'lead_crack')}
                            checked={productInForm?.current_condition?.lead_crack?.status === 'No'} required />
                        {productInForm?.current_condition?.lead_crack?.status === 'Yes' &&
                            <InputText label={'Comments'} id={'comment_leak'} name={'comment'} value={productInForm?.current_condition?.lead_crack?.comment}
                                onChange={(e) => updateCurrentStatus(e, 'lead_crack')} required />}
                    </div>
                </div>

                <div className="submit-section">
                    <Button label={'Next'} rounded style={{ width: '100%' }} />
                </div>

            </form>
        </div>
    )
}

export default SfAdSubPageOne