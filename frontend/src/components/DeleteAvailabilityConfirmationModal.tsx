import React, { useEffect } from "react"
import { useFetcher } from "react-router-dom"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { Dialog, DialogPanel, Fieldset, Input, Button } from "@headlessui/react"


type DeleteAvailabilityConfirmationModalProps  = {
    isOpen: boolean
    onClose: () => void
    eventID: string
    userID: string
    name: string
}

const DeleteAvailabilityConfirmationModal: React.FC<DeleteAvailabilityConfirmationModalProps> = (
    {
        isOpen,
        onClose,
        eventID,
        userID,
        name
    }
) => {
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
                    method='delete' 
                    className='flex flex-col p-5 lg:p-10 rounded-md min-w-[200px] bg-surface gap-2'>
                        <h2 className='text-2xl text-text-primary'>{`Please confirm you would like to delete availability for ${name}`}</h2>
                        <Fieldset className='w-full'>
                            <Input type='hidden' name='event_id' value={eventID}/>
                            <Input type='hidden' name='user_id' value={userID}/>
                            <Input type='hidden' name='action_type' value='delete'/>
                        </Fieldset>
                        <Button
                            type='submit' 
                            disabled={fetcher.state === "submitting"}
                            className='self-end w-auto px-4 py-2 text-center rounded bg-primary text-text-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'
                        >
                            {fetcher.state === "submitting" ? "Deleting..." : "Confirm"}
                        </Button>
                    </fetcher.Form>
                </DialogPanel>
              </div>
            </Dialog>
    )
}

export default DeleteAvailabilityConfirmationModal