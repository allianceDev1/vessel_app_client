import React, { Suspense } from 'react'
import ControllerLayout from '../components/layout/controllerLayout/ControllerLayout'
import { useSelector } from 'react-redux';
import SkeletonPage from '../components/UI_Primitives/skeleton/SkeletonPage';
import { Route, Routes } from 'react-router-dom';
import Page404 from '../components/layout/404/Page404';


// Lazy
const Dashboard = React.lazy(() => import('../pages/controller/dashboard/Dashboard'))
const AreaList = React.lazy(() => import('../pages/controller/area-list/AreaList'))
const AppConfig = React.lazy(() => import('../pages/controller/app-config/AppConfig'))
const ServicePackages = React.lazy(() => import('../pages/controller/service-packages/ServicePackages'))
const ViewServicePackage = React.lazy(() => import('../pages/controller/view-service-package/ViewServicePackage'))
const ViewArea = React.lazy(() => import('../pages/controller/view-area/ViewArea'))










const Controller = () => {
    const { user } = useSelector((state) => state.user)
    const isAuthenticated = user?.allowed_origins?.some((k) => k.startsWith("vfcr"));

    return (
        <ControllerLayout>
            <Suspense fallback={<SkeletonPage />}>
                <Routes>
                    {/* Dashboard */}
                    <Route path='/' element={<PrivateRoute element={<Dashboard />} isAuthenticated={isAuthenticated} />} />

                    {/* Area */}
                    {user?.allowed_origins?.some(access => ['vfcr_areas_read', 'vfcr_areas_write'].includes(access)) && <>
                        <Route path='/area-list' element={<PrivateRoute element={<AreaList />} isAuthenticated={isAuthenticated} />} />
                        <Route path='/area-list/:city_id' element={<PrivateRoute element={<ViewArea />} isAuthenticated={isAuthenticated} />} />
                    </>}

                    {/* App Config */}
                    {user?.allowed_origins?.includes('vfcr_appConfig_write') && <>
                        <Route path='/app-config' element={<PrivateRoute element={<AppConfig />} isAuthenticated={isAuthenticated} />} />
                        <Route path='/app-config/service-packages' element={<PrivateRoute element={<ServicePackages />} isAuthenticated={isAuthenticated} />} />
                        <Route path='/app-config/service-packages/:package_id' element={<PrivateRoute element={<ViewServicePackage />} isAuthenticated={isAuthenticated} />} />
                    </>}


                    {/* 404 */}
                    <Route path="/*" element={<Page404 />} />
                </Routes>
            </Suspense>
        </ControllerLayout>
    )
}

export default Controller



function PrivateRoute({ element, isAuthenticated }) {
    if (!isAuthenticated) {
        window.location.href = 'http://localhost:3000/?page=home';
        return null;
    }

    return element;
}

