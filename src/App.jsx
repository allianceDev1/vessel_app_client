import React, { useEffect, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { changeThemeColor, connection } from './redux/features/persisted/systemSlice'
import SkeletonPage from './components/UI_Primitives/skeleton/SkeletonPage';
import Master from './Master';
import Cookies from 'js-cookie'


function App() {

  const dispatch = useDispatch()
  const colorMode = Cookies.get('color_mode')

  // Theme and Network
  useEffect(() => {
    dispatch(connection(navigator.onLine))

    const handleOnline = () => {
      dispatch(connection(true))
    };

    const handleOffline = () => {
      dispatch(connection(false))
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // setup theme
    dispatch(changeThemeColor(colorMode))
    // eslint-disable-next-line
  }, [])


  return (
    <div className="App">
      <Suspense fallback={<SkeletonPage />}>
        <Routes>
          <Route element={<Master />} path='/*' />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
