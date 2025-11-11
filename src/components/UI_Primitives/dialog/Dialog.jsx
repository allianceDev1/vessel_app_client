import React from 'react'
import './dialog.scss'
import { TbInfoCircle } from 'react-icons/tb'
import { Button } from '../buttons/Button'
import { useDispatch, useSelector } from 'react-redux';
import { doDialog } from '../../../redux/features/non_persisted/miniSystemSlice';


const Dialog = () => {
    const dispatch = useDispatch();
    const { dialog } = useSelector((state) => state.miniSystem)


    const clickAccept = () => {
        if (dialog.accept?.onClick) {
            dialog.accept?.onClick()
        }
        dispatch(doDialog.clear())
    }

    const clickReject = () => {
        if (dialog.reject?.onClick) {
            dialog.reject?.onClick()
        }
        dispatch(doDialog.clear())
    }

    /**
     * dialog obj model
     * ====================
     *      {
     *          type : "alert" || "confirm",
     *          mIcon : icon of dialog,
     *          message : message of dialog,
     *          accept : {
     *                  label : accept button label,
     *                  icon : accept button icon,
     *                  theme : accept button theme, from button theme,
     *                  onClick : accept button click action
     *          },
     *          reject : {
     *                  label : reject button label,
     *                  icon : reject button icon,
     *                  theme : reject button theme, from button theme,
     *                  onClick : reject button click action
     *      }
     */

    return (
        dialog?.type && <div className="ui-dialog">
            <div className="border">
                {dialog?.message && <div className="body">
                    {dialog?.mIcon || <TbInfoCircle />}
                    <p>{dialog?.message || ''}</p>
                </div>}
                <div className="footer">
                    <Button
                        label={dialog?.accept?.label || dialog?.type === 'confirm' ? 'Yes' : 'Ok'}
                        size='small'
                        severity={dialog?.accept?.theme || 'primary'}
                        icon={dialog?.accept?.icon}
                        onClick={clickAccept}
                        rounded
                    />
                    {dialog?.type === 'confirm' &&
                        <Button
                            label={dialog?.reject?.label || 'No'}
                            size='small'
                            severity={dialog?.reject?.theme || 'primary'}
                            icon={dialog?.reject?.icon}
                            outlined
                            onClick={clickReject}
                            rounded
                        />}
                </div>
            </div>
        </div>
    )
}

export default Dialog