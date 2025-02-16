import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

interface CollapsibleCardProps {
  title: string;
  highlightColor?: string;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  highlightColor = "red-50",
  headerContent,
  children,
  footerContent,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  // Update content height when children change or on first render
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children]); // Recalculate if `children` changes

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <div className="bg-white overflow-hidden sm:rounded-lg rounded-xl">
      {/* Top bar / Title */}
      <h2
        className={`
          text-2xl font-light text-gray-700 text-center py-3
          border-l-4 border-l-sky-300 rounded-sm
          flex justify-between items-center px-4 bg-[#d8f0ff] tracking-wide
          ${
            !isMinimized ? `shadow-${highlightColor}` : "shadow-none border-b-0"
          }
        `}
      >
        <span className="px-1 xl:px-2 2xl:px-4">{title}</span>
        <button
          onClick={toggleMinimize}
          className="text-gray-600 hover:shadow-gray-400 transition duration-300"
        >
          <FontAwesomeIcon icon={isMinimized ? faChevronDown : faChevronUp} />
        </button>
      </h2>

      {/* Optional "header content" */}
      {headerContent && (
        <div
          className={`flex justify-center overflow-hidden transition-all duration-300 ${isMinimized ? "h-0 gap-0 mb-0 mt-0 opacity-0" : "h-[30px] sm:h-[40px] sm:gap-4 gap-4 mb-2 mt-4 opacity-100"}`}
        >
          {headerContent}
        </div>
      )}

      {/* Main body (chart, etc.) */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isMinimized ? "opacity-0" : `opacity-100`
        }`}
        style={{
          maxHeight: isMinimized ? 0 : `${contentHeight}px`,
        }}
        ref={contentRef}
      >
        {children}
      </div>

      {/* Bottom bar */}
      <div
        className={`
          text-gray-600 text-center items-center px-6 transition-all duration-300 
          ${isMinimized ? "bg-[#d8f0ff] border-l-4 border-l-sky-300" : "bg-white"}
        `}
        style={{
          height: isMinimized ? "10px mb-0" : "auto",
        }}
      >
        {/* Short line*/}
        <div
          className={`
            ${isMinimized ? "border-t-0 mb-0" : "border-t border-t-neutral-400 mb-5"} 
            w-full mx-auto  mb-5
          `}
        ></div>

        {/* Render any footer content if not minimized */}
        {!isMinimized && footerContent && footerContent}
      </div>
    </div>
  );
};

export default CollapsibleCard;
