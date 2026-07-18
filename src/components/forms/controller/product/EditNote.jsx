import React, { useState } from 'react'
import TextArea from '../../../UI_Primitives/inputs/TextArea'
import Button from '../../../UI_Primitives/buttons/Button'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../../../../api'
import { useDispatch } from 'react-redux'
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice'


const EditNote = ({ note, productId }) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient()
    const [newNote, setNewNote] = useState(note)
    const [loading, setLoading] = useState(false)


    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true)
        try {
            await api.vfCv2Axios.put(`/product/${productId}/note`, { note: newNote })

            queryClient.refetchQueries({
                queryKey: ['controller_customer_product_info', productId],
            })

            dispatch(modal.pull.all())
            dispatch(toast.push({
                type: "success",
                head: 'Success!',
                message: 'Updated Successfully'
            }))
        } catch (error) {
            dispatch(toast.push({
                type: "danger",
                head: 'Updating Failed',
                message: error?.message || 'Something went wrong'
            }))
        } finally {
            setLoading(false)
        }
    }


    return (
        <div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                <TextArea label={'Product Note'} name={'note'} value={newNote} required
                    onChange={(e) => setNewNote(e.target.value)} />

                <Button label={'Edit Note'} rounded severity={'primary'} spinIcon={loading} disabled={loading} />
            </form>
        </div>
    )
}

export default EditNote