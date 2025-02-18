import React, { useEffect } from "react";

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-700 mb-4">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p className="text-gray-700">
          Welcome to <strong>Weatheryze</strong>. Your privacy is important to
          us. This Privacy Policy explains how we collect, use, and protect your
          personal information when you use our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          2. Information We Collect
        </h2>
        <p className="text-gray-700">
          We collect the following types of information when you use Weatheryze:
        </p>
        <ul className="list-disc list-inside text-gray-700 mt-2">
          <li>
            <strong>Authentication Data:</strong> We use AWS Cognito with Google
            Sign-In to handle user authentication. This includes your name,
            email address, and profile information provided by Google.
          </li>
          <li>
            <strong>Favorites & Preferences:</strong> We store your saved
            locations and preferences in our database.
          </li>
          <li>
            <strong>Search Data:</strong> When you search for a location, we
            send the location query to Open-Meteo to retrieve weather data. No
            personally identifiable information is shared.
          </li>
          <li>
            <strong>Usage Data:</strong> We collect logs and system performance
            metrics through AWS CloudWatch to maintain and improve our service.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3. How We Use Your Data</h2>
        <p className="text-gray-700">We use the collected data to:</p>
        <ul className="list-disc list-inside text-gray-700 mt-2">
          <li>Authenticate users and manage accounts.</li>
          <li>Provide weather forecasts based on your searches.</li>
          <li>Store and retrieve favorite locations.</li>
          <li>Monitor and enhance service performance using AWS CloudWatch.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
        <p className="text-gray-700">
          We implement industry-standard security measures to protect your data,
          including encryption and secure storage in AWS services. We do not
          sell, rent, or share your data with third-party advertisers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          5. Managing Your Information
        </h2>
        <p className="text-gray-700">
          You can manage your account settings through AWS Cognito (Google
          Sign-In). If you wish to delete your stored favorites, please contact
          us at <strong>support@weatheryze.com</strong>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          6. Changes to This Policy
        </h2>
        <p className="text-gray-700">
          We may update this Privacy Policy from time to time. Any changes will
          be posted on this page, and we encourage you to review it
          periodically.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">7. Contact Us</h2>
        <p className="text-gray-700">
          If you have any questions about this Privacy Policy, please contact us
          at <strong>support@weatheryze.com</strong>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
