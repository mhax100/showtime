import React from "react"
import { Checkbox, Button } from '@headlessui/react'
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'


type UserListItemProps  = {
    id: string;
    name: string;
    checked: boolean;
    onChange: (id: string, checked: boolean) => void;
    onEdit?: (userId: string) => void;
    onDelete?: (userId: string) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({id, name, checked, onChange, onEdit, onDelete}) => {

    return (
        <div 
            key={id}
            className='flex items-center justify-between w-full gap-2 text-text-secondary'>
            <div className='flex items-center gap-2'>
                <Checkbox
                    checked={checked}
                    onChange={(isChecked) => onChange(id, isChecked)}
                    className="block border rounded bg-background group size-4 data-checked:bg-primary-soft data-checked:border-primary-soft"
                    >
                    {/* Checkmark icon */}
                    <svg className="opacity-0 stroke-background group-data-checked:opacity-100" viewBox="0 0 14 14" fill="none">
                        <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    </Checkbox>
                {name}
            </div>
            <div className="flex justify-between gap-1">
                {onEdit && (
                    <Button
                        onClick={() => onEdit(id)}
                        className="p-1 rounded text-text-secondary hover:text-primary hover:bg-primary-soft/25"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </Button>
                )}
                {onDelete && (
                    <Button
                        onClick={() => onDelete(id)}
                        className="p-1 rounded text-text-secondary hover:text-primary hover:bg-primary-soft/25"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </Button>
                )}
            </div>
            
        </div>
    )
}

export default UserListItem;