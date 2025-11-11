import React, { useEffect } from 'react'
import './area-list.scss'
import { useDispatch } from 'react-redux';
import { page } from '../../../redux/features/non_persisted/miniSystemSlice'

const AreaList = () => {
    const dispatch = useDispatch();


    useEffect(() => {
        dispatch(page.setTitle({ title: 'Area List', note: "View all areas name base or technician base" }))
        // eslint-disable-next-line
    }, [])
    return (
        <div>AreaList</div>

        //??? Tomorrow start here

    )
}

export default AreaList