import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/features/persisted/userSlice';
import { api } from "../api";
import Cookies from 'js-cookie';
import RotateToken from '../components/layout/rotateToken/RotateToken'
import Technician from './Technician';
import Controller from './Controller';
import SkeletonPage from '../components/UI_Primitives/skeleton/SkeletonPage';
import Layout404 from '../components/layout/404/Layout404';
import env from '../config/env';



const Master = () => {
    const acc_tkn = Cookies.get('_acc_tkn');
    const DVC_ID = Cookies.get('DVC_ID');
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if ((DVC_ID && DVC_ID.length === 32) && acc_tkn) {
            api.ttSv2Axios.get('/worker/initial-info').then((response) => {
                dispatch(setUser({
                    acc_id: response.acc_id,
                    dvc_id: response.dvc_id,
                    first_name: response.first_name,
                    last_name: response.last_name,
                    designation: response.designation,
                    allowed_origins: response.allowed_origins
                }))
            })
                .catch(() => {
                    window.location.href = `${env.REDIRECT_URL}?page=home`
                })
                .finally(() => setLoading(false));
        } else {
            window.location.href = `${env.REDIRECT_URL}?page=home`
        }
        // eslint-disable-next-line
    }, [])


    if (loading) {
        return <SkeletonPage />
    }

    return (
        <>
            <RotateToken />
            <Routes>
                {/* Without Header and Footer */}

                {/* Main Root */}
                <Route path="/tech/*" element={<Technician />} />
                <Route path="/controller/*" element={<Controller />} />


                <Route path="/*" element={<Layout404 />} />

            </Routes>
        </>
    )
}

export default Master