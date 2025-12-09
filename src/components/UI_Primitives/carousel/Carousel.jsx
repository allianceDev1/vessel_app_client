import React, { useEffect, useRef, useState } from 'react'
import './carousel.scss'
import { TbChevronLeft, TbChevronRight } from 'react-icons/tb'

const Carousel = ({ elements, style, autoAnimation = false, interval = 3000, hideDots = false, hideButtons = false }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const intervalRef = useRef(null);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % elements.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + elements.length) % elements.length);
    };

    // Auto slide logic
    useEffect(() => {
        if (!autoAnimation || elements.length <= 1) return;

        intervalRef.current = setInterval(nextSlide, interval);

        return () => clearInterval(intervalRef.current);
    }, [autoAnimation, interval, elements.length]);

    /** Pause auto slide on interaction */
    const stopAuto = () => clearInterval(intervalRef.current);

    return (
        <div className="ui-carousel" onMouseEnter={stopAuto} onMouseLeave={() => {
            if (autoAnimation && elements.length > 1) {
                intervalRef.current = setInterval(nextSlide, interval);
            }
        }}>
            <div className="carousel-border">
                <div className="carousel__container">
                    <div
                        className="carousel__track"
                        style={{ ...style, transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {elements?.map((elem, index) => (
                            <div key={index} className="carousel__item">
                                {elem}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="carousel__button carousel__button--prev" onClick={prevSlide} aria-label="Previous">
                    {!hideButtons && <TbChevronLeft />}
                </div>
                <div className="carousel__button carousel__button--next" onClick={nextSlide} aria-label="Next">
                    {!hideButtons && <TbChevronRight />}
                </div>
            </div>
            {(!hideDots && elements.length > 1) && <div className="carousel__dots">
                {elements.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`carousel__dot ${index === currentSlide ? 'carousel__dot--active' : ''
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>}
        </div>
    )
}

export default Carousel