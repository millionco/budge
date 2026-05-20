import type { Metadata } from "next";
import { LegalFooter } from "@/components/legal-footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Expect",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 font-['ABC_Diatype',system-ui,sans-serif] text-sm/6 text-neutral-800 dark:text-neutral-200">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">
        Privacy Policy
      </h1>
      <p className="mb-10 text-neutral-500 dark:text-neutral-400">Last updated Dec 13, 2025</p>

      <div className="space-y-6 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutral-950 [&_h2]:dark:text-white [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:font-semibold [&_h3]:text-neutral-950 [&_h3]:dark:text-white [&_p]:text-neutral-600 [&_p]:dark:text-neutral-400 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-neutral-600 [&_ul]:dark:text-neutral-400 [&_li]:mb-2">
        <p>
          Million Software, Inc. (&ldquo;Million Software&rdquo;, &ldquo;we&rdquo; or
          &ldquo;us&rdquo;) maintains strong commitment to respecting privacy and securing shared
          information. This Privacy Policy explains how the company collects, uses, discloses, and
          processes personal data when using Million Software&apos;s software, platform, APIs,
          Documentation, and related tools, including the website, and all related software for
          building, deploying, hosting, and managing software projects (&ldquo;Service&rdquo;). It
          describes how you can access and update personal information and outlines available data
          protection rights under applicable laws. By accessing or using the Service, you
          acknowledge consent to these practices.
        </p>
        <p>
          This Privacy Policy does not apply when Million Software acts as a data processor handling
          personal data on behalf of commercial customers using commercial services, such as
          employer-provisioned accounts. Such use is governed by applicable customer agreements.
        </p>

        <h2>1. Personal data we collect</h2>

        <h3>A. Personal data you provide directly</h3>
        <ul>
          <li>
            <strong>Account Information:</strong> Name and email address collected upon account
            signup or information requests
          </li>
          <li>
            <strong>Payment Information:</strong> Collected when accessing paid Expect products and
            services
          </li>
          <li>
            <strong>Inputs and Suggestions:</strong> Content submitted generates responses; personal
            data or external content references in Inputs are collected and may be reproduced in
            Suggestions
          </li>
          <li>
            <strong>Communication Information:</strong> Name, contact information, and message
            contents from direct communication
          </li>
          <li>
            <strong>Feedback:</strong> Ideas, suggestions for improvement, or Suggestion ratings
            stored as part of exchanges
          </li>
        </ul>

        <h3>B. Personal data received from Service use</h3>
        <ul>
          <li>
            <strong>Device Information:</strong> Device type, browser information, operating system,
            mobile network or ISP details
          </li>
          <li>
            <strong>Log Information:</strong> Service performance data including IP address, browser
            type and settings, error logs, and interaction methods
          </li>
          <li>
            <strong>Usage Data:</strong> Access dates and times, browsing history, search
            information, clicked links, viewed pages, and usage patterns
          </li>
          <li>
            <strong>Cookies &amp; Similar Technologies:</strong> Cookies, pixels, scripts, or
            similar technologies operate and manage the Service and improve experience
          </li>
          <li>
            <strong>Location Information:</strong> Geographic location determined from IP address
            for security and performance
          </li>
        </ul>

        <h3>C. Information Not Collected</h3>
        <p>
          Million Software does not knowingly collect sensitive or special category personal
          information including genetic data, biometric data for identification, health information,
          or religious information. The company does not knowingly collect information from children
          under 18. Upon discovering or suspecting a user under 18, Million Software investigates
          and deletes personal data and/or the account if appropriate.
        </p>

        <h2>2. How we use personal data</h2>
        <p>Personal data may be used for:</p>
        <ul>
          <li>Providing and maintaining the Service, including optional enhancement features</li>
          <li>
            Creating, managing, and administering accounts, including payment facilitation and
            inquiry responses
          </li>
          <li>
            Improving and developing the Service through research, debugging, and identifying or
            repairing functionality issues
          </li>
          <li>Communicating with users regarding updates, Service information, and events</li>
          <li>
            Preventing, detecting, and investigating fraud, abuse, security incidents, and Terms of
            Service violations
          </li>
          <li>
            Complying with legal obligations and protecting user rights, safety, privacy, and
            property
          </li>
          <li>Investigating and resolving disputes or security issues</li>
          <li>Enforcing Terms of Service and applicable agreements</li>
        </ul>
        <p>
          We do not use Inputs or Suggestions to train our models, or permit third parties to use
          them for training, unless: (1) they are flagged for security review, (2) you explicitly
          report them to us (for example, as Feedback), or (3) you&apos;ve explicitly agreed to
          their use for such training purposes.
        </p>
        <p>
          Aggregated or de-identified personal data may be used for described purposes.
          De-identified information is maintained in de-identified form and will not be reidentified
          except as required by law.
        </p>

        <h2>3. How we share personal data</h2>
        <p>Personal data may be disclosed in these circumstances:</p>
        <ul>
          <li>
            <strong>Service Providers and Business Partners:</strong> Third-party vendors and
            service providers supporting business operations and Service delivery and improvement
          </li>
          <li>
            <strong>Business Transfers:</strong> In merger, acquisition, restructuring, bankruptcy,
            or corporate transaction events, personal data may be disclosed to counterparties and
            advisers or transferred as part of the transaction
          </li>
          <li>
            <strong>Legal Compliance and Protection of Rights:</strong> Disclosure to government
            authorities or third parties when necessary for legal compliance, lawful requests
            response, safety or rights protection, fraud prevention, Terms of Service enforcement,
            or Million Software legal liability protection
          </li>
          <li>
            <strong>Affiliates:</strong> Entities controlling, controlled by, or under common
            control
          </li>
          <li>
            <strong>Third-Party Services and Integrations:</strong> Service integrations or links to
            third-party websites, applications, or services may result in personal data disclosure
            governed by their own terms and privacy policies
          </li>
          <li>
            <strong>Business Account Administrators:</strong> Account-related information disclosure
            to organizations when accounts are created using organizational email addresses
          </li>
          <li>
            <strong>With Your Consent:</strong> Personal data disclosure when permission is granted,
            including through Service-designed information sharing features
          </li>
        </ul>

        <h2>4. Retention</h2>
        <p>
          Million Software retains personal data only as long as necessary for effective Service
          operation and legitimate business needs including legal compliance, safety, dispute
          resolution, and agreement enforcement. Retention periods vary based on collection purpose,
          sensitivity, potential use or exposure risks, and applicable legal requirements.
        </p>
        <p>
          User settings may influence certain data retention duration. Temporary Service
          interactions may not appear in history and could be stored briefly for safety and system
          monitoring purposes.
        </p>
        <p>
          When personal data is no longer needed, Million Software and service providers follow
          deletion, erasure, de-identification, or anonymization procedures complying with
          applicable laws.
        </p>

        <h2>5. Security</h2>
        <p>
          Commercially reasonable technical and organizational measures protect personal data from
          loss, misuse, unauthorized access, disclosure, alteration, or destruction. However, no
          internet transmission or electronic storage method is completely secure. Users should
          exercise caution when deciding what information to share. Million Software is not
          responsible for circumventing privacy settings or security features on the Service or
          third-party linked websites.
        </p>

        <h2>6. Your rights and choices</h2>
        <p>
          Depending on residence location and applicable laws, users may have certain rights
          regarding personal data. These may include accessing, deleting, correcting, or
          transferring personal data; objecting to or restricting processing; or withdrawing consent
          where processing is consent-based. Users may also lodge complaints with local data
          protection authorities.
        </p>
        <p>
          To exercise these rights, contact support@million.dev. Million Software may request
          identity verification information before processing requests. The company will not
          discriminate against users exercising available privacy rights.
        </p>
        <p>Available rights may include:</p>
        <ul>
          <li>
            <strong>Right to know:</strong> Categories of collected personal data, use purposes, and
            third-party sharing types
          </li>
          <li>
            <strong>Access and portability:</strong> Requesting copies of held personal data and,
            where applicable, portable format provision
          </li>
          <li>
            <strong>Deletion:</strong> Personal data deletion collected in connection with Service
            use, subject to exceptions
          </li>
          <li>
            <strong>Correction:</strong> Inaccurate personal data correction
          </li>
          <li>
            <strong>Objection:</strong> Opposing certain processing types
          </li>
          <li>
            <strong>Restriction:</strong> Processing limitation in limited circumstances
          </li>
          <li>
            <strong>Withdrawal of consent:</strong> Where processing is consent-based
          </li>
          <li>
            <strong>No automated decisions:</strong> Million Software does not make solely automated
            processing decisions impacting legal rights or having similarly significant effects
          </li>
          <li>
            <strong>No sale or targeted advertising:</strong> The company does not
            &ldquo;sell&rdquo; or &ldquo;share&rdquo; personal data for cross-contextual behavioral
            advertising and does not process personal data for &ldquo;targeted advertising&rdquo;
            purposes
          </li>
        </ul>
        <p>
          Million Software processes personal data for described purposes on servers in various
          jurisdictions, including the United States. While data protection laws vary by country,
          outlined protections apply regardless of processing location.
        </p>

        <h2>7. Jurisdiction-Specific Disclosures</h2>
        <p>
          Some jurisdictions require specific personal data handling disclosures. This Privacy
          Policy supplements jurisdiction-specific requirements by providing additional collection
          purpose, data type, and legal basis details. See &ldquo;Personal data we collect,&rdquo;
          &ldquo;How we use personal data,&rdquo; and &ldquo;Retention&rdquo; sections above for
          additional information.
        </p>

        <h2>8. Privacy policy changes</h2>
        <p>
          Million Software may update this Privacy Policy periodically. Updated versions with
          effective dates are published at the top of this page unless legally required notice
          differs. Continued site use following Privacy Policy changes constitutes change
          acceptance.
        </p>

        <h2>9. Contacting us</h2>
        <p>Contact support@million.dev with Privacy Policy questions.</p>

        <LegalFooter />
      </div>
    </main>
  );
}
