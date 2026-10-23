import React from 'react';
import { FileText, Globe, MapPin, CalendarCheck, FileSearch, IndianRupee, Link2, Scale, Gavel, Mail } from 'lucide-react';
import LegalLayout, { LegalSection } from '../components/LegalLayout';

const sections: LegalSection[] = [
  {
    id: 'use-of-this-website', title: 'Use of This Website', icon: Globe,
    intro: 'By accessing or using this website, you agree to these Terms and Conditions and to comply with all applicable laws and regulations.',
    bullets: ['You must be at least 18 years old to use this website.', 'You agree to provide accurate and complete information.', 'You will not misuse the website or its content.'],
  },
  {
    id: 'property-information', title: 'Property Information & Availability', icon: MapPin,
    intro: 'We aim to keep information on our website accurate and up to date. However, details such as land size, price and availability may change without prior notice.',
    bullets: ['Images and maps are for representation purposes only.', 'We do not guarantee the availability of any property.', 'Final details will be confirmed during enquiry and site visit.'],
  },
  {
    id: 'enquiries-and-site-visits', title: 'Enquiries and Site Visits', icon: CalendarCheck,
    intro: 'Requests for site visits and other enquiries are subject to our confirmation.',
    bullets: ['We may contact you for additional details to process your request.', 'Site visits are scheduled based on availability and prior confirmation.'],
  },
  {
    id: 'land-documents', title: 'Land Documents & Due Diligence', icon: FileSearch,
    intro: 'It is the buyer’s responsibility to verify all documents, approvals and legal aspects before making any investment decision.',
    bullets: ['Check title, ownership and encumbrances independently.', 'Verify approvals from the relevant authorities.', 'Information on this website does not constitute legal or financial advice.'],
  },
  {
    id: 'pricing-disclaimer', title: 'Pricing and Investment Disclaimer', icon: IndianRupee,
    intro: 'Prices and returns mentioned on our website are indicative and are not a guarantee of future performance.',
    bullets: ['Land value appreciation and crop returns may vary.', 'We are not liable for any loss or damage arising from investment decisions.'],
  },
  {
    id: 'third-party-links', title: 'Third-Party Links', icon: Link2,
    intro: 'Our website may contain links to third-party sites. We are not responsible for their content or privacy practices.',
  },
  {
    id: 'limitation-of-liability', title: 'Limitation of Liability', icon: Scale,
    intro: 'To the extent permitted by law, IGO Agri Estates is not liable for any indirect or consequential loss arising from the use of this website or reliance on its content.',
  },
  {
    id: 'governing-law', title: 'Governing Law', icon: Gavel,
    intro: 'These Terms and Conditions are governed by the laws of India. Any dispute is subject to the jurisdiction of the courts at Chennai, Tamil Nadu.',
  },
  {
    id: 'contact-us', title: 'Contact Us', icon: Mail,
    intro: 'For questions about these Terms, write to bd2@igogroups.com or call +91 73977 89803. Head office: No. 17, Kovalan Street, 2nd Main Road, Uthandi Kanathur, Chennai – 600119, Tamil Nadu, India.',
  },
];

const Terms: React.FC = () => (
  <LegalLayout
    seoTitle="Terms & Conditions"
    seoDescription="Terms and conditions for using the IGO Agri Estates website, property enquiries, site visits and farm project services."
    canonical="/terms"
    heroIcon={FileText}
    titleLead="Terms &"
    titleAccent="Conditions"
    description="By using our website and services, you agree to these Terms and Conditions. Please read them carefully before proceeding."
    sections={sections}
  />
);

export default Terms;
