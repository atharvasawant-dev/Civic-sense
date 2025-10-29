import React from 'react';
import Footer from '../components/Footer';

const Contact = () => (
  <div className="page-container">
    <div className="card">
      <h2 className="font-bold text-2xl mb-2 text-blue-900">Contact Us</h2>
      <p className="mb-4 text-gray-700">For support, feedback, or partnership inquiries, please email us at <a href="mailto:support@civicsense.com" className="text-blue-700 underline">support@civicsense.com</a>.</p>
      <p className="text-gray-600">We value your input and strive to improve our platform for all citizens.</p>
    </div>
    <Footer />
  </div>
);

export default Contact;
