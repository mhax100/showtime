import React, { useState } from 'react';
import DatePicker from './DatePicker';
import { Button, Fieldset, Input, Select } from '@headlessui/react';
import { Form } from 'react-router-dom';
import { formatISO } from 'date-fns';
import { useCityValidation } from '../../hooks/useCityValidation';

const MovieForm: React.FC = () => {
    const [name, setName] = useState("")
    const [location, setLocation] = useState("")
    const [chain, setChain] = useState("All")
    const [selectedDates, setSelectedDates] = useState<Date[]>([])
    const [validatedCity, setValidatedCity] = useState<string>("")
    const [timezone, setTimezone] = useState<string>("")
    
    const { validateCity, isValidating, validationResult } = useCityValidation();

    const handleLocationBlur = async () => {
        if (location) {
            const result = await validateCity(location);
            if (result.isValid) {
                setValidatedCity(result.city!);
                setTimezone(result.timezone!);
                setLocation(result.city!); // Use custom city format instead of formatted address
            }
        }
    };

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
                    className={`w-full px-4 py-2 mt-1 mb-2 rounded-md bg-white/5 text-text-primary focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-primary-soft/50 ${
                        validationResult && !validationResult.isValid ? 'border border-red-500' : ''
                    }`}
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onBlur={handleLocationBlur}
                    required
                    placeholder='Enter city name...'
                />
                {isValidating && <p className="text-sm text-gray-500">Validating city...</p>}
                {validationResult && !validationResult.isValid && (
                    <p className="text-sm text-red-500">{validationResult.error}</p>
                )}
                <Select 
                    name='chain'
                    value={chain}
                    onChange={(e) => setChain(e.target.value)}
                    className='w-full px-4 py-2 mt-1 mb-2 rounded-md bg-white/5 text-text-primary focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-primary-soft/50'
                >
                    <option value="All">All Theaters</option>
                    <option value="Regal">Regal</option>
                    <option value="AMC">AMC</option>
                    <option value="Cinemark">Cinemark</option>
                </Select>
                <DatePicker selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
                <Input type='hidden' name='dates' value={JSON.stringify(selectedDates.map(d => formatISO(d)))}/>
                <Input type='hidden' name='timezone' value={timezone} />
                <Input type='hidden' name='validatedCity' value={validatedCity} />
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