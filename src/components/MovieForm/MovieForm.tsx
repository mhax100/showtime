import React, { useState } from 'react';
import DatePicker from './DatePicker';
import { Button, Fieldset, Input } from '@headlessui/react';
import { Form } from 'react-router-dom';
import { formatISO } from 'date-fns';

const MovieForm: React.FC = () => {
    const [name, setName] = useState("")
    const [location, setLocation] = useState("")
    const [selectedDates, setSelectedDates] = useState<Date[]>([])

    return (
        <Form 
            action="/actions/new-showtime"
            method='post' 
            className='flex flex-col items-start p-5 lg:p-10 rounded-md min-w-[300px] bg-surface'
        >
            <h2 className='text-2xl text-text-primary'>New Showtime</h2>
            <Fieldset className='w-full mt-4'>
                <Input
                    name='movieName'
                    className='w-full px-4 py-2 mt-1 mb-2 rounded-md bg-white/5 text-text-primary focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-primary-soft/50'
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder='Movie Name...'
                />
                <Input
                    name='location'
                    className='w-full px-4 py-2 mt-1 mb-2 rounded-md bg-white/5 text-text-primary focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-primary-soft/50'
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder='Location...'
                />
                <DatePicker selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
                <Input type='hidden' name='dates' value={JSON.stringify(selectedDates.map(d => formatISO(d)))}/>
                <Button
                    type='submit' 
                    className='w-full p-2 text-center rounded bg-primary text-text-primary'
                >
                    Create Showtime
                </Button>
            </Fieldset>
        </Form>
    );
};

export default MovieForm;