import React from "react"
import { Button } from "@headlessui/react"
import type { User } from "../types/user"


type AvailabilitySideBarProps  = {
    userData: User[]
    onAddClick: () => void
}

const AvailabilitySideBar: React.FC<AvailabilitySideBarProps> = ({userData, onAddClick}) => {

    return (
        <div className='flex flex-col items-start justify-around h-full overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-hidden md:w-1/6'>
            <div className='flex items-center justify-start w-full gap-2'>
                <h3 className='text-2xl font-heavy text-text-secondary'>Responses</h3>
                <h5 className='text-2xl font-light text-text-secondary'>{`(${userData.length})`}</h5>
            </div>
            {userData.map((user) => {
                return (
                    <div 
                        key={user.id}
                        className='text-text-secondary'>
                        {user.name}
                    </div>
                )
            })}
            {userData.length > 0 ? <Button onClick={onAddClick} className='p-2 mt-2 rounded cursor-pointer text-primary data-hover:bg-primary-soft/25 '>+ Add availability</Button> : <div></div>}
        </div>
    )
}

export default AvailabilitySideBar