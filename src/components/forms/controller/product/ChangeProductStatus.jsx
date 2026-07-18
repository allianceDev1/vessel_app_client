import React, { useState } from 'react'
import InputText from '../../../UI_Primitives/inputs/InputText'
import Button from '../../../UI_Primitives/buttons/Button';
import { TbCircleCheck } from 'react-icons/tb';
import { api } from '../../../../api';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { modal, toast } from '../../../../redux/features/non_persisted/miniSystemSlice';

const ChangeProductStatus = ({ status, productId }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (text !== status) {
      return;
    }

    try {
      const res = await api.vfCv2Axios.post(`/product/${productId}/status`, { status })

      queryClient.refetchQueries({
        queryKey: ['controller_customer_product_info', productId],
      })

      dispatch(modal.pull.all())
      dispatch(toast.push({
        type: "success",
        head: status === 'CONNECT' ? 'Product Reconnected' : 'Product Disconnected',
        message: res?.message
      }))

    } catch (error) {
      dispatch(toast.push({
        type: "danger",
        head: 'Connection Failed',
        message: error?.message || 'Something went wrong'
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {status === 'CONNECT' && <p style={{ fontSize: '13px', color: 'var(--text-secondary-2)' }}>
        Current product currently disconnected from customer products list. Verify and continue the product
        connection to customer.
      </p>}

      {status === 'DISCONNECT' && <p style={{ fontSize: '13px', color: 'var(--text-secondary-2)' }}>
        The disconnection remove the product from customer product list. the technician and customer
        can access to the product after disconnection.
      </p>}

      <p style={{ marginTop: '30px', fontSize: '13px', color: 'var(--text-secondary-2)' }}>
        To proceed, Type <b>{status}</b> in the field below to confirm.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
        <InputText label={'Confirmation'} name={'verify_text'} value={text}
          required onChange={(e) => setText(e.target.value)} rightIcon={text === status && <TbCircleCheck />}
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          autoComplete={'off'}
          onKeyDown={(e) => {
            if (
              (e.ctrlKey || e.metaKey) &&
              ["c", "v", "x"].includes(e.key.toLowerCase())
            ) {
              e.preventDefault()
            }
          }} />
        <Button
          label={status === 'CONNECT' ? 'Reconnect' : 'Disconnect'}
          severity={status === 'CONNECT' ? 'success' : 'danger'} spinIcon={loading}
          rounded disabled={text !== status} />
      </form>
    </div>
  )
}

export default ChangeProductStatus