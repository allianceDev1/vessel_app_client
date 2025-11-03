import React from 'react';
import './page404.scss';

const Page404 = () => {
  return (
    <div className='not-found-page'>
      <div className="color-temp-div">
        <div className="box box-one"></div>
        <div className="box box-two"></div>
        <div className="box box-three"></div>
        <div className="box box-four"></div>
      </div>
      <div className="main">
        <h4>ALLIANCE</h4>
        <div className="text">
          <p>404</p>
          <p>| That’s an error.</p>
        </div>
        <div className='comment'>
          <p>The requested URL was not found on this server.</p>
          <p>That’s all we know.</p>
        </div>
      </div>
    </div>
  );
}

export default Page404