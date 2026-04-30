import React, { Suspense } from 'react'
import ControllerLayout from '../components/layout/controllerLayout/ControllerLayout'
import { useSelector } from 'react-redux';
import SkeletonPage from '../components/UI_Primitives/skeleton/SkeletonPage';
import { Route, Routes } from 'react-router-dom';
import Page404 from '../components/layout/404/Page404';
import env from '../config/env';


// Lazy
const Dashboard = React.lazy(() => import('../pages/controller/dashboard/Dashboard'))
const AreaList = React.lazy(() => import('../pages/controller/area-list/AreaList'))
const AppConfig = React.lazy(() => import('../pages/controller/app-config/AppConfig'))
const ServicePackages = React.lazy(() => import('../pages/controller/service-packages/ServicePackages'))
const ViewServicePackage = React.lazy(() => import('../pages/controller/view-service-package/ViewServicePackage'))
const ViewArea = React.lazy(() => import('../pages/controller/view-area/ViewArea'))
const Customers = React.lazy(() => import('../pages/controller/customers/Customers'))
const CustomerMiniReport = React.lazy(() => import('../components/charts/customer-mini-report/CustomerMiniReport'))
const SearchCustomer = React.lazy(() => import('../components/modules/controller/search-customer/SearchCustomer'))
const FilterCustomer = React.lazy(() => import('../components/modules/controller/search-customer/FilterCustomer'))
const FormResources = React.lazy(() => import('../pages/controller/form-resources/FormResources'))
const ResourceStretcher = React.lazy(() => import('../pages/controller/form-resources/ResourceStretcher'))
const ServiceCategory = React.lazy(() => import('../pages/controller/service-category/ServiceCategory'))
const UpcomingServices = React.lazy(() => import('../pages/controller/upcoming/UpcomingServices'))
const RegisteredService = React.lazy(() => import('../pages/controller/registered/RegisteredService'))
const RegisteredView = React.lazy(() => import('../pages/controller/registered/RegisteredView'))
const CompletedService = React.lazy(() => import('../pages/controller/completed/CompletedServices'))
const CustomerView = React.lazy(() => import('../pages/controller/customer-view/CustomerView'))
const AboutCustomer = React.lazy(() => import('../components/modules/controller/customer-view/AboutCustomer'))
const CustomerProductList = React.lazy(() => import('../components/modules/controller/customer-view/ProductList'))
const CustomerCallLogs = React.lazy(() => import('../components/modules/controller/customer-view/CallLogs'))
const ServiceJob = React.lazy(() => import('../pages/controller/service-job/ServiceJob'))
const CustomerProductView = React.lazy(() => import('../pages/controller/customer-product/CustomerProductView'))
const AboutCustomerProduct = React.lazy(() => import('../components/modules/controller/customer-product/AboutProduct'))
const CustomerProductSpares = React.lazy(() => import('../components/modules/controller/customer-product/SpareList'))
const CustomerProductEligibility = React.lazy(() => import('../components/modules/controller/customer-product/Eligibility'))
const CustomerProductServiceCardList = React.lazy(() => import('../components/modules/controller/customer-product/ServiceCardList'))
const CustomerProductPackageHistory = React.lazy(() => import('../components/modules/controller/customer-product/PackageHistory'))
const ServicePackageView = React.lazy(() => import('../pages/controller/service-package/ServicePackageView'))
const AboutProductPackage = React.lazy(() => import('../components/modules/controller/service-package/AboutPackage'))
const ServicesUnderProductPackage = React.lazy(() => import('../components/modules/controller/service-package/Services'))
const ProductPackageExtensions = React.lazy(() => import('../components/modules/controller/service-package/Extensions'))
const ProductLogInfo = React.lazy(() => import('../components/modules/controller/service-job/ProductLogInfo'))
const PurchaseLogInfo = React.lazy(() => import('../components/modules/controller/service-job/PurchaseLogInfo'))
















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

                    {/* Customer list */}
                    {user?.allowed_origins?.some(access => ['vfcr_customers_read', 'vfcr_customers_write'].includes(access)) && <>
                        <Route path='/customers' element={<PrivateRoute element={<Customers />} isAuthenticated={isAuthenticated} />} >
                            <Route index element={<CustomerMiniReport />} />
                            <Route path="search" element={<SearchCustomer />} />
                            <Route path="filter" element={<FilterCustomer />} />
                        </Route>

                        <Route path='/customer/:customer_id' element={<PrivateRoute element={<CustomerView />} isAuthenticated={isAuthenticated} />} >
                            <Route index element={<AboutCustomer />} />
                            <Route path="about" index element={<AboutCustomer />} />
                            <Route path="products" element={<CustomerProductList />} />
                            <Route path="call-logs" element={<CustomerCallLogs />} />
                        </Route>

                        <Route path='/customer/:customer_id/product/:product_id' element={<PrivateRoute element={<CustomerProductView />} isAuthenticated={isAuthenticated} />} >
                            <Route index element={<AboutCustomerProduct />} />
                            <Route path="about" index element={<AboutCustomerProduct />} />
                            <Route path="spares" element={<CustomerProductSpares />} />
                            <Route path="eligibility" element={<CustomerProductEligibility />} />
                            <Route path="service-cards" element={<CustomerProductServiceCardList />} />
                            <Route path="package-history" element={<CustomerProductPackageHistory />} />
                        </Route>

                        <Route path='/service-package/:serial_number' element={<PrivateRoute element={<ServicePackageView />} isAuthenticated={isAuthenticated} />} >
                            <Route index element={<AboutProductPackage />} />
                            <Route path="about" index element={<AboutProductPackage />} />
                            <Route path="services" element={<ServicesUnderProductPackage />} />
                            <Route path="extensions" element={<ProductPackageExtensions />} />
                        </Route>
                    </>}

                    {/* Upcoming Service */}
                    {user?.allowed_origins?.some(access => ['vfcr_up_service_read', 'vfcr_up_service_write'].includes(access)) && <>
                        <Route path='/upcoming' element={<PrivateRoute element={<UpcomingServices />} isAuthenticated={isAuthenticated} />} />
                    </>}

                    {/* Registered */}
                    <Route path='/registered' element={<PrivateRoute element={<RegisteredService />} isAuthenticated={isAuthenticated} />} />
                    <Route path='/registered/:reg_no' element={<PrivateRoute element={<RegisteredView />} isAuthenticated={isAuthenticated} />} />


                    {/* Completed */}
                    <Route path='/completed' element={<PrivateRoute element={<CompletedService />} isAuthenticated={isAuthenticated} />} />
                    <Route path='/completed/service-job/:service_srl_no' element={<PrivateRoute element={<ServiceJob />} isAuthenticated={isAuthenticated} />} >
                        <Route index element={<ServiceJob />} />
                        <Route path="pl/:pl_product_id" index element={<ProductLogInfo />} />
                        <Route path="pp/:pp_product_id" index element={<PurchaseLogInfo />} />
                    </Route>

                    {/* App Config */}
                    {user?.allowed_origins?.includes('vfcr_appConfig_write') && <>
                        <Route path='/app-config' element={<PrivateRoute element={<AppConfig />} isAuthenticated={isAuthenticated} />} />

                        {/* Package */}
                        <Route path='/app-config/service-packages' element={<PrivateRoute element={<ServicePackages />} isAuthenticated={isAuthenticated} />} />
                        <Route path='/app-config/service-packages/:package_id' element={<PrivateRoute element={<ViewServicePackage />} isAuthenticated={isAuthenticated} />} />

                        {/* Category */}
                        <Route path='/app-config/service-categories' element={<PrivateRoute element={<ServiceCategory />} isAuthenticated={isAuthenticated} />} />

                        {/* Form Resources */}
                        <Route path='/app-config/form-resources' element={<PrivateRoute element={<FormResources />} isAuthenticated={isAuthenticated} />} />
                        <Route path='/app-config/form-resources/:stretcher_model/:title' element={<PrivateRoute element={<ResourceStretcher />} isAuthenticated={isAuthenticated} />} />
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
        window.location.href = `${env.REDIRECT_URL}?page=home`;
        return null;
    }

    return element;
}

