import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout404 from '../components/layout/404/Layout404';
import ServiceRegView from '../pages/public/service-view/ServiceRegView';



const PublicRoutes = () => {

    return (
        <Routes>
            <Route path="/service-job/:reg_uuid" element={<ServiceRegView />} />

            <Route path="/*" element={<Layout404 />} />

        </Routes>
    )
}

export default PublicRoutes