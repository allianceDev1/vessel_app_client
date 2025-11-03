import React, { useEffect, useState } from 'react'
import './toast.scss'
import { FaXmark } from "react-icons/fa6";
import { useDispatch } from 'react-redux';
import { toast } from '../../../redux/features/non_persisted/miniSystemSlice';

const Toast = ({ id, type, icon, head, message, doClose = true, autoClose = true }) => {
  const dispatch = useDispatch();
  const [isExiting, setIsExiting] = useState(false);

  const alertClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      dispatch(toast?.pull?.single(id));
    }, 300);
  }

  const handleClose = () => {
    if (doClose) {
      alertClose();
    }
  };

  useEffect(() => {
    let timer;
    if (autoClose) {
      timer = setTimeout(() => {
        alertClose();
      }, 4000);
    }

    const toastElement = document.querySelector(`#${id}`);
    const handleMouseEnter = () => clearTimeout(timer);
    const handleMouseLeave = () => {
      if (autoClose) {
        timer = setTimeout(() => {
          alertClose();
        }, 4000);
      }
    };

    if (toastElement && !isExiting) {
      toastElement.addEventListener('mouseenter', handleMouseEnter);
      toastElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearTimeout(timer);
      if (!isExiting && autoClose) {
        toastElement.removeEventListener('mouseenter', handleMouseEnter);
        toastElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [id, autoClose, doClose, dispatch]);

  /**
   * {
        id: random id,
        type: alert type , success, danger, warning , info, natural,
        head: alert head,
        message: alert message,
        icon: alert icon,
        doClose: if true allow the alert close,
        autoClose: if true allow the alert auto close after 4 seconds
      }
   */
  return (
    <div id={id} className={`toast ${type ? "toast-" + type : ''} ${isExiting ? 'toast-exit' : ''}`}>
      <div className="line"></div>
      {icon && <div className="icon">
        {icon}
      </div>}
      <div className="content">
        {head && <h4>{head}</h4>}
        {message && <p>{message}</p>}
      </div>
      {doClose && <div className="close">
        <FaXmark onClick={handleClose} />
      </div>}
    </div>
  )
}

export default Toast