import React, { useState } from 'react'
import './style.scss'
import BrandLogo from '../../../assets/images/icons/alliance-logo.png'
import { TbError404, TbRefresh } from 'react-icons/tb'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../api'
import { useParams } from 'react-router-dom'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid'
import { toStandardText } from '../../../utils/helpers/text-formatting'
import { useDispatch } from 'react-redux'
import { toast } from '../../../redux/features/non_persisted/miniSystemSlice'
import { generateUniqueId } from '../../../utils/helpers/generate_Id'
import { downloadReceipt, downloadServiceBill } from '../../../utils/services/finance_service'

const ServiceJobList = () => {
  const dispatch = useDispatch();
  const { reg_uuid } = useParams();


  const { data, isLoading, error } = useQuery({
    queryKey: ['public_bill_list', reg_uuid],
    queryFn: async () => {
      try {
        let result = await api.vfPv1Axios.get(`/service/registration/${reg_uuid}`)

        return {
          success: true,
          ...result
        }

      } catch (error) {
        return {
          success: false,
          code: error?.code,
          message: error?.error?.message
        }
      }
    },
    staleTime: 60_000
  })

  const downloadAction = async (type, id) => {
  
    const key = generateUniqueId(6)

    try {
      dispatch(toast.push({
        id: key,
        type: null,
        head: `Fetching ${type}...`,
        message: 'Place wait for a while',
        icon: <TbRefresh />,
        doClose: false,
        autoClose: false
      }))

      if (type === 'Bill') {
        await downloadServiceBill(id)
      } else {
        await downloadReceipt(id)
      }

    } catch (error) {
      dispatch(toast.push({
        type: 'danger',
        head: "Downloading Failed",
        message: error?.message
      }))
    } finally {
      dispatch(toast.pull.single(key))
    }
  }

  if (isLoading) {
    return <div className="public-service-job-list">
      <div className="container">
        <SkeletonGrid rows={7} />

      </div>
    </div>
  }

  return (
    <div className="public-service-job-list">
      <div className="container">
        {/* Header */}
        <div className="header">
          <img src={BrandLogo} alt="Alliance Water Solutions LLP" />
          <h3>Alliance</h3>
        </div>

        {/* Error */}
        {(!data?.success || error) && <div className="error-border">
          <div className="error-box">
            <h4>Error!</h4>
            <p className="message">{data?.message}</p>
            <p className="info">
              If you're unable to view or download your bill or receipt, <br></br>
              please contact our support team at 953 953 9453 for assistance.
            </p>
          </div>
        </div>}

        {/* Success */}
        <div className="content-border">
          <div className="head">
            <p>Your service registration no</p>
            <h4>{data?.reg_no}</h4>
          </div>
          <div className="body">
            <div className="section">
              <h3>Bills</h3>
              <p>Click the bills to download</p>
              <div className="list">
                {data?.bills?.length ? <>
                  {data?.bills?.map((bill, index) => (
                    <div key={bill?.bill_no} className="box bill-box" onClick={() => downloadAction('Bill', bill?.service_srl_no)}>
                      <div className="line-one">
                        <p className="bill_no">{bill?.bill_no}</p>
                        <p className={`status ${bill?.payment_status}`}>{toStandardText(bill?.payment_status)}</p>
                      </div>
                      <div className="line-two">
                        <p className="service-no">{bill?.service_srl_no}</p>
                        <p className="amount">₹ {new Intl.NumberFormat("en-IN").format(bill?.grand_total || 0)}</p>
                      </div>
                    </div>
                  ))}
                </> : <p style={{ textAlign: 'center', padding: '20px 0' }}>No Bills</p>}
              </div>
            </div>

            <div className="section">
              <h3>Receipts</h3>
              <p>Click the receipts to download</p>
              <div className="list">
                {data?.receipts?.length ? <>
                  {data?.receipts?.map((receipt, index) => (
                    <div key={receipt?.receipt_no} onClick={() => downloadAction('Receipt', receipt?.receipt_no)} className="box bill-box" >
                      <div className="line-one">
                        <p className="bill_no">{receipt?.receipt_no}</p>
                        <p className={`status ${receipt?.status}`}>{toStandardText(receipt?.status)}</p>
                      </div>
                      <div className="line-two">
                        <p></p>
                        <p className="amount">₹ {new Intl.NumberFormat("en-IN").format(receipt?.total_amount || 0)}</p>
                      </div>
                    </div>
                  ))}
                </> : <p style={{ textAlign: 'center', padding: '20px 0' }}>No Receipts</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

export default ServiceJobList