import React, { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Cookies from 'js-cookie';
import RotateToken from './components/layout/rotateToken/RotateToken'
import Page404 from './components/layout/Page404/Page404'
import NotFound from './pages/not-found/NotFound ';
import { ttSv2Axios } from './config/axios';
import { useDispatch, useSelector } from 'react-redux';
// import { setUser } from './redux/app/features/userSlice';
import Technician from './routes/Technician';
import Controller from './routes/Controller';


const Master = () => {
    const rfs_tkn = Cookies.get('_rfs_tkn');
    const DVC_ID = Cookies.get('DVC_ID');
    const dispatch = useDispatch()
    const location = useLocation();
    const { user } = useSelector((state) => state.user)


    // useEffect(() => {
    //     const firstSegment = location?.pathname?.split("/")[1] || 'error'
    //     if (DVC_ID && rfs_tkn) {
    //         ttSv2Axios.get('/worker/initial-info').then((response) => {
    //             let routeAuth = true
    //             // ? Router validate like a sales app
    //             // ? Router validate like a sales app
    //             // ? Router validate like a sales app
    //             // ? Router validate like a sales app
    //             // ? Router validate like a sales app
    //             // ? Router validate like a sales app
    //             // ? Router validate like a sales app
    //             // ? Router validate like a sales app
    //             // ? Router validate like a sales app
    //             // ? Router validate like a sales app
    //             // ? Router validate like a sales app
    //             // ? Router validate like a sales app
    //             // ? Router validate like a sales app
    //             // ? Router validate like a sales app
    //             if (routeAuth) {
    //                 // dispatch(setUser({ ...(user || {}), ...response.data, refresh_token: Cookies.get('_rfs_tkn') }))
    //             } else {
    //                 window.location.href = 'http://localhost:3000/?page=home'
    //             }
    //         }).catch(() => {
    //             window.location.href = 'http://localhost:3000/?page=home'
    //         })
    //     } else {
    //         window.location.href = 'http://localhost:3000/?page=home'
    //     }
    //     // eslint-disable-next-line
    // }, [])


    return (
        <>
            <RotateToken />
            <Routes>
                {/* Without Header and Footer */}

                {/* Main Root */}
                <Route path="/tech/*" element={<Technician />} />
                <Route path="/controller/*" element={<Controller />} />


                <Route path="/*" element={<Page404 />} />

            </Routes>
        </>
    )
}

export default Master