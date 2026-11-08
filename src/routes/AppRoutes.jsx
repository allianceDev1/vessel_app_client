import React, { Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/features/persisted/userSlice';
import { api } from "../api";
import { rotateAccessToken } from "../api/axios/tokenHandler";
import Cookies from 'js-cookie';
import RotateToken from '../components/layout/rotateToken/RotateToken'
// import Technician from './Technician';
// import Controller from './Controller';
import SkeletonPage from '../components/UI_Primitives/skeleton/SkeletonPage';
import Layout404 from '../components/layout/404/Layout404';
import env from '../config/env';

const Technician = React.lazy(() => import('./Technician'));
const Controller = React.lazy(() => import('./Controller'));



const Master = () => {
    const acc_tkn = Cookies.get('_acc_tkn');
    const rfs_tkn = Cookies.get('_rfs_tkn');
    const DVC_ID = Cookies.get('DVC_ID');
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (!(DVC_ID && DVC_ID.length === 32) || (!acc_tkn && !rfs_tkn)) {
                window.location.href = `${env.REDIRECT_URL}?page=home`;
                return;
            }

            try {
                if (!acc_tkn && rfs_tkn) {
                    await rotateAccessToken();
                }

                const response = await api.ttSv2Axios.get('/worker/initial-info');
                dispatch(setUser({
                    acc_id: response.acc_id,
                    dvc_id: response.dvc_id,
                    first_name: response.first_name,
                    last_name: response.last_name,
                    designation: response.designation,
                    allowed_origins: response.allowed_origins
                }));
            } catch {
                window.location.href = `${env.REDIRECT_URL}?page=home`;
            } finally {
                setLoading(false);
            }
        };

        initAuth();
        // eslint-disable-next-line
    }, [])


    if (loading) {
        return <SkeletonPage />
    }

    return (
        <>
            <RotateToken />
            <Suspense fallback={<SkeletonPage />}>
                <Routes>
                    <Route
                        path="/tech/*"
                        element={<Technician />}
                    />

                    <Route
                        path="/controller/*"
                        element={<Controller />}
                    />

                    <Route
                        path="*"
                        element={<Layout404 />}
                    />
                </Routes>
            </Suspense>
        </>
    )
}

export default Master