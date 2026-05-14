import React, { Suspense } from 'react'
import TechLayout from '../components/layout/techLayout/TechLayout'
import { useSelector } from 'react-redux'
import SkeletonPage from '../components/UI_Primitives/skeleton/SkeletonPage'
import { Route, Routes } from 'react-router-dom'
import Page404 from '../components/layout/404/Page404'
import env from '../config/env'


// Lazy
const Home = React.lazy(() => import('../pages/technician/home/Home'))
const Service = React.lazy(() => import('../pages/technician/services/Services'))
const ServiceProfile = React.lazy(() => import('../pages/technician/service-profile/ServiceProfile'))
const Schedules = React.lazy(() => import('../pages/technician/schedules/Schedules'))
const ScheduleProfile = React.lazy(() => import('../pages/technician/schedule-profile/ScheduleProfile'))
const ServiceForm = React.lazy(() => import('../pages/technician/service-form/ServiceForm'))
const ServiceCompleted = React.lazy(() => import('../pages/technician/service-form/ServiceCompleted'))
const More = React.lazy(() => import('../pages/technician/more/More'))
const ServiceAreaList = React.lazy(() => import('../pages/technician/service-area/ServiceAreaList'))
const RunningKms = React.lazy(() => import('../pages/technician/running-km/RunningKms'))
const TopUp = React.lazy(() => import('../pages/technician/top-up/TopUp'))
const CompletedList = React.lazy(() => import('../pages/technician/completed-list/CompletedList'))












const Technician = () => {
  const { user } = useSelector((state) => state.user)
  const isAuthenticated = user?.allowed_origins?.includes("vftc_default_write");


  return (
    <TechLayout>
      <Suspense fallback={<SkeletonPage />}>
        <Routes>
          {/* Home */}
          <Route path='/' element={<PrivateRoute element={<Home />} isAuthenticated={isAuthenticated} />} />

          {/* Upcoming Services */}
          <Route path='/services' element={<PrivateRoute element={<Service />} isAuthenticated={isAuthenticated} />} />
          <Route path='/services/:service_type/:customer_id' element={<PrivateRoute element={<ServiceProfile />} isAuthenticated={isAuthenticated} />} />

          {/* Schedules */}
          <Route path='/schedules' element={<PrivateRoute element={<Schedules />} isAuthenticated={isAuthenticated} />} />
          <Route path='/schedules/:customer_id/:registration_id' element={<PrivateRoute element={<ScheduleProfile />} isAuthenticated={isAuthenticated} />} />

          {/* Service */}
          <Route path='/service/attend-work' element={<PrivateRoute element={<ServiceForm />} isAuthenticated={isAuthenticated} />} />
          <Route path='/service/work-success' element={<PrivateRoute element={<ServiceCompleted />} isAuthenticated={isAuthenticated} />} />

          {/* More */}
          <Route path='/more' element={<PrivateRoute element={<More />} isAuthenticated={isAuthenticated} />} />

          {/* More Pages */}
          <Route path='/service-area' element={<PrivateRoute element={<ServiceAreaList />} isAuthenticated={isAuthenticated} />} />
          <Route path='/running-kms' element={<PrivateRoute element={<RunningKms />} isAuthenticated={isAuthenticated} />} />
          <Route path='/token-top-up' element={<PrivateRoute element={<TopUp />} isAuthenticated={isAuthenticated} />} />

          {/* Completed */}
          <Route path='/completed' element={<PrivateRoute element={<CompletedList />} isAuthenticated={isAuthenticated} />} />

          {/* 404 */}
          <Route path="/*" element={<Page404 />} />
        </Routes>
      </Suspense>
    </TechLayout>
  )
}

export default Technician


function PrivateRoute({ element, isAuthenticated, }) {
  if (!isAuthenticated) {
    window.location.href = `${env.REDIRECT_URL}?page=home`;
    return null;
  }

  return element;
}
