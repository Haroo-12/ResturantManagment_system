
import React, { useContext } from 'react'
import { MapPin, Phone, ShoppingCart } from "lucide-react";
import { AddtocartContexts } from '../AddtocartContext/Addtocartcontext';
import logo from '../assets/logo.jpg'

const infoChips = [
  { id: 1, icon: MapPin, label: 'Delivery', value: 'Abdullah Shah', visibility: 'flex' },
  { id: 2, icon: Phone, label: '', value: '03149234050', visibility: 'hidden lg:flex' },
];

const actionButtons = [
  { id: 1, icon: ShoppingCart, name: 'Cart' },
];

const circleBtn = 'w-[38px] h-[38px] md:w-[40px] md:h-[40px] rounded-full shadow bg-white flex justify-center items-center shrink-0';

const Navbor = ({ hideCart = false }) => {
  const { count, setCartOpen } = useContext(AddtocartContexts);

  return (
    <header className="relative flex w-full h-[64px] md:h-[80px] lg:h-[90px] items-center justify-between gap-2 px-3 sm:px-5 lg:px-10 bg-[#fafafae1] shadow-xl border-b border-gray-50">

      {/* Left location */}
      <div className="flex items-center gap-2 bg-white h-[40px] md:h-[46px] lg:h-[50px] shadow px-2 lg:px-4 rounded-full min-w-0">
        <span className="w-8 h-8 bg-[#DDDDDD] rounded-full flex justify-center items-center shrink-0">
          <MapPin size={17} />
        </span>

        <div className="min-w-0">
          <p className="font-bold text-[10px] sm:text-xs lg:text-sm leading-tight">
            Delivery
          </p>
          <p className="font-bold text-xs lg:text-base leading-tight truncate">
            Abdullah Shah
          </p>
        </div>
      </div>

      {/* Center logo */}
      <div className="absolute z-50 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 md:top-[14px] md:translate-y-0 lg:top-[16px] pointer-events-none">
        <img
          src={logo}
          alt="Restaurant Logo"
          className="w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] md:w-[100px] md:h-[100px] lg:w-[110px] lg:h-[110px] rounded-full object-contain"
        />
      </div>

      {/* Right phone number and cart */}
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">

        <div className="hidden lg:flex items-center gap-2 bg-white h-[50px] shadow px-4 rounded-full">
          <span className="w-8 h-8 bg-[#DDDDDD] rounded-full flex justify-center items-center shrink-0">
            <Phone size={17} />
          </span>
          <p className="font-bold text-sm leading-tight">
            03149234050
          </p>
        </div>

        <button
          type="button"
          aria-label="Contact information"
          className={`${circleBtn} lg:hidden`}
        >
          <Phone size={17} />
        </button>

        {!hideCart && actionButtons.map(({ id, icon: Icon, name }) => (
          <button
            key={id}
            type="button"
            aria-label={name}
            className={`${circleBtn} relative`}
            onClick={() => setCartOpen(true)}
          >
            <Icon size={17} />

            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center justify-center">
              {count || 0}
            </span>
          </button>
        ))}

      </div>
    </header>
  )
}

export default Navbor
