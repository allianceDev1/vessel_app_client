import React from 'react'
import './style.scss'

const Ui404 = () => {
    return (
        <div className="ui-404-comp">
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
    )
}

export default Ui404