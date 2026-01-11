import React, { useRef } from 'react'
import './modal.scss'
import { GrClose } from 'react-icons/gr'
import { useDispatch, useSelector } from 'react-redux'
import { modal as modalAction } from '../../../redux/features/non_persisted/miniSystemSlice'

const Modal = () => {
    const dispatch = useDispatch();
    const { modals } = useSelector((state) => state.miniSystem)

    const mouseDownOnBackdrop = useRef(false)

    const closeModal = (data) => {
        if (data?.freezeClose) return;
        dispatch(modalAction.pull.single(data.id))
    }

    return (
        <>
            {modals?.map((modal) => {
                return <div
                    key={modal?.id}
                    className={modal?.show ? "ui-modal open" : 'ui-modal'}
                    onMouseDown={(e) => {
                        mouseDownOnBackdrop.current = e.target === e.currentTarget
                    }}
                    onMouseUp={(e) => {
                        if (
                            mouseDownOnBackdrop.current &&
                            e.target === e.currentTarget
                        ) {
                            closeModal(modal)
                        }
                        mouseDownOnBackdrop.current = false
                    }}

                >
                    <div className="modal-border" style={modal.style} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="header-title">
                                <h4>{modal?.title || 'Title Here'}</h4>
                            </div>
                            <div className="modal-close">
                                {!modal?.freezeClose && <span className="icon" onClick={() => closeModal(modal)}>
                                    <GrClose />
                                </span>}
                            </div>
                        </div>
                        <div className="modal-body">
                            {modal?.body}
                        </div>
                    </div>
                </div>
            })}
        </>
    )
}

export default Modal