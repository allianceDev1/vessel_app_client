import React, { useEffect } from 'react'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux';

const Home = () => {
    const dispatch = useDispatch();


    useEffect(() => {
        dispatch(page.setTitle({ title: 'My Page', note: "Page Note" }))
    }, [])

    return (
        <div>Home</div>
    )
}

export default Home