import React from 'react'
import SearchBar from '../Components/SearchBar'
import TopNavbor from '../Components/TopNavbor'
import CategoryItems from '../Components/CategoryItems'
import Navbor from '../HomeComponents/Navbor'
import Footer from './footer'

const AllFood = () => {
  return (
    <div>
    <TopNavbor/>
    <SearchBar/>
    <CategoryItems/>
    <Footer/>
    </div>
  )
}

export default AllFood
