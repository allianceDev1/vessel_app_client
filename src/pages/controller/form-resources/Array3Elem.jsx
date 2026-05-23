import React, { useEffect } from 'react'
import './array-3-elem.scss'
import { useDispatch } from 'react-redux'
import { modal, page } from '../../../redux/features/non_persisted/miniSystemSlice';
import { useParams } from 'react-router-dom';
import { toStandardText } from '../../../utils/helpers/text-formatting';
import { api } from '../../../api';
import { useQuery } from '@tanstack/react-query';
import Button from '../../../components/UI_Primitives/buttons/Button';
import Dropdown from '../../../components/UI_Primitives/dropdown/Dropdown';
import { TbBox, TbDots, TbPencil, TbPlus, TbTrash } from 'react-icons/tb';
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid';
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState';
import Array3ElemCU from '../../../components/forms/controller/resources/Array3ElemCU';



const Array3Elem = ({ deleteData }) => {
    const dispatch = useDispatch();
    const {  title } = useParams()

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ['resources_values', title],
        queryFn: async () => {

            const data = await api.vfCv2Axios.get(`/resources/form-resources?titles=${title}`)
            return { title: data?.[0]?.title, values: data?.[0]?.values, title_stretcher: data?.[0]?.title_stretcher?.title_stretcher };
        },
        staleTime: 60_000
    })

    const editModel = (editUuid) => {
        const currenValues = data?.values?.find(v => v?.uuid === editUuid)

        dispatch(modal.push({
            title: 'Update Resource',
            body: <Array3ElemCU uuid={editUuid} stretcher={data?.title_stretcher} data={currenValues} isEditMode={true}
                title={data?.title} />
        }))
    }

    const createModel = () => {
        dispatch(modal.push({
            title: 'Create Resource',
            body: <Array3ElemCU stretcher={data?.title_stretcher} title={data?.title} />
        }))
    }

    useEffect(() => {
        dispatch(page.setTitle({
            title: toStandardText(title),
            note: 'Add, update and delete the resources'
        }))
        // eslint-disable-next-line
    }, [])

    if (isLoading || isFetching) {
        return <div style={{ marginTop: '15px' }}>
            <SkeletonGrid rows={8} columns={4} height={'100px'} gap={'10px'} responsive={{
                md: { rows: 6, columns: 1 },
            }} />
        </div>
    }

    if (error) {
        return <div>
            <ErrorState
                icon={<TbBox />}
                title={'Data fetching Failed'}
                message={error?.message}
                hight='400px'
            />
        </div>
    }

    return (
        <div className='array-3-elem-page-container'>
            <div className='top-section'>
                <Button icon={<TbPlus />} label={'Add'} rounded size='small' severity={'primary'} style={{ width: '100px' }}
                    onClick={createModel} />
            </div>
            <div class="masonry">
                {data?.values?.map((box) => {
                    return <div class="card" key={box?.uuid}>
                        <div className="top">
                            <h4>{box?.data?.[0]}</h4>
                            <Dropdown
                                button={{
                                    icon: <TbDots />,
                                    size: 'small',
                                    text: true
                                }}
                                list={[
                                    {
                                        items: [
                                            { icon: <TbPencil />, label: 'Update', onClick: () => editModel(box?.uuid) },
                                            { icon: <TbTrash />, label: 'Remove', theme: 'danger', onClick: () => deleteData(box?.uuid) },
                                        ],
                                    }
                                ]}
                            />
                        </div>
                        {box?.data?.map((d, index) => {
                            if (index === 0) return '';
                            return <div className="section">
                                <h5>{data?.title_stretcher?.[index]}</h5>
                                {d?.map((j, i) => <p key={i}> - {j}</p>)}
                            </div>
                        })}
                    </div>
                })}
            </div>
        </div>
    )
}

export default Array3Elem