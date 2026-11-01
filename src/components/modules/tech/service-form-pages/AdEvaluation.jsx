import React, { useMemo } from 'react'
import './sub-page-style.scss';
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service';
import { useDispatch, useSelector } from 'react-redux';
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice';
import InputText from '../../../UI_Primitives/inputs/InputText';
import Button from '../../../UI_Primitives/buttons/Button';
import RadioCard from '../../../UI_Primitives/inputs/RadioCard';

const AdEvaluation = ({ pageKey }) => {
    const dispatch = useDispatch();
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)

    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);

    const handleChange = (e, subKey) => {

        if (e.target.name === 'leak_status' || e.target.name === 'working_status') {
            dispatch(sfActions.updateProduct.innerFields({
                evaluation: {
                    [subKey]: {
                        status: e.target.value,
                        comment: ''
                    }
                }
            }))
        } else {
            dispatch(sfActions.updateProduct.innerFields({
                evaluation: {
                    [subKey]: {
                        ...(productInForm?.evaluation?.[subKey] || {}),
                        [e.target.name]: e.target.value || null
                    }
                }
            }))
        }

        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const productId = serviceFormSettings?.activeProduct?.[0]

        dispatch(sfSetting.productSubmit.setStatus({ product_id: productId, is_submitted: true }))
        dispatch(sfSetting.setActiveProduct(null))
        dispatch(sfSetting.page.next(1000))

    }

    return (
        <div className="tech-service-form-subpage">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.find(p => p.key === pageKey)?.title}</h3>
                <p>{serviceFormPageRoute?.find(p => p.key === pageKey)?.description}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3 className='subtitle'>Working Status</h3>
                    <div className="box-col1">
                        <RadioCard
                            label="Good"
                            description="No complaints for product"
                            name="working_status"
                            id="ok"
                            radioValue="Good"
                            onChange={(e) => handleChange(e, 'working')}
                            checked={productInForm?.evaluation?.working?.status === 'Good'}
                            required
                        />
                        <RadioCard
                            label="Bad"
                            description="Have a complaint, Add comment"
                            name="working_status"
                            id="not_ok"
                            radioValue="Bad"
                            onChange={(e) => handleChange(e, 'working')}
                            checked={productInForm?.evaluation?.working?.status === 'Bad'}
                            required
                        />

                        {productInForm?.evaluation?.working?.status === 'Bad' &&
                            <InputText label={'Comment'} id={'comment_working'} name={'comment'} value={productInForm?.evaluation?.working?.comment}
                                onChange={(e) => handleChange(e, 'working')} required />}
                    </div>
                </div>

                <div className="form-section">
                    <h3 className='subtitle'>Leak / Crack</h3>
                    <div className="box-col2">
                        <RadioCard
                            label="Yes"
                            description="Yes, add comment"
                            name="leak_status"
                            id="leak_ok"
                            radioValue="Yes"
                            onChange={(e) => handleChange(e, 'lead_crack')}
                            checked={productInForm?.evaluation?.lead_crack?.status === 'Yes'}
                            required
                        />
                        <RadioCard
                            label="No"
                            description="No leak and crack"
                            name="leak_status"
                            id="leak_not_ok"
                            radioValue="No"
                            onChange={(e) => handleChange(e, 'lead_crack')}
                            checked={productInForm?.evaluation?.lead_crack?.status === 'No'}
                            required
                        />
                    </div>

                    <div className="box-col1" style={{ marginTop: '10px' }}>
                        {productInForm?.evaluation?.lead_crack?.status === 'Yes' &&
                            <InputText label={'Comment'} id={'comment_leak'} name={'comment'} value={productInForm?.evaluation?.lead_crack?.comment}
                                onChange={(e) => handleChange(e, 'lead_crack')} required />}
                    </div>
                </div>

                <div className="submit-section">
                    <Button label={'Submit Service'} severity={'primary'} rounded style={{ width: '100%' }} />
                </div>

            </form>
        </div>
    )
}

export default AdEvaluation