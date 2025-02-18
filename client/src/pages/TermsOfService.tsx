import React, { useEffect } from "react";

const TermsOfService: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-gray-700 mb-4">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
        <p className="text-gray-700">
          By using <strong>Weatheryze</strong>, you agree to be bound by these
          Terms of Service. If you do not agree, please do not use our service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Use of the Service</h2>
        <p className="text-gray-700">
          You may use Weatheryze to access weather forecasts and related
          services. You agree not to misuse the service, including but not
          limited to:
        </p>
        <ul className="list-disc list-inside text-gray-700 mt-2">
          <li>Attempting to disrupt or compromise our system security.</li>
          <li>Using automated scripts to extract data at scale.</li>
          <li>Engaging in any unlawful activity using our service.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          3. Accounts & Authentication
        </h2>
        <p className="text-gray-700">
          We use AWS Cognito with Google Sign-In for authentication. You are
          responsible for maintaining the security of your account and ensuring
          that your login credentials remain confidential.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Data Usage</h2>
        <p className="text-gray-700">
          We store your saved locations and preferences in our database. Weather
          data is retrieved from third-party sources (e.g., Open-Meteo), but no
          personal information is shared with them.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Service Availability</h2>
        <p className="text-gray-700">
          We strive to provide reliable weather data, but we do not guarantee
          uninterrupted service. We reserve the right to modify, suspend, or
          discontinue Weatheryze at any time without prior notice.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          6. Limitation of Liability
        </h2>
        <p className="text-gray-700">
          Weatheryze provides weather forecasts "as is" without any warranties.
          We are not responsible for inaccurate forecasts, service downtime, or
          any damages resulting from your use of the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          7. Changes to These Terms
        </h2>
        <p className="text-gray-700">
          We may update these Terms of Service at any time. Continued use of
          Weatheryze after changes take effect constitutes acceptance of the new
          terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">8. Contact Information</h2>
        <p className="text-gray-700">
          If you have any questions about these Terms, please contact us at{" "}
          <strong>support@weatheryze.com</strong>.
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;
