import { ArrowRight } from "lucide-react";

const SearchBar = () => {
  return (
<div className="w-full flex justify-center lg:pt-10 pt-7">
    <div className="lg:w-[40%] w-[90%] flex items-center h-[44px] sm:h-[50px] md:h-[56px] pl-4 sm:pl-5 pr-1.5 bg-white rounded-full border border-gray-300 shadow-md">
      <input
        type="text"
        placeholder="Search for Iced Spanish..."
        className="flex-1 min-w-0 bg-transparent outline-none text-center text-xs sm:text-sm md:text-base text-gray-700 placeholder:text-gray-500"
      />

      <button className="shrink-0 grid place-items-center size-8 sm:size-9 md:size-11 rounded-full hover:cursor-pointer" style={{background:"var(--gradient-primary)", color:"var(--color-white)"}}>
        <ArrowRight className="size-4 sm:size-[18px] md:size-5" strokeWidth={2.5} />
      </button>
    </div>
</div>
  );
};

export default SearchBar;