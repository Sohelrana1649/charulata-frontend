'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import ProductCard from './ProductCard';
import 'swiper/css';

interface ProductSliderProps {
  products: any[];
  wishlistArray?: any[];
  onWishlistToggle?: (id: string) => void;
}

export default function ProductSlider({ products, wishlistArray = [], onWishlistToggle }: ProductSliderProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="relative w-full">
      <Swiper
        grabCursor={true}
        modules={[Autoplay]}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={products.length > 5}
        spaceBetween={12}
        breakpoints={{
          320: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: 3,
            spaceBetween: 14,
          },
          900: {
            slidesPerView: 4,
            spaceBetween: 16,
          },
          1100: {
            slidesPerView: 5,
            spaceBetween: 16,
          },
        }}
        className="!py-1 !px-0.5"
      >
        {products.map((product) => {
          const isWishlisted = wishlistArray.some(
            (item: any) => (item._id || item.id || item)?.toString() === product._id?.toString()
          );

          return (
            <SwiperSlide key={product._id} className="!h-auto flex">
              <div className="w-full">
                <ProductCard
                  product={product}
                  isWishlisted={isWishlisted}
                  onWishlistToggle={onWishlistToggle}
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
