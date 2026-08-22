import React, { useEffect, useState } from 'react'
import './create-update-rule.scss'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import InputText from '../../../components/UI_Primitives/inputs/InputText';
import Select from '../../../components/UI_Primitives/inputs/Select';
import Button from '../../../components/UI_Primitives/buttons/Button';
import { TbPlus, TbX } from 'react-icons/tb'



const CreateUpdateRule = ({ action = "CREATE" }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [roleName, setRoleName] = useState('')
    const [conditions, setConditions] = useState([])




    useEffect(() => {
        dispatch(page.setTitle({
            title: action === 'CREATE' ? 'Create rule' : 'Update rule',
            note: action === 'CREATE' ? 'Create new eligibility rule' : 'Update existing eligibility rule'
        }))

        // eslint-disable-next-line
    }, [])

    return (
        <div className="create-update-rule-page-container">
            <div className="note-section">
                <p>An eligibility rule defines one possible way a service can be allowed for a customer product.
                    Each rule contains one or more conditions that evaluate the customer's current product, package,
                    service, and token data. Conditions work together as <b>AND</b>, meaning all conditions within the rule
                    must be satisfied for that rule to match. A service category can have multiple rules, and the rules
                    work as <b>OR</b>, meaning the service is allowed when any one enabled rule matches. Create separate
                    rules whenever there are different scenarios that can independently make the customer eligible.
                </p>
            </div>

            <form>
                <label className='rule-name' htmlFor="">Rule name</label>
                <InputText placeholder={'Enter a unique rule name'} name={'rule_name'} inputStyle={{ padding: '15px 15px' }}
                    onChange={(e) => setRoleName(e.target.value)} value={roleName} />

                <br></br>

                <label className='rule-name' htmlFor="">Conditions</label>
                <div className="conditions-list">
                    <div className="condition-form">
                        <Select label={'Subject'} required size='small' />
                        <Select label={'Condition'} required size='small' />
                        <InputText label={'Criteria'} required size='small' />
                        <Select label={'Direction'} required size='small' />
                        <Button icon={<TbX />} severity={'danger'} outlined rounded size='small' type='button' />
                    </div>
                </div>
                <div className="add-condition">
                    <Button icon={<TbPlus />} label={'New condition'} outlined rounded size='small' style={{ width: '150px' }}
                        type='button' />
                </div>

                <Button label={'Create rule'} severity={'primary'} rounded style={{ width: '100%', marginTop: '40px' }} />
            </form>

        </div>
    )
}

export default CreateUpdateRule