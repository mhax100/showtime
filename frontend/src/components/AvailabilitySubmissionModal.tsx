import React, { useState, useEffect } from "react"
import { useFetcher } from "react-router-dom"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { Dialog, DialogPanel, Fieldset, Input, Button } from "@headlessui/react"
import { formatISO } from "date-fns"
import { fromZonedTime } from "date-fns-tz"


type AvailabilitySubmissionModalProps  = {
    isOpen: boolean
    onClose: () => void
    selectedTimes: Date[]
    eventID: string
    eventTimezone: string
}

const AvailabilitySubmissionModal: React.FC<AvailabilitySubmissionModalProps> = (
    {
        isOpen,
        onClose,
        selectedTimes,
        eventID,
        eventTimezone
    }
) => {
    const [name, setName] = useState("");
    const fetcher = useFetcher();
    
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data?.success) {
          onClose();
        }
      }, [fetcher.state, fetcher.data, onClose]);

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
              {/* Background overlay */}
              <div className="fixed inset-0 bg-background/50" aria-hidden="true" />
        
              {/* Centered modal panel */}
              <div className="fixed flex items-center justify-center inset-10">
                <DialogPanel className="relative w-full max-w-md rounded-lg bg-surface">
                  {/* Close button */}
                  <Button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </Button>
                  <fetcher.Form 
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

                            <Input type='hidden' name='availability_data' value={JSON.stringify(selectedTimes.map(d => formatISO(fromZonedTime(d, eventTimezone))))}/>
                            <Input type='hidden' name='event_id' value={eventID}/>
                        </Fieldset>
                        <Button
                            type='submit' 
                            disabled={fetcher.state === "submitting"}
                            className='self-end w-auto px-4 py-2 text-center rounded bg-primary text-text-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'
                        >
                            {fetcher.state === "submitting" ? "Submitting..." : "Continue"}
                        </Button>
                    </fetcher.Form>
                </DialogPanel>
              </div>
            </Dialog>
    )
}

export default AvailabilitySubmissionModal