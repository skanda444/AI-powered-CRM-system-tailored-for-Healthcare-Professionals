//hooks help you reuse logic in different parts of your app without repeating code.
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface UseAnimatedFormFieldProps {
  fieldName: string;
}

export const useAnimatedFormField = ({ fieldName }: UseAnimatedFormFieldProps) => {
  const [animate, setAnimate] = useState(false);
  const { isFormUpdated, lastUpdatedField } = useSelector((state: RootState) => state.interaction);
  
  useEffect(() => {
    if (isFormUpdated && lastUpdatedField === fieldName) {
      setAnimate(true);
      
      const timeout = setTimeout(() => {
        setAnimate(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [isFormUpdated, lastUpdatedField, fieldName]);
  
  return animate ? 'animate-form-update' : '';
};

export default useAnimatedFormField;