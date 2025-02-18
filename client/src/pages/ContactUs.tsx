import React, { useEffect } from "react";

const ContactUs: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-center">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="text-gray-700 mb-4">
        Have any questions or feedback? Feel free to reach out to us.
      </p>
      <p className="text-lg font-semibold text-blue-600">
        Email:{" "}
        <a
          href="mailto:admin@weatheryze.com"
          className="underline hover:text-blue-800 transition duration-300"
        >
          admin@weatheryze.com
        </a>
      </p>
    </div>
  );
};

export default ContactUs;
