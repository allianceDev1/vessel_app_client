import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom';
import './form-top-bar.scss'
import { useDispatch, useSelector } from 'react-redux';
import { TbCalculator, TbChevronLeft, TbClockHour5, TbRotate2, TbStopwatch } from 'react-icons/tb';
import { modal } from '../../../../redux/features/non_persisted/miniSystemSlice';
import { sfSetting } from '../../../../redux/features/persisted/applicationSlice';
import StopWatch from './StopWatch';
import Calculator from './Calculator';


// top margin of `.body-container` in techLayout.scss (space reserved for the layout header)
const LAYOUT_BODY_OFFSET = 50


const FormTopBar = ({ refreshResources, isSyncing }) => {
  const dispatch = useDispatch();
  const barRef = useRef(null)
  const [barHeight, setBarHeight] = useState(LAYOUT_BODY_OFFSET)
  const [currentTime, setCurrentTime] = useState(Date.now());
  const { serviceForm, serviceFormSettings } = useSelector((state) => state.application)


  const handleReloadResources = async () => {
    await refreshResources()
  }

  const handleBack = () => {
    dispatch(sfSetting.page.back())

    if ([1100, 1200, 1300].includes(serviceFormSettings?.activePage)) {
      dispatch(sfSetting.setActiveProduct(null))
    }
  }

  const openStopWatch = () => {
    dispatch(modal.push({
      title: "Stopwatch",
      body: <StopWatch />
    }))
  }

  const openCalculator = () => {
    dispatch(modal.push({
      title: "Calculator",
      body: <Calculator />
    }))
  }

  const elapsedTime = useMemo(() => {

    if (!serviceForm?.start_time) {
      return "00:00:00"
    }

    const start = new Date(serviceForm?.start_time).getTime();
    const elapsed = Math.floor((currentTime - start) / 1000);

    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [serviceForm?.start_time, currentTime]);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  // keep page content from hiding under the fixed bar (works for both desktop & mobile wrap heights)
  useLayoutEffect(() => {
    const node = barRef.current
    if (!node) return
    const update = () => setBarHeight(node.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(node)
    return () => ro.disconnect()
  }, []);


  const customerId = serviceForm?.customer_id
  const productId = serviceFormSettings?.activeProduct?.[0]
  const productName = productId
    ? `${productId}${serviceFormSettings?.activeProduct?.[3] ? ' - ' + serviceFormSettings?.activeProduct?.[3] : ''}`
    : ''

  const bar = (
    <div className="tech-service-form-top-bar-fixed" ref={barRef}>
      <div className="tech-service-form-top-bar-container">
        <button type="button" className="tb-icon-btn back" title="Back" onClick={handleBack}
          disabled={serviceFormSettings?.activePage === 1000 || !serviceFormSettings?.activePage}>
          <TbChevronLeft />
        </button>

        <div className="tb-info">
          <div className="tb-timer" title="Service elapsed time">
            <span className="dot" />
            <TbClockHour5 className="clock" />
            <span className="time">{elapsedTime}</span>
          </div>
          <div className="tb-chips">
            <span className={`tb-chip customer ${!customerId ? 'error' : ''}`} title={`Customer ID : ${customerId || 'Error'}`}>
              <span className="prefix">CID</span>
              <span className="value">{customerId || 'Error'}</span>
            </span>
            {productId && <span className="tb-chip product" title={`Product : ${productName}`}>
              <span className="prefix">P-ID</span>
              <span className="value">{productId}</span>
            </span>}
          </div>
        </div>

        <div className="tb-tools">
          <button type="button" className="tb-icon-btn" title="Stopwatch" onClick={openStopWatch}><TbStopwatch /></button>
          <button type="button" className="tb-icon-btn" title="Calculator" onClick={openCalculator}><TbCalculator /></button>
          <button type="button" className="tb-icon-btn" title="Refresh" disabled={isSyncing} onClick={handleReloadResources}><TbRotate2 /></button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Portal to body so the bar can sit above the layout header (layout-body creates its own stacking context) */}
      {createPortal(bar, document.body)}
      {/* body-container already has LAYOUT_BODY_OFFSET top margin for the header, so only reserve the extra height */}
      <div style={{ height: Math.max(0, barHeight - LAYOUT_BODY_OFFSET) }} />
    </>
  )
}


export default FormTopBar