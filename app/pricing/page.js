import React from "react";

const page = () => {
  return (
    <div className="p-3">
      <div class="pricing-container">
        <h1>Property Management Solutions</h1>

        <div class="pricing-table">
          {/* <!-- Feature Column (becomes first column on desktop) --> */}
          <div class="pricing-plan features">
            <div class="pricing-title">Features</div>
            <ul class="pricing-features">
              <h2 class="section-title">1. Marketing the Property</h2>
              <li>
                <span class="feature-name">
                  Property Listings (LettingsMate)
                </span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">
                  Property Listings (Rightmove, Zoopla, etc.)
                </span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">Viewing Management</span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">
                  Real-Time Communication Dashboard
                </span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">Tenant Pre-Qualification</span>{" "}
                <span class="feature-value">-</span>
              </li>

              <h2 class="section-title">2. Application & Referencing</h2>
              <li>
                <span class="feature-name">Essential Tenant Referencing</span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">Full Elite Referencing</span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">Digital Right to Rent Checks</span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">Statutory Documents Served</span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">Digital AST Creation & Signing</span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">
                  Deposit Collection & Protection
                </span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">Section 13 notice (AI)</span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">Section 48 Notice (AI)</span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">Document Management</span>{" "}
                <span class="feature-value">-</span>
              </li>

              <h2 class="section-title">3. Tenancy Setup & Onboarding</h2>
              <li>
                <span class="feature-name">Tenant & Landlord Portals</span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">Smart Compliance Alerts</span>{" "}
                <span class="feature-value">-</span>
              </li>

              <h2 class="section-title">4. Ongoing Tenancy Management</h2>
              <li>
                <span class="feature-name">Rent Collection (AI)</span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">Rent Collection (Human)</span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">Debt Collection (AI)</span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">
                  Work Order & Maintenance Management
                </span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">
                  Automated Workflows & Tenancy Renewals
                </span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">
                  Integrations with Xero, QuickBooks
                </span>{" "}
                <span class="feature-value">-</span>
              </li>

              <h2 class="section-title">5. Compliance & Legal Support</h2>
              <li>
                <span class="feature-name">Full Property Management Suite</span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">
                  Accounting & Financial Reporting
                </span>{" "}
                <span class="feature-value">-</span>
              </li>
              <li>
                <span class="feature-name">Legal Support & Evictions</span>{" "}
                <span class="feature-value">-</span>
              </li>
            </ul>
          </div>

          {/* <!-- Basic Plan --> */}
          <div class="pricing-plan">
            <div class="pricing-title">Starter</div>
            <div class="pricing-price">
              £29<span>/mo</span>
            </div>
            <ul class="pricing-features">
              <h2 class="section-title">1. Marketing the Property</h2>
              <li>
                <span class="feature-name">
                  Property Listings (LettingsMate)
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Property Listings (Rightmove, Zoopla, etc.)
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-no">×</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Viewing Management</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Real-Time Communication Dashboard
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Tenant Pre-Qualification</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">2. Application & Referencing</h2>
              <li>
                <span class="feature-name">Essential Tenant Referencing</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Full Elite Referencing</span>{" "}
                <span class="feature-value">
                  <span class="icon-no">×</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Digital Right to Rent Checks</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Statutory Documents Served</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Digital AST Creation & Signing</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Deposit Collection & Protection
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Section 13 notice (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-no">×</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Section 48 Notice (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-no">×</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Document Management</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">3. Tenancy Setup & Onboarding</h2>
              <li>
                <span class="feature-name">Tenant & Landlord Portals</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Smart Compliance Alerts</span>{" "}
                <span class="feature-value">
                  <span class="icon-limited">Limited</span>
                </span>
              </li>

              <h2 class="section-title">4. Ongoing Tenancy Management</h2>
              <li>
                <span class="feature-name">Rent Collection (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Rent Collection (Human)</span>{" "}
                <span class="feature-value">
                  <span class="icon-no">×</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Debt Collection (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-no">×</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Work Order & Maintenance Management
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Automated Workflows & Tenancy Renewals
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-limited">Basic</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Integrations with Xero, QuickBooks
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-no">×</span>
                </span>
              </li>

              <h2 class="section-title">5. Compliance & Legal Support</h2>
              <li>
                <span class="feature-name">Full Property Management Suite</span>{" "}
                <span class="feature-value">
                  <span class="icon-no">×</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Accounting & Financial Reporting
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-limited">Basic</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Legal Support & Evictions</span>{" "}
                <span class="feature-value">
                  <span class="icon-no">×</span>
                </span>
              </li>
            </ul>
            <a href="#" class="pricing-button">
              Get Started
            </a>
          </div>

          {/* <!-- Professional Plan (Popular) --> */}
          <div class="pricing-plan popular">
            <div class="popular-tag">Most Popular</div>
            <div class="pricing-title">Professional</div>
            <div class="pricing-price">
              £59<span>/mo</span>
            </div>
            <ul class="pricing-features">
              <h2 class="section-title">1. Marketing the Property</h2>
              <li>
                <span class="feature-name">
                  Property Listings (LettingsMate)
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Property Listings (Rightmove, Zoopla, etc.)
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Viewing Management</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Real-Time Communication Dashboard
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Tenant Pre-Qualification</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">2. Application & Referencing</h2>
              <li>
                <span class="feature-name">Essential Tenant Referencing</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Full Elite Referencing</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Digital Right to Rent Checks</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Statutory Documents Served</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Digital AST Creation & Signing</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Deposit Collection & Protection
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Section 13 notice (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Section 48 Notice (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Document Management</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">3. Tenancy Setup & Onboarding</h2>
              <li>
                <span class="feature-name">Tenant & Landlord Portals</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Smart Compliance Alerts</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">4. Ongoing Tenancy Management</h2>
              <li>
                <span class="feature-name">Rent Collection (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Rent Collection (Human)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Debt Collection (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Work Order & Maintenance Management
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Automated Workflows & Tenancy Renewals
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Integrations with Xero, QuickBooks
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">5. Compliance & Legal Support</h2>
              <li>
                <span class="feature-name">Full Property Management Suite</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Accounting & Financial Reporting
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Legal Support & Evictions</span>{" "}
                <span class="feature-value">
                  <span class="icon-limited">Basic</span>
                </span>
              </li>
            </ul>
            <a href="#" class="pricing-button">
              Get Started
            </a>
          </div>

          {/* <!-- Business Plan --> */}
          <div class="pricing-plan">
            <div class="pricing-title">Business</div>
            <div class="pricing-price">
              £99<span>/mo</span>
            </div>
            <ul class="pricing-features">
              <h2 class="section-title">1. Marketing the Property</h2>
              <li>
                <span class="feature-name">
                  Property Listings (LettingsMate)
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Property Listings (Rightmove, Zoopla, etc.)
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Viewing Management</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Real-Time Communication Dashboard
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Tenant Pre-Qualification</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">2. Application & Referencing</h2>
              <li>
                <span class="feature-name">Essential Tenant Referencing</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Full Elite Referencing</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Digital Right to Rent Checks</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Statutory Documents Served</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Digital AST Creation & Signing</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Deposit Collection & Protection
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Section 13 notice (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Section 48 Notice (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Document Management</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">3. Tenancy Setup & Onboarding</h2>
              <li>
                <span class="feature-name">Tenant & Landlord Portals</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Smart Compliance Alerts</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">4. Ongoing Tenancy Management</h2>
              <li>
                <span class="feature-name">Rent Collection (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Rent Collection (Human)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Debt Collection (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Work Order & Maintenance Management
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Automated Workflows & Tenancy Renewals
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Integrations with Xero, QuickBooks
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">5. Compliance & Legal Support</h2>
              <li>
                <span class="feature-name">Full Property Management Suite</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Accounting & Financial Reporting
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Legal Support & Evictions</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
            </ul>
            <a href="#" class="pricing-button">
              Get Started
            </a>
          </div>

          {/* <!-- Enterprise Plan --> */}
          <div class="pricing-plan">
            <div class="pricing-title">Enterprise</div>
            <div class="pricing-price">
              £199<span>/mo</span>
            </div>
            <ul class="pricing-features">
              <h2 class="section-title">1. Marketing the Property</h2>
              <li>
                <span class="feature-name">
                  Property Listings (LettingsMate)
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Property Listings (Rightmove, Zoopla, etc.)
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Viewing Management</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Real-Time Communication Dashboard
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Tenant Pre-Qualification</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">2. Application & Referencing</h2>
              <li>
                <span class="feature-name">Essential Tenant Referencing</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Full Elite Referencing</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Digital Right to Rent Checks</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Statutory Documents Served</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Digital AST Creation & Signing</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Deposit Collection & Protection
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Section 13 notice (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Section 48 Notice (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Document Management</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">3. Tenancy Setup & Onboarding</h2>
              <li>
                <span class="feature-name">Tenant & Landlord Portals</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Smart Compliance Alerts</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">4. Ongoing Tenancy Management</h2>
              <li>
                <span class="feature-name">Rent Collection (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Rent Collection (Human)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Debt Collection (AI)</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Work Order & Maintenance Management
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Automated Workflows & Tenancy Renewals
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Integrations with Xero, QuickBooks
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>

              <h2 class="section-title">5. Compliance & Legal Support</h2>
              <li>
                <span class="feature-name">Full Property Management Suite</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">
                  Accounting & Financial Reporting
                </span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span class="feature-name">Legal Support & Evictions</span>{" "}
                <span class="feature-value">
                  <span class="icon-yes">✓</span>
                </span>
              </li>
            </ul>
            <a href="#" class="pricing-button">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
