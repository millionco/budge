import type { Metadata } from "next";
import { LegalFooter } from "@/components/legal-footer";

export const metadata: Metadata = {
  title: "Terms of Service | Expect",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 font-['ABC_Diatype',system-ui,sans-serif] text-sm/6 text-neutral-800 dark:text-neutral-200">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">
        Terms of Service
      </h1>
      <p className="mb-10 text-neutral-500 dark:text-neutral-400">Last updated Dec 13, 2025</p>

      <div className="space-y-6 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutral-950 [&_h2]:dark:text-white [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:font-semibold [&_h3]:text-neutral-950 [&_h3]:dark:text-white [&_p]:text-neutral-600 [&_p]:dark:text-neutral-400">
        <p>
          Welcome, and thank you for your interest in Million Software, Inc. (&ldquo;Million
          Software,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;), makers of the Expect software
          platform. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of
          Million Software&apos;s software, platform, APIs, Documentation, and related tools,
          including the website, and all related software made available by Million Software to
          build, deploy, host, and manage software projects (collectively, the
          &ldquo;Service&rdquo;). By using the Service, you agree to these Terms.
        </p>
        <p>
          Please also read our Privacy Policy, which explains how we collect, use, disclose, and
          process personal data.
        </p>
        <p>
          If you are using the Service as part of your work for a company or organization that has a
          Master Services Agreement (&ldquo;MSA&rdquo;) with Million Software, your use of the
          Service is governed by that MSA.
        </p>
        <p>
          If you are entering into these Terms on behalf of an entity, you represent that you have
          the legal authority to bind that entity.
        </p>
        <p>If you have any questions or feedback, please email us at support@million.dev.</p>

        <h2>1. Access and Use</h2>

        <h3>1.1. Provision of Access.</h3>
        <p>
          Million Software is an applied research company working on automating coding. The Service
          offers a suite of coding tools driven by machine learning to help developers write code
          more easily and efficiently and can provide suggested code, outputs or other functions.
          Subject to your compliance with these Terms, Million Software grants you a limited right
          to access and use the Service.
        </p>

        <h3>1.2. Content.</h3>
        <p>
          You may provide inputs to the Service (&ldquo;Inputs&rdquo;) and receive code, outputs, or
          other functions based on the Inputs provided by you (collectively,
          &ldquo;Suggestions&rdquo;) (Inputs and Suggestions are collectively
          &ldquo;Content&rdquo;). We may use Content to provide the Service, comply with applicable
          law, enforce our terms and policies, and keep the Service safe. By submitting Inputs to
          the Service, you represent and warrant that you have all rights, licenses, and permissions
          that are necessary for us to process the Inputs under these Terms and to provide the
          Service to you.
        </p>

        <h3>1.3. Model Training.</h3>
        <p className="!uppercase !font-semibold">
          Million Software will not use Content to train, or allow any third party to train, any AI
          models, unless you&apos;ve explicitly agreed to the use of Content for training. You can
          find instructions in the Service for how to manage your preferences regarding the use of
          Inputs and Suggestions for training.
        </p>

        <h3>1.4. Limitations for Suggestions.</h3>
        <p>
          You acknowledge that Suggestions are generated automatically by machine learning
          technology and may be similar to or the same as Suggestions provided to other customers,
          and no rights to any Suggestions generated, provided, or returned by the Service for or to
          other customers are granted to you under these Terms. Further, you acknowledge that there
          are numerous limitations that apply with respect to Suggestions provided by large language
          and other AI models (each an &ldquo;AI Model&rdquo;), including that (i) Suggestions may
          contain errors or misleading information, (ii) AI Models are based on predefined rules and
          algorithms that lack the ability to think creatively and come up with new ideas and can
          result in repetitive or formulaic content, (iii) AI Models can struggle with understanding
          the nuances of language, including slang, idioms, and cultural references, (iv) AI Models
          can struggle with complex tasks that require reasoning, judgment and decision-making, and
          (v) data used to train AI models may be of poor quality or biased. You agree that you are
          responsible for evaluating, and bearing all risks associated with, the use of any
          Suggestions, including any reliance on the accuracy, completeness, or usefulness of
          Suggestions.
        </p>

        <h3>1.5. Use Restrictions.</h3>
        <p>
          Except and solely to the extent such a restriction is impermissible under applicable law,
          you may not: (i) reverse engineer, disassemble, decompile, decode, or otherwise attempt to
          derive or gain access to the source code, object code or underlying structure of the
          Service; (ii) reproduce, modify, translate, or create derivative works of the Service;
          (iii) rent, lease, lend, or sell the Service; (iv) remove any proprietary notices from the
          Service; (v) use the Service or any Suggestions to develop or train a model that is
          competitive with the Service, or engage in model extraction or theft attacks; (vi) probe,
          scan or attempt to penetrate the Service; (vii) provide to any third party the results of
          any benchmark tests of the Service, unless you include all necessary information for
          others to replicate the tests; (viii) harvest, scrape, or extract data from the Service;
          (ix) use the Service in any manner that infringes, misappropriates, or otherwise violates
          any third party&apos;s intellectual or other rights, or that violates any applicable laws
          or regulations; (x) send or otherwise provide to Million Software data or information that
          is subject to specific protections under applicable laws beyond any requirements that
          apply to &ldquo;personal information&rdquo; or &ldquo;personal data&rdquo; generally; or
          (xi) knowingly permit any third party to do any of the foregoing. You will promptly notify
          Million Software of any unauthorized use that comes to your attention and provide
          reasonable cooperation to prevent and terminate such use to the extent it is within your
          control.
        </p>

        <h3>1.6. Beta Services.</h3>
        <p>
          From time to time, Million Software may make Beta Services available to you. Beta Services
          shall be clearly designated as beta, pilot, limited release, non-production, early access,
          evaluation or a similar description. You may choose to use or not use such Beta Services
          in your sole discretion. Beta Services are intended for evaluation purposes and not for
          production use, are not fully supported, and may be subject to additional terms that may
          be presented to you. Beta Services are provided on an &ldquo;as-is&rdquo; and &ldquo;as
          available&rdquo; basis without any warranty, support, maintenance, or storage of any kind.
          Million Software may discontinue Beta Services at any time in its sole discretion and may
          never make them generally available.
        </p>
        <p className="!uppercase !font-semibold">
          Million Software shall have no liability whatsoever arising out of or in connection with
          Beta Services - use at your own risk.
        </p>

        <h3>1.7. Auto-Code Execution.</h3>
        <p>
          The Service may include a feature that automatically executes code Suggestions without
          manual review or confirmation, and will be clearly labeled accordingly. By enabling this
          feature, you acknowledge and agree that you are assuming all risks associated with the
          execution of automatically generated code, including without limitation system outages,
          software defects, data loss, and security vulnerabilities.
        </p>
        <p className="!uppercase !font-semibold">
          You are solely responsible for any impact resulting from use of this feature, including
          ensuring appropriate safeguards, testing, and monitoring are in place.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          You must be at least the age of majority in your jurisdiction (e.g., 18 years old in the
          United States) or 18 years old, whichever is higher, to use the Service. By agreeing to
          these Terms, you represent and warrant to us that: (a) you are at least 18 years old or
          the age of majority in your jurisdiction, whichever is higher; (b) you have not previously
          been suspended or removed from the Service; and (c) your registration and use of the
          Service is in compliance with all applicable laws in your region.
        </p>

        <h2>3. Account Registration and Access</h2>
        <p>
          To access most features of the Service, you must register for an account. When you
          register for an account, you may be required to provide us with information about
          yourself, such as your name, email address, or other contact information. You agree that
          the information you provide to us is accurate, complete, and not misleading, and that you
          will keep it accurate and up to date at all times. When you register, you will be asked to
          create a password. You are solely responsible for maintaining the confidentiality of your
          account and password, and you accept responsibility for all activities that occur under
          your account. If you believe that your account is no longer secure, you must immediately
          notify us at support@million.dev.
        </p>

        <h2>4. Payment Terms</h2>

        <h3>4.1. Paid Services.</h3>
        <p>
          Certain features of the Service may require you to pay fees. Before you pay any fees, you
          will have an opportunity to review and accept the fees that you will be charged. Unless
          otherwise specifically provided for in these Terms, all fees are in U.S. Dollars and are
          non-refundable, except as required by law.
        </p>

        <h3>4.2. Pricing.</h3>
        <p>
          Million Software reserves the right to determine pricing for the Service. Million Software
          will make reasonable efforts to keep pricing information published on the Service up to
          date. Million Software may change the fees for any feature of the Service, including
          additional fees or charges, if Million Software gives you advance notice of changes before
          they apply through the Service user interface, a pop-up notice, email, or through other
          reasonable means. Your continued use of the Service after the price change becomes
          effective constitutes your agreement to pay the changed amount.
        </p>

        <h3>4.3. Payment Processing.</h3>
        <p>
          To facilitate payment for the Service via bank account, credit card, or debit card, we use
          Stripe, Inc. and its affiliates (&ldquo;Stripe&rdquo;), a third-party payment processor.
          These payment processing services are provided by Stripe and are subject to the Stripe
          terms and conditions and other policies available at stripe.com/legal and Stripe&apos;s
          Global Privacy Policy available at stripe.com/privacy.
        </p>

        <h3>4.4. Subscription Service.</h3>
        <p>
          The Service may include certain subscription-based plans with automatically recurring
          payments for periodic charges (&ldquo;Subscription Service&rdquo;). The Subscription
          Service will begin on the Subscription Billing Date and continue for the subscription
          period that you select on your account, and will automatically renew for successive
          periods of the same duration unless you cancel the Subscription Service or we terminate
          it. You must cancel your Subscription Service at least 24 hours before it renews in order
          to avoid billing of the next periodic Subscription Fee to your account.
        </p>
        <p className="!uppercase !font-semibold">
          Your cancellation must be received before the renewal date in order to avoid charge for
          the next subscription period.
        </p>

        <h2>5. Ownership and Licenses</h2>

        <h3>5.1. Service.</h3>
        <p>
          Million Software and its licensors shall own and retain all right, title and interest in
          and to the Service, all improvements, enhancements or modifications thereto, and all
          intellectual property rights associated with the foregoing.
        </p>

        <h3>5.2. Feedback.</h3>
        <p>
          If you choose to provide input and suggestions regarding existing functionalities,
          problems with or proposed modifications or improvements to the Service
          (&ldquo;Feedback&rdquo;), then you grant Million Software the right to exploit the
          Feedback without restriction or compensation to you.
        </p>

        <h3>5.3. Content.</h3>
        <p>
          You retain all of your right, title, and interest that you have in Inputs, and Million
          Software hereby assigns to you all of our right, title, and interest if any in and to any
          Suggestions.
        </p>

        <h2>6. Third-Party Services</h2>
        <p>
          The Service may include or incorporate optional third-party services, including without
          limitation extensions and plug-ins that you may install yourself (&ldquo;Third-Party
          Services&rdquo;). Million Software will clearly indicate such content or features as
          Third-Party Services via prominent notices or descriptions in the Service. If you elect to
          access or use a Third-Party Service, your access and use is subject to the terms provided
          by that Third-Party Service.
        </p>

        <h2>7. Communications</h2>
        <p>
          We may send you emails concerning our products and services, as well as those of third
          parties. You may opt out of promotional emails by using any unsubscribe or similar
          functionality or instructions in the promotional email.
        </p>

        <h2>8. Modification of Terms</h2>
        <p>
          We may, from time to time, change these Terms. Please check these Terms periodically for
          changes. If we make any material modifications, we will notify you by updating the date at
          the top of these Terms. All modifications will be effective when they are posted, and your
          continued accessing or use of the Service will serve as confirmation of your acceptance of
          those modifications.
        </p>

        <h2>9. Termination</h2>
        <p>
          You may stop accessing the Services at any time. We reserve the right to modify, suspend,
          or discontinue the Services or your access to the Services, in whole or in part, at any
          time without notice to you. We will not be liable for any change to or any suspension or
          discontinuation of the Services or your access to them. Upon termination of these Terms,
          we may at our option delete any Content or other data associated with your account.
        </p>

        <h2>10. Modification of the Service</h2>
        <p>
          Million Software may modify or discontinue all or any portion of the Service at any time
          (including by limiting or discontinuing certain features of the Service), temporarily or
          permanently, without notice to you. Million Software will have no liability for any change
          to the Service.
        </p>

        <h2>11. Copyright Complaints</h2>
        <p>
          If you believe that your intellectual property rights have been infringed, please send
          notice to support@million.dev. We may delete or disable content that we believe violates
          these Terms or is alleged to be infringing and will terminate accounts of repeat
          infringers where appropriate.
        </p>

        <h2>12. Privacy</h2>
        <p>
          Please read the Million Software Privacy Policy carefully for information relating to our
          collection, use, storage, and disclosure of your personal data.
        </p>

        <h2>13. Indemnity</h2>
        <p>
          To the fullest extent permitted by law, you are responsible for your use of the Service,
          and you will defend and indemnify Million Software, its affiliates and each of their
          respective shareholders, directors, managers, members, officers, employees, consultants,
          and agents from and against any and all liabilities, claims, damages, expenses (including
          reasonable attorneys&apos; fees), and other losses arising out of or relating to: (1) your
          unauthorized use of, or misuse of, the Service; (2) your violation of any portion of these
          Terms; and (3) any claim that your Input violates any third-party intellectual property,
          publicity, confidentiality, privacy, or other rights.
        </p>

        <h2>14. Disclaimer of Warranties</h2>
        <p className="!uppercase !font-semibold">
          The Service and Suggestions are provided &ldquo;as is&rdquo; and on an &ldquo;as
          available&rdquo; basis. Million Software disclaims all warranties of any kind, whether
          express or implied, relating to the Service and Suggestions, including: (a) any implied
          warranty of merchantability, fitness for a particular purpose, title, quiet enjoyment, or
          non-infringement; and (b) any warranty arising out of course of dealing, usage, or trade.
          Million Software does not warrant that the Service or Suggestions will be uninterrupted,
          secure, or free of errors, viruses, or other harmful components.
        </p>

        <h2>15. Limitation of Liability</h2>
        <p className="!uppercase !font-semibold">
          To the fullest extent permitted by law, in no event will the Million Software entities be
          liable for any indirect, incidental, special, consequential or punitive damages arising
          out of or relating to these Terms, the Service, or Content. The aggregate liability of the
          Million Software entities to you for all claims is limited to the greater of: (a) the
          amount you have paid to Million Software for access to and use of the Service in the six
          (6) months prior to the event giving rise to the claim or (b) $100.
        </p>

        <h2>16. Dispute Resolution</h2>
        <p className="!uppercase !font-semibold">
          Please read this section carefully as it affects your rights.
        </p>
        <p>
          You agree that any and all disputes or claims that have arisen or may arise between you
          and Million Software will be resolved exclusively through final and binding arbitration,
          rather than a court, in accordance with this section, except that you may assert
          individual claims in small claims court. You agree that, by entering into these Terms, you
          and Million Software are each waiving the right to a trial by jury or to participate in a
          class action. The Federal Arbitration Act governs the interpretation and enforcement of
          this section.
        </p>
        <p>
          You may opt out of arbitration within 30 days of account creation by sending an email to
          support@million.dev from the email address used to create your account.
        </p>

        <h2>17. Miscellaneous</h2>
        <p>
          These Terms, including the Privacy Policy, and any other agreements expressly incorporated
          by reference into these Terms, are the entire and exclusive understanding and agreement
          between you and Million Software regarding your use of the Service. California law will
          govern these Terms except for its conflicts of laws principles.
        </p>
        <p>You may contact us by emailing us at support@million.dev.</p>

        <LegalFooter />
      </div>
    </main>
  );
}
