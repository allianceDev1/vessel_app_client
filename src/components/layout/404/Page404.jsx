import React from 'react';
import './page404.scss';
import Ui404 from '../../UI_Primitives/404/Ui404';

const Page404 = () => {
  return (
    <div className='not-found-page'>
      <div className="border">
        <Ui404 />
      </div>
    </div>
  );
}

export default Page404