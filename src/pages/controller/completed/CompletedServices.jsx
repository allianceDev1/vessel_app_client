import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice';

const CompletedServices = () => {
    const dispatch = useDispatch();


    useEffect(() => {
        dispatch(page.setTitle({ title: 'Completed Services', note: "Completed service list and tracking." }))

        // eslint-disable-next-line
    }, [])

    return (
        <div></div>
    )
}

export default CompletedServices