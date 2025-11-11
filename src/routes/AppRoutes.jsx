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



const Master = () => {
    const acc_tkn = Cookies.get('_acc_tkn');
    const DVC_ID = Cookies.get('DVC_ID');
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if ((DVC_ID && DVC_ID.length === 32) && acc_tkn) {
            api.ttSv2Axios.get('/worker/initial-info').then((response) => {
                dispatch(setUser({
                    acc_id: response.data.acc_id,
                    dvc_id: response.data.dvc_id,
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                    designation: response.data.designation,
                    allowed_origins: response.data.allowed_origins
                }))
            })
                .catch(() => {
                    window.location.href = 'http://localhost:3000/?page=home'
                })
                .finally(() => setLoading(false));
        } else {
            window.location.href = 'http://localhost:3000/?page=home'
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