import React, { Suspense } from 'react'
import TechLayout from '../components/layout/techLayout/TechLayout'
import { useSelector } from 'react-redux'
import SkeletonPage from '../components/UI_Primitives/skeleton/SkeletonPage'
import { Route, Routes } from 'react-router-dom'
import Page404 from '../components/layout/404/Page404'



// Lazy
const Home = React.lazy(() => import('../pages/technician/home/Home'))

const Technician = () => {
  const { user } = useSelector((state) => state.user)
  const isAuthenticated = user?.allowed_origins?.includes("vftc_default_write");


  return (
    <TechLayout>
      <Suspense fallback={<SkeletonPage />}>
        <Routes>
          {/* Home */}
          <Route path='/' element={<PrivateRoute element={<Home />} isAuthenticated={isAuthenticated} />} />


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
    window.location.href = 'http://localhost:3000/?page=home';
    return null;
  }

  return element;
}
