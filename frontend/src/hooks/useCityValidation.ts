import { useState, useCallback } from 'react';
import client from '../api/client';

interface CityValidationResult {
  isValid: boolean;
  city?: string;
  formattedAddress?: string;
  timezone?: string;
  coordinates?: { lat: number; lng: number };
  error?: string;
}

export const useCityValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<CityValidationResult | null>(null);

  const validateCity = useCallback(async (cityInput: string): Promise<CityValidationResult> => {
    if (!cityInput.trim()) {
      const result = { isValid: false, error: 'City is required' };
      setValidationResult(result);
      return result;
    }

    setIsValidating(true);
    try {
      const response = await client.post<CityValidationResult>('/validate-city', {
        city: cityInput
      });
      
      const result = response.data;
      setValidationResult(result);
      return result;
    } catch (error) {
      const result = { isValid: false, error: 'Failed to validate city' };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validateCity,
    clearValidation,
    isValidating,
    validationResult
  };
};