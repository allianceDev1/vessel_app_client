import React from 'react';
import './layout404.scss';
import Ui404 from '../../UI_Primitives/404/Ui404';

const Layout404 = () => {
    return (
        <div className='not-found-layout'>
            <div className="color-temp-div">
                <div className="box box-one"></div>
                <div className="box box-two"></div>
                <div className="box box-three"></div>
                <div className="box box-four"></div>
            </div>
            <div className="border">
                <Ui404 />
            </div>
        </div>
    );
}

export default Layout404