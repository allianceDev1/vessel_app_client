import { useMemo } from 'react'
import './sub-page-style.scss';
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service';
import { useDispatch, useSelector } from 'react-redux';
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice';
import InputText from '../../../UI_Primitives/inputs/InputText';
import Button from '../../../UI_Primitives/buttons/Button';
import RadioCard from '../../../UI_Primitives/inputs/RadioCard';

const AdCurrentCondition = ({ pageKey }) => {
    const dispatch = useDispatch();
    const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)

    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products]);


    const updateCurrentStatus = (e, subKey) => {
        dispatch(sfSetting.productSubmit.resetStatus());
        if (e.target.name === 'leak_status' || e.target.name === 'working_status') {
            dispatch(sfActions.updateProduct.innerFields({
                current_condition: {
                    [subKey]: {
                        status: e.target.value,
                        comment: ''
                    }
                }
            }))
        } else {
            dispatch(sfActions.updateProduct.innerFields({
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

        dispatch(sfSetting.page.next(1301))
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
                            onChange={(e) => updateCurrentStatus(e, 'working')}
                            checked={productInForm?.current_condition?.working?.status === 'Good'}
                            required
                        />
                        <RadioCard
                            label="Bad"
                            description="Have a complaint, Add comment"
                            name="working_status"
                            id="not_ok"
                            radioValue="Bad"
                            onChange={(e) => updateCurrentStatus(e, 'working')}
                            checked={productInForm?.current_condition?.working?.status === 'Bad'}
                            required
                        />

                        {productInForm?.current_condition?.working?.status === 'Bad' &&
                            <InputText label={'Comment'} id={'comment_working'} name={'comment'} value={productInForm?.current_condition?.working?.comment}
                                onChange={(e) => updateCurrentStatus(e, 'working')} required />}
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
                            onChange={(e) => updateCurrentStatus(e, 'lead_crack')}
                            checked={productInForm?.current_condition?.lead_crack?.status === 'Yes'}
                            required
                        />
                        <RadioCard
                            label="No"
                            description="No leak and crack"
                            name="leak_status"
                            id="leak_not_ok"
                            radioValue="No"
                            onChange={(e) => updateCurrentStatus(e, 'lead_crack')}
                            checked={productInForm?.current_condition?.lead_crack?.status === 'No'}
                            required
                        />
                    </div>

                    <div className="box-col1" style={{ marginTop: '10px' }}>
                        {productInForm?.current_condition?.lead_crack?.status === 'Yes' &&
                            <InputText label={'Comment'} id={'comment_leak'} name={'comment'} value={productInForm?.current_condition?.lead_crack?.comment}
                                onChange={(e) => updateCurrentStatus(e, 'lead_crack')} required />}
                    </div>
                </div>

                <div className="submit-section">
                    <Button label={'Next'} severity={'secondary'} rounded style={{ width: '100%' }} />
                </div>

            </form>
        </div>
    )
}

export default AdCurrentCondition