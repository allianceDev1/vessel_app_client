import React, { useEffect } from 'react'
import './not-found.scss'


function NotFound({ setPageHead }) {

    useEffect(() => {
        setPageHead({ title: "" })
        // eslint-disable-next-line
    }, [])

    return (
        <div className='not-found'>
            <div className="main">
                <h4>ALLIANCE</h4>
                <div className="text">
                    <p>404</p>
                    <p>That’s an error.</p>
                </div>
                <div className='comment'>
                    <p>The requested URL was not found on this server.</p>
                    <p>That’s all we know.</p>
                </div>
            </div>
        </div>
    )
}

export default NotFound