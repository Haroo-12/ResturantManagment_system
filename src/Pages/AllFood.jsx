import { useState } from 'react'
import SearchBar from '../Components/SearchBar'
import TopNavbor from '../Components/TopNavbor'
import CategoryItems from '../Components/CategoryItems'

import Footer from './Footer'

const AllFood = () => {
  const [query, setQuery] = useState("");

  return (
    <div>
    <TopNavbor/>
    <SearchBar value={query} onChange={setQuery}/>
    <CategoryItems searchQuery={query}/>
    <Footer/>
    </div>
  )
}

export default AllFood
