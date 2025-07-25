import React from "react"
import { Button } from "@headlessui/react"
import type { User } from "../types/user"
import UserListItem from "./UserListItem"


type AvailabilitySideBarProps  = {
    userData: User[]
    onAddClick: () => void
    selectedUserIds: string[]
    onUserSelectionChange: (userId: string, checked: boolean) => void
}

const AvailabilitySideBar: React.FC<AvailabilitySideBarProps> = ({userData, onAddClick, selectedUserIds, onUserSelectionChange}) => {

    return (
        <div className='flex flex-col items-start justify-start h-full overflow-y-auto max-h-[calc(100vh-12rem)] scrollbar-hidden md:w-1/6 touch-pan-y'>
            <div className='flex items-center justify-start w-full gap-2'>
                <h3 className='text-2xl font-heavy text-text-secondary'>Responses</h3>
                <h5 className='text-2xl font-light text-text-secondary'>{`(${userData.length})`}</h5>
            </div>
            {userData.map((user) => {
                return (
                    <UserListItem 
                        key={user.id}
                        id={user.id} 
                        name={user.name} 
                        checked={selectedUserIds.includes(user.id)}
                        onChange={onUserSelectionChange}
                    />
                )
            })}
            {userData.length > 0 ? <Button onClick={onAddClick} className='p-2 mt-2 rounded cursor-pointer text-primary data-hover:bg-primary-soft/25 '>+ Add availability</Button> : <div></div>}
        </div>
    )
}

export default AvailabilitySideBar