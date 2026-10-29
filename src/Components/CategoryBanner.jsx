import React from 'react'

const CategoryBanner = ({category}) => {
  return (
    <div className='w-full lg:pt-10 pt-7 flex justify-center'>
      <div className='w-[95%] h-[100px]  lg:h-[340px] lg:rounded-2xl rounded-3xl flex justify-center items-center' style={{ background:"var(--gradient-primary)"}}>
        <h1 className='lg:text-7xl text-2xl font-bold' style={{color:"var(--color-white)"}}>{category.title}</h1>
      </div>
    </div>
  )
}

export default CategoryBanner
