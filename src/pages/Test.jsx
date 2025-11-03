import React, { use, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { generateUniqueId } from '../assets/javascript/utils/generateId';
import Message from '../components/UI_Primitives/message/Message';
import Badge from '../components/UI_Primitives/badge/Badge';
import { Button } from '../components/UI_Primitives/buttons/Button';
import { FaArrowDown, FaEye, FaPlus, FaRegCircleCheck, FaSpinner, FaTrash } from 'react-icons/fa6';
import { FaEdit } from 'react-icons/fa';
import ButtonGroup from '../components/UI_Primitives/buttons/ButtonGroup';
import Dropdown from '../components/UI_Primitives/dropdown/Dropdown';
import { GrClose } from 'react-icons/gr';
import { toast, doDialog, modal } from '../redux/features/non_persisted/miniSystemSlice';
import InputText from '../components/UI_Primitives/inputs/InputText';
import Select from '../components/UI_Primitives/inputs/Select';
import Textarea from '../components/UI_Primitives/inputs/TextArea';
import MultiSelectInput from '../components/UI_Primitives/inputs/MultiSelect';
import Checkbox from '../components/UI_Primitives/inputs/Checkbox';
import Radio from '../components/UI_Primitives/inputs/Radio';
import InputPhoneNumber from '../components/UI_Primitives/inputs/InputPhoneNumber';
import Skeleton from '../components/UI_Primitives/skeleton/SkeletonGrid';
import SkeletonPage from '../components/UI_Primitives/skeleton/SkeletonPage';
import Table from '../components/UI_Primitives/table/Table';

const Test = () => {
  // Example
  const columns = [
    { header: 'Name', accessorKey: 'name', enableHiding: false, },
    { header: 'Email', accessorKey: 'email', meta: { className: 'col-id', style: { fontWeight: 'bold', color: 'red' } } },
    { header: 'Role', accessorKey: 'role', cellStyle: { color: 'blue', fontWeight: 'bold' } },
    // {
    //   header: 'Actions',
    //   cell: ({ row }) => (
    //     <div className="action-buttons">
    //       <button onClick={(e) => handleEdit(e, row.original)}>Edit</button>
    //       <button onClick={(e) => handleDelete(e, row.original)}>Delete</button>
    //     </div>
    //   ),
    //   enableSorting: false,
    //   enableColumnFilter: false,
    // },
  ];

  const list = Array.from({ length: 20 }, (_, i) => ({
    name: `User ${i + 1}`,
    // _rowStyle: { backgroundColor: '#e0f7fa', cursor: 'Pointer' },
    _rowClassName: 'row-user',
    _cellStyle: {
      // name: { fontWeight: 'bold', backgroundColor: '#e0f7fa' }
    },
    // _onClick: () => navigate(`/user/1`)
  }));




  return (
    <div style={{ padding: '50px', }}>

      <Button label={'Sign In Account'} severity={'primary'} />


    </div>
  )
}

export default Test