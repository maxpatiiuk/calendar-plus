import { useState, useEffect } from "react";

const useReducedMotion = (defaultVal = true) => {
  // Local state to store the reduced motion setting.
  const [reducedMotion, setReducedMotion] = useState(defaultVal);

  // Callback for media query cahnge events.
  function queryChangeHandler(event : any) {
    // Set the state to the value of the media query.
    setReducedMotion(event.target.matches);
  }

  useEffect(() => {
    // Grab the reduced motion media query,
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    if(mediaQuery) {
      // Set the state to the value of the media query.
      setReducedMotion(mediaQuery.matches);
    
      // Listen for changes in the media query.
      mediaQuery.addEventListener("change", queryChangeHandler);
    
      // Remove the event listener when the component unmounts.
      return () => mediaQuery.removeEventListener("change", queryChangeHandler);
    }
    return;
  }, []);

  return reducedMotion;
};

export default useReducedMotion;