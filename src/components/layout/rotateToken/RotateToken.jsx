import { useEffect } from 'react'
import Cookies from 'js-cookie';
import { api } from "../../../api";

const RotateToken = () => {

    useEffect(() => {
        const interval = setInterval(() => {

            const refreshToken = Cookies.get('_rfs_tkn'); // Retrieve the refresh token

            api.ttSv2Axios.post('/auth/rotate-token', { refresh_token: refreshToken }).then((response) => {

                const cookieOptions = {
                    secure: false,
                    sameSite: 'lax',
                    path: '/',
                    expires: 40
                };

                Cookies.set('_acc_tkn', response?.access_token, cookieOptions);

            })
        }, 4 * 60 * 60 * 1000);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [])

    // 4 * 60 * 60 * 1000

    return;
}

export default RotateToken