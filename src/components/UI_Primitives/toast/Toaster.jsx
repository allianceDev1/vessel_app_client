import React, { useEffect } from 'react'
import './toaster.scss'
import Toast from './Toast'
import { TbAlertCircle, TbAlertHexagon } from "react-icons/tb";
import { FaRegCircleCheck, FaRegCircleXmark } from "react-icons/fa6";
import { useSelector } from 'react-redux';


const Toaster = () => {
    const { toasts } = useSelector((state) => state?.miniSystem);

    const iconMap = {
        success: <FaRegCircleCheck />,
        danger: <FaRegCircleXmark />,
        warning: <TbAlertHexagon />,
        info: <TbAlertCircle />
    };

    return (
        <div className="toaster">
            {toasts && toasts.map((t) => (
                <Toast
                    key={t.id}
                    id={t.id}
                    type={t.type}
                    icon={t.icon || iconMap[t.type] || null}
                    head={t.head}
                    message={t.message}
                    doClose={t.doClose}
                    autoClose={t.autoClose} />
            ))}
        </div>
    )
}

export default Toaster