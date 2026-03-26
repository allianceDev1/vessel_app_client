import React from 'react'
import './profile-list-card.scss'
import { getUserProfileImagePath } from '../../../../utils/services/customer_services';

const ProfileListCard = ({ full_name, description, rightContent }) => {

    const userProfileImage = getUserProfileImagePath(full_name);

    return (
        <div className="profile-list-card-container">
            <div className="left-div">
                <div className="image-div">
                    <img src={userProfileImage} alt='Profile' />
                </div>
                <div className="name-div">
                    <h4>{full_name}</h4>
                    <p>{description}</p>
                </div>
            </div>
            <div className="right-div">
                {rightContent}
            </div>
        </div>
    )
}

export default ProfileListCard