import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { TbPhoto, TbX, TbZoomIn, TbZoomOut, TbZoomReset } from 'react-icons/tb'
import { api } from '../../../api'
import { page } from '../../../redux/features/non_persisted/miniSystemSlice'
import SkeletonGrid from '../../../components/UI_Primitives/skeleton/SkeletonGrid'
import ErrorState from '../../../components/UI_Primitives/ui-states/ErrorState'
import Button from '../../../components/UI_Primitives/buttons/Button'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25

const ServiceCardImageList = () => {
    const dispatch = useDispatch()
    const { product_id } = useParams()

    const [selectedImage, setSelectedImage] = useState(null)
    const [zoom, setZoom] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const dragStartRef = useRef({ x: 0, y: 0 })

    useEffect(() => {
        dispatch(page.config({ title: product_id || 'Service Cards', note: 'Service Card Images' }))
        // eslint-disable-next-line
    }, [product_id])

    const { data: images = [], isLoading, error } = useQuery({
        queryKey: ['service_card_images', product_id],
        queryFn: async () => {
            const res = await api.vfPv1Axios.get(`/service/service-card/images/${product_id}`)
            const list = Array.isArray(res) ? res : res?.data || res?.images || []

            return [...list].sort(
                (a, b) =>
                    (Number(b?.service_card_create_update_sequence_no) || 0) -
                    (Number(a?.service_card_create_update_sequence_no) || 0)
            )
        },
        enabled: !!product_id,
        staleTime: 60_000
    })

    const openFullScreen = (item) => {
        setSelectedImage(item)
        setZoom(1)
        setPosition({ x: 0, y: 0 })
    }

    const closeFullScreen = () => {
        setSelectedImage(null)
        setZoom(1)
        setPosition({ x: 0, y: 0 })
    }

    const handleZoomIn = (e) => {
        e?.stopPropagation()
        setZoom((prev) => Math.min(MAX_ZOOM, Number((prev + ZOOM_STEP).toFixed(2))))
    }

    const handleZoomOut = (e) => {
        e?.stopPropagation()
        setZoom((prev) => {
            const next = Math.max(MIN_ZOOM, Number((prev - ZOOM_STEP).toFixed(2)))
            if (next <= 1) setPosition({ x: 0, y: 0 })
            return next
        })
    }

    const handleZoomReset = (e) => {
        e?.stopPropagation()
        setZoom(1)
        setPosition({ x: 0, y: 0 })
    }

    const handleWheel = (e) => {
        e.preventDefault()
        if (e.deltaY < 0) {
            handleZoomIn()
        } else {
            handleZoomOut()
        }
    }

    const handlePointerDown = (e) => {
        if (zoom <= 1) return
        setIsDragging(true)
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        dragStartRef.current = { x: clientX - position.x, y: clientY - position.y }
    }

    const handlePointerMove = (e) => {
        if (!isDragging || zoom <= 1) return
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        setPosition({
            x: clientX - dragStartRef.current.x,
            y: clientY - dragStartRef.current.y
        })
    }

    const handlePointerUp = () => {
        setIsDragging(false)
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedImage) return
            if (e.key === 'Escape') closeFullScreen()
            if (e.key === '+' || e.key === '=') handleZoomIn()
            if (e.key === '-') handleZoomOut()
            if (e.key === '0') handleZoomReset()
        }

        if (selectedImage) {
            document.body.style.overflow = 'hidden'
            window.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [selectedImage])

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 12px' }}>
                <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <SkeletonGrid rows={3} columns={1} height={'260px'} gap={'15px'} />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <ErrorState
                icon={<TbPhoto />}
                title={'Data fetching failed'}
                message={error?.message || 'Unable to load service card images'}
                hight='400px'
            />
        )
    }

    if (!images.length) {
        return (
            <ErrorState
                icon={<TbPhoto />}
                title={'No service card images found'}
                hight='400px'
            />
        )
    }

    return (
        <div
            className="service-card-image-list-container"
            style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                padding: '20px 12px',
                boxSizing: 'border-box'
            }}
        >
            <div
                className="image-list"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    width: '100%',
                    maxWidth: '400px'
                }}
            >
                {images.map((item, index) =>
                    item?.image?.url ? (
                        <img
                            key={item?._id || item?.image?.key || index}
                            src={item.image.url}
                            alt={item?.image?.key || `Service Card ${item?.service_card_create_update_sequence_no ?? index + 1}`}
                            loading="lazy"
                            onClick={() => openFullScreen(item)}
                            style={{
                                width: '100%',
                                maxWidth: '400px',
                                height: 'auto',
                                borderRadius: '10px',
                                display: 'block',
                                objectFit: 'contain',
                                cursor: 'zoom-in'
                            }}
                        />
                    ) : null
                )}
            </div>

            {selectedImage && (
                <div
                    className="fullscreen-image-modal"
                    onClick={closeFullScreen}
                    onWheel={handleWheel}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        userSelect: 'none'
                    }}
                >
                    {/* Top Close Button */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            zIndex: 10001
                        }}
                    >
                        <Button
                            icon={<TbX />}
                            rounded
                            severity="secondary"
                            onClick={closeFullScreen}
                        />
                    </div>

                    {/* Fullscreen Image */}
                    <img
                        src={selectedImage?.image?.url}
                        alt={selectedImage?.image?.key || 'Service Card Fullscreen'}
                        draggable={false}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={handlePointerDown}
                        onTouchStart={handlePointerDown}
                        onDoubleClick={(e) => {
                            e.stopPropagation()
                            if (zoom > 1) {
                                handleZoomReset()
                            } else {
                                setZoom(2)
                            }
                        }}
                        style={{
                            maxWidth: '92vw',
                            maxHeight: '82vh',
                            objectFit: 'contain',
                            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                        }}
                    />

                    {/* Bottom Zoom Controls */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            bottom: '24px',
                            zIndex: 10001,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: 'var(--surface-2)',
                            padding: '8px 14px',
                            borderRadius: '30px',
                            border: '1px solid var(--border-light)'
                        }}
                    >
                        <Button
                            icon={<TbZoomOut />}
                            size="small"
                            rounded
                            outlined
                            severity="secondary"
                            disabled={zoom <= MIN_ZOOM}
                            onClick={handleZoomOut}
                        />
                        <span
                            style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                minWidth: '48px',
                                textAlign: 'center',
                                color: 'var(--text-primary)'
                            }}
                        >
                            {Math.round(zoom * 100)}%
                        </span>
                        <Button
                            icon={<TbZoomIn />}
                            size="small"
                            rounded
                            outlined
                            severity="secondary"
                            disabled={zoom >= MAX_ZOOM}
                            onClick={handleZoomIn}
                        />
                        <Button
                            icon={<TbZoomReset />}
                            size="small"
                            rounded
                            outlined
                            severity="secondary"
                            disabled={zoom === 1 && position.x === 0 && position.y === 0}
                            onClick={handleZoomReset}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default ServiceCardImageList
