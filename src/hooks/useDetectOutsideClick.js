import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for handling clicks outside of a specified element.
 */
export const useDetectOutsideClick = (initialState) => {
  const triggerRef = useRef(null); // The button that opens the menu
  const nodeRef = useRef(null); // The menu dropdown itself
  const [isActive, setIsActive] = useState(initialState);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is on the trigger button, let it handle the toggle
      if (triggerRef.current && triggerRef.current.contains(event.target)) {
        return;
      }
      
      // If the click is outside the dropdown menu, close it
      if (nodeRef.current && !nodeRef.current.contains(event.target)) {
        setIsActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Clean up the event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array means this effect runs only once

  const toggle = () => setIsActive(!isActive);

  return { triggerRef, nodeRef, isActive, toggle };
};