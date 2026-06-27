import React, { useEffect, useMemo, useState } from 'react'
import './form-top-bar.scss'
import { useDispatch, useSelector } from 'react-redux';
import { TbChevronLeft, TbClockHour5, TbRotate2, TbStopwatch } from 'react-icons/tb';
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { getPreviousServicePageKey } from '../../../../utils/flows/service_form_utils';
import { sfSetting } from '../../../../redux/features/persisted/applicationSlice';
import Button from '../../../UI_Primitives/buttons/Button';
import StopWatch from './StopWatch';
import { useQueryClient } from '@tanstack/react-query';



const FormTopBar = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient()
  const [currentTime, setCurrentTime] = useState(Date.now());
  const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)


  const handleReloadResources = () => {
    queryClient.invalidateQueries({
      queryKey: ['service_form_resources']
    })
  }

  const handleBack = () => {
    const [mainKey, subKey] = getPreviousServicePageKey(serviceFormSettings?.activePage, serviceFormSettings?.activeSubPage)
    dispatch(sfSetting.setActivePage(mainKey))
    dispatch(sfSetting.setActiveSubPage(subKey))

    if (subKey === null && mainKey === 100) {
      dispatch(sfSetting.setActiveProduct(null))
    }
  }

  const openStopWatch = () => {
    dispatch(modal.push({
      title: "Stopwatch",
      body: <StopWatch />
    }))
  }

  const elapsedTime = useMemo(() => {

    if (!serviceForm?.in_time) {
      return "00:00:00"
    }

    const start = new Date(serviceForm?.in_time).getTime();
    const elapsed = Math.floor((currentTime - start) / 1000);

    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [serviceForm?.in_time, currentTime]);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="tech-service-form-top-bar-container">
      <div className="action-section">
        <div className='buttons'>
          <Button title={'Back'} type='button' rounded size='small' icon={<TbChevronLeft />} onClick={handleBack}
            disabled={serviceFormSettings?.activePage === 100 && !serviceFormSettings?.activeSubPage} />
          <Button title={'Timer'} type='button' rounded size='small' outlined icon={<TbClockHour5 />} label={elapsedTime} style={{ minWidth: '110px', cursor: 'not-allowed' }}
          />
        </div>
        <div className='buttons'>
          <Button title="Refresh" type='button' rounded size='small' outlined icon={<TbRotate2 />} onClick={handleReloadResources} />
          <Button title='Stopwatch' type='button' rounded size='small' outlined icon={<TbStopwatch />} onClick={openStopWatch} />
        </div>
      </div>
      <div className="name-section">
        <p>Customer ID : {serviceForm?.customer_id || 'Error'} </p>
        <p>{serviceFormSettings?.activeProduct?.[0] ? `${serviceFormSettings?.activeProduct?.[0]}${serviceFormSettings?.activeProduct?.[3] ? ' - ' + serviceFormSettings?.activeProduct?.[3] : ''}` : ''}</p>
      </div>
    </div>
  )
}


export default FormTopBar