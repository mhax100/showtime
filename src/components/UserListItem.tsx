import React, { useState } from "react"
import { Checkbox } from '@headlessui/react'


type UserListItemProps  = {
    id: string;
    name: string;
}

const UserListItem: React.FC<UserListItemProps> = ({id, name}) => {
    const [enabled, setEnabled] = useState(false)

    return (
        <div 
            key={id}
            className='flex items-center gap-2 text-text-secondary'>
            <Checkbox
                checked={enabled}
                onChange={setEnabled}
                className="block border rounded bg-background group size-4 data-checked:bg-primary-soft data-checked:border-primary-soft"
                >
                {/* Checkmark icon */}
                <svg className="opacity-0 stroke-background group-data-checked:opacity-100" viewBox="0 0 14 14" fill="none">
                    <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                </Checkbox>
            {name}
        </div>
    )
}

export default UserListItem;