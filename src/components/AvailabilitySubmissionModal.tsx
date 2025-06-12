import React, { useState } from "react"
import { Form } from "react-router-dom"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { Dialog, DialogPanel, Fieldset, Input, Button } from "@headlessui/react"
import { formatISO } from "date-fns"


type AvailabilitySubmissionModalProps  = {
    isOpen: boolean
    onClose: () => void
    selectedTimes: Date[]
    showtimeID: string
}

const AvailabilitySubmissionModal: React.FC<AvailabilitySubmissionModalProps> = (
    {
        isOpen,
        onClose,
        selectedTimes,
        showtimeID
    }
) => {
    const [name, setName] = useState("");

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
              {/* Background overlay */}
              <div className="fixed inset-0 bg-background/50" aria-hidden="true" />
        
              {/* Centered modal panel */}
              <div className="fixed inset-0 flex items-center justify-center">
                <DialogPanel className="relative w-full max-w-md rounded-lg bg-surface">
                  {/* Close button */}
                  <Button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </Button>
                  <Form 
                    action="/actions/submit-availability"
                    method='post' 
                    className='flex flex-col p-5 lg:p-10 rounded-md min-w-[200px] bg-surface gap-2'>
                        <h2 className='text-2xl text-text-primary'>Continue as Guest</h2>
                        <Fieldset className='w-full'>
                            <Input
                                name='name'
                                className='w-full px-4 py-2 mt-1 mb-2 rounded-md bg-white/5 text-text-primary focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-primary-soft/50'
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder='Enter your name...'
                            />

                            <Input type='hidden' name='availability_data' value={JSON.stringify(selectedTimes.map(d => formatISO(d)))}/>
                            <Input type='hidden' name='showtime_id' value={showtimeID}/>
                        </Fieldset>
                        <Button
                            type='submit' 
                            className='self-end w-1/4 p-2 text-center rounded bg-primary text-text-primary'
                        >
                            Continue
                        </Button>
                    </Form>
                </DialogPanel>
              </div>
            </Dialog>
    )
}

export default AvailabilitySubmissionModal