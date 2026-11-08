import React, { useEffect } from 'react'
import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { TbArrowRight, TbDatabaseOff, TbDeviceDesktop, TbFileText, TbLogout, TbMoon, TbSun, TbTrash } from 'react-icons/tb'
import './settings.scss'
import { clearQueryData } from '../../../lib/react-query'
import env from '../../../config/env'
import { doDialog, page, toast } from '../../../redux/features/non_persisted/miniSystemSlice'
import { changeThemeColor } from '../../../redux/features/persisted/systemSlice'
import { resetMemory } from '../../../redux/features/memoryActions'

const THEME_CYCLE = { 'os-default': 'dark', 'dark': 'light', 'light': 'os-default' }
const THEME_LABELS = { 'os-default': 'System', 'dark': 'Dark', 'light': 'Light' }
const THEME_ICONS = { 'os-default': <TbDeviceDesktop />, 'dark': <TbMoon />, 'light': <TbSun /> }

const Settings = () => {
    const dispatch = useDispatch()
    const { theme } = useSelector((state) => state.system)

    useEffect(() => {
        dispatch(page.config({ title: 'Settings', note: "" }))
        // eslint-disable-next-line
    }, [])

    const handleMemoryReset = () => {
        dispatch(doDialog.confirm({
            message: 'This will clear all locally stored data (except your login, theme and connection status). Continue?',
            accept: {
                label: 'Reset',
                theme: 'danger',
                onClick: () => dispatch(resetMemory())
            }
        }))
    }

    const handleClearQueryData = () => {
        dispatch(doDialog.confirm({
            message: 'This will clear all cached server data. It will be fetched again when needed. Continue?',
            accept: {
                label: 'Clear',
                theme: 'danger',
                onClick: async () => {
                    await clearQueryData()
                    dispatch(toast.push({ type: 'success', head: 'Cache Cleared', message: 'Cached data has been cleared' }))
                }
            }
        }))
    }

    // Click cycles: os-default → dark → light → os-default (same as navbar toggle)
    const handleTheme = () => {
        const next = THEME_CYCLE[theme] ?? 'os-default'
       Cookies.set('color_mode', next, {
                  expires: 365,
                  path: '/',
                  sameSite: 'Lax',
                  secure: window.location.protocol === 'https:'
              });
        dispatch(changeThemeColor(next))
    }

    const Item = ({ icon, label, onClick, action }) => (
        <div className="menu" onClick={onClick}>
            <div className="icon">{icon}</div>
            <div className="label"><p className="label-name">{label}</p></div>
            <div className="action">{action ?? <TbArrowRight />}</div>
        </div>
    )

    return (
        <div className="tech-more-page-container">
            <div className="menu-list">
                {Item({ icon: <TbTrash />, label: 'Memory Reset', onClick: handleMemoryReset })}
                {Item({ icon: <TbDatabaseOff />, label: 'Clear Cached Data', onClick: handleClearQueryData })}

                <div className="menu theme-menu" onClick={handleTheme} title="Click to change theme">
                    <div className="icon theme-icon">{THEME_ICONS[theme] ?? THEME_ICONS['os-default']}</div>
                    <div className="label">
                        <div>
                            <p className="label-name">Theme</p>
                            <p className="label-note">Tap to switch appearance</p>
                        </div>
                    </div>
                    <div className="action theme-pill">{THEME_LABELS[theme] ?? THEME_LABELS['os-default']}</div>
                </div>

                {Item({ icon: <TbFileText />, label: 'Privacy Policy', onClick: () => window.open('https://awsllp.gitbook.io/workers/privacy-policy', '_blank') })}
                {Item({ icon: <TbFileText />, label: 'Terms and Conditions', onClick: () => window.open('https://awsllp.gitbook.io/workers/terms-of-service', '_blank') })}
                <div className="menu danger-menu" onClick={() => { window.location.href = env.REDIRECT_URL }}>
                    <div className="icon"><TbLogout /></div>
                    <div className="label"><p className="label-name">Exit</p></div>
                    <div className="action"><TbArrowRight /></div>
                </div>
            </div>
        </div>
    )
}

export default Settings
