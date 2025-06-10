import React, { useState } from "react"
import { Form } from "react-router-dom"
import { Fieldset, Input, Button } from "@headlessui/react"


type AvailabilitySubmissionModalProps  = {
    onSubmissionClick: () => void
}

const AvailabilitySubmissionModal: React.FC<AvailabilitySubmissionModalProps> = () => {
    const [name, setName] = useState("");

    return (
        <Form method='post' className='flex flex-col items-start w-1/4 p-5 lg:p-10 rounded-md min-w-[300px] bg-surface'>
            <h2 className='text-2xl text-text-primary'>Continue as Guest</h2>
            <Fieldset className='w-full mt-4'>
                <Input
                    name='movieName'
                    className='w-full px-4 py-2 mt-1 mb-2 rounded-md bg-white/5 text-text-primary focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-primary-soft/50'
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder='Enter your name...'
                />
                <Button
                    type='submit' 
                    className='w-full p-2 text-center rounded bg-primary text-text-primary'
                >
                    Continue
                </Button>
            </Fieldset>
        </Form>
    )
}

export default AvailabilitySubmissionModal