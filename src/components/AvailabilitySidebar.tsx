import React from "react"
import { Button } from "@headlessui/react"


type AvailabilitySideBarProps  = {
    numResponses: number
    onAddClick: () => void
}

const AvailabilitySideBar: React.FC<AvailabilitySideBarProps> = ({numResponses, onAddClick}) => {

    return (
        <div className='flex flex-col items-start justify-around h-full gap-10 md:w-1/6 md:gap-100'>
            <div className='flex items-center justify-start w-full gap-2'>
                <h3 className='text-2xl font-heavy text-text-secondary'>Responses</h3>
                <h5 className='text-2xl font-light text-text-secondary'>{`(${numResponses})`}</h5>
            </div>
            <Button onClick={onAddClick} className='p-2 rounded cursor-pointer text-primary data-hover:bg-primary-soft/25 '>+ Add avaiability</Button>
        </div>
    )
}

export default AvailabilitySideBar