import React, { useMemo } from 'react'
import './sub-page-style.scss'
import { useDispatch, useSelector } from 'react-redux'
import { serviceFormPageRoute } from '../../../../assets/javascript/pre_data/service'
import { sfActions, sfSetting } from '../../../../redux/features/persisted/applicationSlice'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button'
import { containsExactWord, toStandardText } from '../../../../utils/helpers/text-formatting'
import { findFilteredWaterFlowStatus, findPhStatus, findRejectWaterFlowStatus, findTdsStatus } from '../../../../utils/flows/service_form_utils'
import Badge from '../../../UI_Primitives/badge/Badge'
import Message from '../../../UI_Primitives/message/Message'
import PumpMembFrSection from '../service-form-components/purifier/PumpMembFrSection'

const WpPumpMembrane = ({ pageKey }) => {
    const dispatch = useDispatch();
    const { formResources, serviceFormSettings, serviceForm } = useSelector((state) => state.application)


    const productInForm = useMemo(() => {
        const current = serviceForm?.service_products?.[serviceFormSettings?.activeProduct?.[0]]
        return current || {}

        // eslint-disable-next-line
    }, [serviceForm?.service_products, serviceFormSettings?.activeProduct]);

    const productInfo = useMemo(() => {
        const thisProduct = formResources?.products?.find(p => p?.product_id === serviceFormSettings?.activeProduct?.[0])

        const hasUV = containsExactWord(thisProduct?.product_name, 'UV')
        const hasAlkaline = containsExactWord(thisProduct?.product_name, 'ALKALINE')
        const hasRo = containsExactWord(thisProduct?.product_name, 'RO')

        const hasUvOnly = hasUV && !hasAlkaline && !hasRo

        return { hasUV, hasAlkaline, hasRo, hasUvOnly }
    }, [formResources])
    // productInForm?.current_condition?.fr_value || 0

    const checkupStages = useMemo(() => {

        const checkUpOne = [
            { key: 3, id: 'op+nm+fr450', title: 'OP + NM + FR 450', criteria: { rejected: 450, filtered: 14 } },
            { key: 4, id: 'np+om+fr350', title: 'NP + OM + FR 350', criteria: { rejected: 350, filtered: 12 } },
            { key: 5, id: 'np+nm+fr450', title: 'NP + NM + FR 450', criteria: { rejected: 450, filtered: 15 } }
        ]

        const checkupTwo = [
            { key: 0, id: 'op+om+fr_now', title: `OP + OM + FR ${productInForm?.current_condition?.fr_value || 0}`, criteria: { rejected: productInForm?.current_condition?.fr_value || 0, filtered: 12 } },
            { key: 1, id: 'op+om+fr350', title: 'OP + OM + FR 350', criteria: { rejected: 350, filtered: 12 } }
        ]

        if (productInForm?.membrane_tds?.status === 'HIGH') {
            return checkUpOne;
        }
        if (productInForm?.with_new_spun?.filtered_water?.flow_status !== 'NORMAL' || productInForm?.with_new_spun?.reject_water?.flow_status !== 'NORMAL') {
            if (Number(productInForm?.current_condition?.fr_value) !== 300) {
                checkupTwo.push({ key: 2, id: 'op+om+fr300', title: 'OP + OM + FR 300', criteria: { rejected: 300, filtered: 12 } })
            }

            return [...checkupTwo, ...checkUpOne];
        }

        return []

    }, [productInForm]);


    const visibleStages = useMemo(() => {
        if (!checkupStages.length) {
            return [];
        }

        let visibleCount = 1;

        for (let index = 0; index < checkupStages.length - 1; index++) {
            const stageData = productInForm?.pump_membrane_checkups?.[checkupStages[index]?.key];

            if ((!stageData?.filtered_water?.flow_status || !stageData?.reject_water?.flow_status) ||
                stageData?.filtered_water?.flow_status === "NORMAL" && stageData?.reject_water?.flow_status === "NORMAL") {

                break;
            }

            visibleCount++;

        }

        return checkupStages.slice(0, visibleCount);
    }, [
        checkupStages,
        productInForm?.pump_membrane_checkups,
    ]);


    const handleChangeTDS = (e) => {
        const { name, value } = e.target;

        let inputValue = 0, outputValue = 0;

        if (name === 'input_tds') {
            inputValue = Number(value)
            outputValue = Number(productInForm?.membrane_tds?.output_tds || 0)
        } else if (name === 'output_tds') {
            inputValue = Number(productInForm?.membrane_tds?.input_tds || 0)
            outputValue = Number(value)
        }

        const previousStatus = productInForm?.membrane_tds?.status
        const status = findTdsStatus(inputValue, outputValue, productInfo)

        dispatch(sfActions.updateProduct.parentValue({
            membrane_tds: {
                ...(productInForm?.membrane_tds || {}),
                status,
                [name]: value || ''
            }
        }))

        if (previousStatus !== status) {
            dispatch(sfActions.updateProduct.parentValue({
                pump_membrane_checkups: undefined
            }))
        }

        dispatch(sfSetting.productSubmit.resetStatus());
    }

    const resetSection = () => {
        dispatch(sfActions.updateProduct.parentValue({
            membrane_tds: undefined,
            pump_membrane_checkups: undefined
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        dispatch(sfSetting.page.next(1103))
    }


    return (
        <div className="tech-service-form-subpage sf-subpage-one">
            {/* Title */}
            <div className="title-section">
                <h3>{serviceFormPageRoute?.find(p => p.key === pageKey)?.title}</h3>
                <p>{serviceFormPageRoute?.find(p => p.key === pageKey)?.description}</p>
            </div>

            <div className="reset-section">
                <Button label={'Reset section'} size='small' severity={'secondary'} rounded outlined style={{ width: '100px' }}
                    onClick={resetSection} />
            </div>

            <form onSubmit={handleSubmit}>

                {/* TDS */}
                {(productInForm?.current_condition?.tds?.status === 'HIGH' || productInForm?.with_new_spun?.tds?.status === 'HIGH') &&
                    <div className="form-section">
                        <h3 className='subtitle'>From membrane, TDS</h3>
                        <div className="box-col2">
                            <InputText label={'Input TDS'} id={'input_tds'} name={'input_tds'} required value={productInForm?.membrane_tds?.input_tds}
                                onChange={handleChangeTDS} type='number' step={0.1} min={0} />
                            <InputText label={'Output TDS'} id={'output_tds'} name={'output_tds'} required value={productInForm?.membrane_tds?.output_tds}
                                onChange={handleChangeTDS} type='number' min={0}
                                rightIcon={productInForm?.membrane_tds?.status ? <Badge
                                    value={toStandardText(productInForm?.membrane_tds?.status)}
                                    severity={productInForm?.membrane_tds?.status === "NORMAL" ? 'primary' : "danger"}
                                /> : ''} />
                        </div>
                    </div>}

                {productInForm?.membrane_tds?.status === 'NORMAL' &&
                    <Message
                        type='info'
                        iconDisable
                        head={productInfo?.hasAlkaline ? 'Check Alkaline Filter' : 'Check Carbon Filters'}
                        message={productInfo?.hasAlkaline
                            ? 'The issue is related to the alkaline filter, not the pump or membrane. Please inspect the alkaline filter and resolve the issue.'
                            : 'The issue is related to the carbon filters, not the pump or membrane. Please inspect the carbon filters and resolve the issue.'}
                        style={{ marginBottom: '15px' }}
                    />}


                {visibleStages.map((stage) => (
                    <PumpMembFrSection
                        key={stage.id}
                        title={stage.title}
                        sectionKey={stage.key}
                        sectionId={stage.id}
                        criteria={stage.criteria}
                    />
                ))}

                <div className="submit-section">
                    <Button label={'Next'} severity={'secondary'} rounded style={{ width: '100%' }} />
                </div>

            </form>
        </div>
    )
}

export default WpPumpMembrane