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
const CustomerView = React.lazy(() => import('../pages/technician/customer-view/CustomerView'))
const AboutCustomer = React.lazy(() => import('../components/modules/tech/customer-view/AboutCustomer'))
const CustomerProductList = React.lazy(() => import('../components/modules/tech/customer-view/ProductList'))
const CustomerCallLogs = React.lazy(() => import('../components/modules/tech/customer-view/CallLogs'))
const CustomerProductView = React.lazy(() => import('../pages/technician/customer-product/CustomerProductView'))
const AboutCustomerProduct = React.lazy(() => import('../components/modules/tech/customer-product/AboutProduct'))
const CustomerProductSpares = React.lazy(() => import('../components/modules/tech/customer-product/SpareList'))
const CustomerProductEligibility = React.lazy(() => import('../components/modules/tech/customer-product/Eligibility'))
const CustomerProductServiceCardList = React.lazy(() => import('../components/modules/tech/customer-product/ServiceCardList'))
const CustomerProductPackageHistory = React.lazy(() => import('../components/modules/tech/customer-product/PackageHistory'))
const ServicePackageView = React.lazy(() => import('../pages/technician/service-package/ServicePackageView'))
const AboutProductPackage = React.lazy(() => import('../components/modules/tech/service-package/AboutPackage'))
const ServicesUnderProductPackage = React.lazy(() => import('../components/modules/tech/service-package/Services'))
const ServiceJob = React.lazy(() => import('../pages/technician/service-job/ServiceJob'))
const ProductLogInfo = React.lazy(() => import('../components/modules/tech/service-job/ProductLogInfo'))
const PurchaseLogInfo = React.lazy(() => import('../components/modules/tech/service-job/PurchaseLogInfo'))





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
          <Route path='/completed/service-job/:service_srl_no' element={<PrivateRoute element={<ServiceJob />} isAuthenticated={isAuthenticated} />} >
            <Route index element={<ServiceJob />} />
            <Route path="pl/:pl_product_id" index element={<ProductLogInfo />} />
            <Route path="pp/:pp_product_id" index element={<PurchaseLogInfo />} />
          </Route>

          {/* Customer */}
          <Route path='/customer/:customer_id' element={<PrivateRoute element={<CustomerView />} isAuthenticated={isAuthenticated} />} >
            <Route index element={<AboutCustomer />} />
            <Route path="about" index element={<AboutCustomer />} />
            <Route path="products" element={<CustomerProductList />} />
            <Route path="call-logs" element={<CustomerCallLogs />} />
          </Route>

          {/* Customer Product */}
          <Route path='/customer/:customer_id/product/:product_id' element={<PrivateRoute element={<CustomerProductView />} isAuthenticated={isAuthenticated} />} >
            <Route index element={<AboutCustomerProduct />} />
            <Route path="about" index element={<AboutCustomerProduct />} />
            <Route path="spares" element={<CustomerProductSpares />} />
            <Route path="eligibility" element={<CustomerProductEligibility />} />
            <Route path="service-cards" element={<CustomerProductServiceCardList />} />
            <Route path="package-history" element={<CustomerProductPackageHistory />} />
          </Route>

          {/* Product Package */}
          <Route path='/customer/product/package/:serial_number' element={<PrivateRoute element={<ServicePackageView />} isAuthenticated={isAuthenticated} />} >
            <Route index element={<AboutProductPackage />} />
            <Route path="about" index element={<AboutProductPackage />} />
            <Route path="services" element={<ServicesUnderProductPackage />} />
          </Route>

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
