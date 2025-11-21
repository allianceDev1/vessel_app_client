import React, { useEffect } from 'react'
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice'
import { useDispatch } from 'react-redux';
import Button from '../../../components/UI_Primitives/buttons/Button';

const Home = () => {
    const dispatch = useDispatch();


    const clickButton = () => {
        dispatch(modal.push({
            title: "Update Area Technician",
            body: <div>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo nam reprehenderit distinctio itaque eaque incidunt, totam eum id perspiciatis aut corporis minima provident, asperiores quod! Quia omnis nesciunt consectetur.</p>
                <h1>THE END</h1>
            </div>
        }))
    }


    useEffect(() => {
        dispatch(page.setTitle({ title: 'My Page', note: "Page Note" }))

        // eslint-disable-next-line
    }, [])

    return (
        <div>
            <Button label={'button'} onClick={clickButton} />
        </div>
    )
}

export default Home