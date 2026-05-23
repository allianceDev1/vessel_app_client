import React from 'react'
import ArrayElem from './ArrayElem';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { doDialog, toast } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../../api';
import Array3Elem from './Array3Elem';


const ResourceStretcher = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient()
  const { stretcher_model, title } = useParams()


  const deleteData = (uuid) => {

    if (!uuid) return;

    dispatch(doDialog.confirm({
      message: 'Do you want to delete these option?',
      accept: {
        onClick: async () => {
          try {
            await api.vfCv2Axios.delete(`/resources/form-resources/${title}/${uuid}`)
            queryClient.refetchQueries({ queryKey: ['resources_values', title] })
          } catch (error) {
            dispatch(toast.push({
              type: 'danger',
              head: 'Deletion failed',
              message: error.message
            }))
          }
        }
      }
    }))
  }

  return (
    <div className='resources-stretcher' style={{ marginTop: '20px' }}>

      {stretcher_model === 'arrayElem' && <ArrayElem deleteData={deleteData} />}
      {stretcher_model === 'array3Elem' && <Array3Elem deleteData={deleteData} />}

    </div>
  )
}

export default ResourceStretcher