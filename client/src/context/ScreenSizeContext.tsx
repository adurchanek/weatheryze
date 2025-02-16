import React, { createContext, useContext, ReactNode } from "react";
import useIsSmallScreen from "../hooks/useIsSmallScreen";

interface ScreenSizeContextType {
  isSmallScreen: boolean;
}

const ScreenSizeContext = createContext<ScreenSizeContextType | undefined>(
  undefined,
);

export const ScreenSizeProvider = ({ children }: { children: ReactNode }) => {
  const isSmallScreen = useIsSmallScreen(640);
  return (
    <ScreenSizeContext.Provider value={{ isSmallScreen }}>
      {children}
    </ScreenSizeContext.Provider>
  );
};

export const useScreenSize = (): ScreenSizeContextType => {
  const context = useContext(ScreenSizeContext);
  if (!context) {
    throw new Error("useScreenSize must be used within a ScreenSizeProvider");
  }
  return context;
};
