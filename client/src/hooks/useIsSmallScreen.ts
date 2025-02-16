import { useEffect, useState } from "react";

const useIsSmallScreen = (breakpoint = 640) => {
  const [isSmallScreen, setIsSmallScreen] = useState(
    window.innerWidth < breakpoint,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < breakpoint);
    };

    // Set initial value on mount
    handleResize();

    // Attach the resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup the listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isSmallScreen;
};

export default useIsSmallScreen;
