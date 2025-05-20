import React from "react";

const page = () => {
  return (
    <div className="p-3">
      <div className="pricing-container">
        <h1>Property Management Solutions</h1>

        <div className="pricing-table">
          {/* <!-- Feature Column (30% width on desktop) --> */}
          <div className="features pricing-plan">
            <div className="pricing-title">Rental Process Stage / Feature</div>
            <ul className="pricing-features">
              <h2 className="section-title">1. Marketing the Property</h2>
              <li>
                <span className="feature-name">
                  Property Listings (LettingsMate)
                </span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">
                  Property Listings (Rightmove, Zoopla, etc.)
                </span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">Viewing Management</span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">
                  Real-Time Communication Dashboard
                </span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">Tenant Pre-Qualification</span>
                <span className="feature-value">-</span>
              </li>

              <h2 className="section-title">2. Application & Referencing</h2>
              <li>
                <span className="feature-name">
                  Essential Tenant Referencing
                </span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">Full Elite Referencing</span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">
                  Digital Right to Rent Checks
                </span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">Statutory Documents Served</span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">
                  Digital AST Creation & Signing
                </span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">
                  Deposit Collection & Protection
                </span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">Section 13 notice (AI)</span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">Section 48 Notice (AI)</span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">Document Management</span>
                <span className="feature-value">-</span>
              </li>

              <h2 className="section-title">3. Tenancy Setup & Onboarding</h2>
              <li>
                <span className="feature-name">Tenant & Landlord Portals</span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">Smart Compliance Alerts</span>
                <span className="feature-value">-</span>
              </li>

              <h2 className="section-title">4. Ongoing Tenancy Management</h2>
              <li>
                <span className="feature-name">Rent Collection (AI)</span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">Rent Collection (Human)</span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">Debt Collection (AI)</span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">
                  Work Order & Maintenance Management
                </span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">
                  Automated Workflows & Tenancy Renewals
                </span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">
                  Integrations with Xero, QuickBooks
                </span>
                <span className="feature-value">-</span>
              </li>

              <h2 className="section-title">5. Compliance & Legal Support</h2>
              <li>
                <span className="feature-name">
                  Full Property Management Suite
                </span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">
                  Accounting & Financial Reporting
                </span>
                <span className="feature-value">-</span>
              </li>
              <li>
                <span className="feature-name">Legal Support & Evictions</span>
                <span className="feature-value">-</span>
              </li>
            </ul>
          </div>

          {/* <!-- Free Plan --> */}
          <div className="pricing-plan">
            <div className="plan-header">
              <div className="pricing-title">Free</div>
              <div className="pricing-price">
                £0<span>/mo</span>
              </div>
            </div>
            <ul className="pricing-features">
              <div className="section-title-placeholder">
                1. Marketing the Property
              </div>
              <li>
                <span className="feature-name">
                  Property Listings (LettingsMate)
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Property Listings (Rightmove, Zoopla, etc.)
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Viewing Management</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Real-Time Communication Dashboard
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Tenant Pre-Qualification</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                2. Application & Referencing
              </div>
              <li>
                <span className="feature-name">
                  Essential Tenant Referencing
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Full Elite Referencing</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Digital Right to Rent Checks
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Statutory Documents Served</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Digital AST Creation & Signing
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Deposit Collection & Protection
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Section 13 notice (AI)</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Section 48 Notice (AI)</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Document Management</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                3. Tenancy Setup & Onboarding
              </div>
              <li>
                <span className="feature-name">Tenant & Landlord Portals</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Smart Compliance Alerts</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                4. Ongoing Tenancy Management
              </div>
              <li>
                <span className="feature-name">Rent Collection (AI)</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Rent Collection (Human)</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Debt Collection (AI)</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Work Order & Maintenance Management
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Automated Workflows & Tenancy Renewals
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Integrations with Xero, QuickBooks
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                5. Compliance & Legal Support
              </div>
              <li>
                <span className="feature-name">
                  Full Property Management Suite
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Accounting & Financial Reporting
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Legal Support & Evictions</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
            </ul>
            <a href="#" className="pricing-button">
              Get Started
            </a>
          </div>

          {/* <!-- PAYG Plan  --> */}
          <div className="pricing-plan">
            <div className="plan-header">
              <div className="pricing-title">PAYG</div>
              <div className="pricing-price">
                £0<span>/mo</span>
              </div>
            </div>
            <ul className="pricing-features">
              <div className="section-title-placeholder" data-content="-">
                1. Marketing the Property
              </div>
              <li>
                <span className="feature-name">
                  Property Listings (LettingsMate)
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Property Listings (Rightmove, Zoopla, etc.)
                </span>
                <span className="feature-value">
                  <span className="icon-text">£30</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Viewing Management</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Real-Time Communication Dashboard
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Tenant Pre-Qualification</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                2. Application & Referencing
              </div>
              <li>
                <span className="feature-name">
                  Essential Tenant Referencing
                </span>
                <span className="feature-value">
                  <span className="icon-text">£7.50</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Full Elite Referencing</span>
                <span className="feature-value">
                  <span className="icon-text">£15</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Digital Right to Rent Checks
                </span>
                <span className="feature-value">
                  <span className="icon-text">£5</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Statutory Documents Served</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Digital AST Creation & Signing
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Deposit Collection & Protection
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Section 13 notice (AI)</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Section 48 Notice (AI)</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Document Management</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                3. Tenancy Setup & Onboarding
              </div>
              <li>
                <span className="feature-name">Tenant & Landlord Portals</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Smart Compliance Alerts</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                4. Ongoing Tenancy Management
              </div>
              <li>
                <span className="feature-name">Rent Collection (AI)</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Rent Collection (Human)</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Debt Collection (AI)</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Work Order & Maintenance Management
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Automated Workflows & Tenancy Renewals
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Integrations with Xero, QuickBooks
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                5. Compliance & Legal Support
              </div>
              <li>
                <span className="feature-name">
                  Full Property Management Suite
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Accounting & Financial Reporting
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Legal Support & Evictions</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
            </ul>
            <a href="#" className="pricing-button">
              Get Started
            </a>
          </div>

          {/* <!-- Standard Plan --> */}
          <div className="pricing-plan">
            <div className="plan-header">
              <div className="pricing-title">Standard</div>
              <div className="pricing-price">
                £30<span>/mo</span>
              </div>
            </div>
            <ul className="pricing-features">
              <div className="section-title-placeholder">
                1. Marketing the Property
              </div>
              <li>
                <span className="feature-name">
                  Property Listings (LettingsMate)
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Property Listings (Rightmove, Zoopla, etc.)
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Viewing Management</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Real-Time Communication Dashboard
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Tenant Pre-Qualification</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                2. Application & Referencing
              </div>
              <li>
                <span className="feature-name">
                  Essential Tenant Referencing
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Full Elite Referencing</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Digital Right to Rent Checks
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Statutory Documents Served</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Digital AST Creation & Signing
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Deposit Collection & Protection
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Section 13 notice (AI)</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Section 48 Notice (AI)</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Document Management</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                3. Tenancy Setup & Onboarding
              </div>
              <li>
                <span className="feature-name">Tenant & Landlord Portals</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Smart Compliance Alerts</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                4. Ongoing Tenancy Management
              </div>
              <li>
                <span className="feature-name">Rent Collection (AI)</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Rent Collection (Human)</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Debt Collection (AI)</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Work Order & Maintenance Management
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Automated Workflows & Tenancy Renewals
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Integrations with Xero, QuickBooks
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                5. Compliance & Legal Support
              </div>
              <li>
                <span className="feature-name">
                  Full Property Management Suite
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Accounting & Financial Reporting
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Legal Support & Evictions</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
            </ul>
            <a href="#" className="pricing-button">
              Get Started
            </a>
          </div>
          {/* <!-- Premium Plan --> */}
          <div className="pricing-plan">
            <div className="plan-header">
              <div className="pricing-title">Premium</div>
              <div className="pricing-price">
                £40<span>/mo</span>
              </div>
            </div>
            <ul className="pricing-features">
              <div className="section-title-placeholder">
                1. Marketing the Property
              </div>
              <li>
                <span className="feature-name">
                  Property Listings (LettingsMate)
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Property Listings (Rightmove, Zoopla, etc.)
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Viewing Management</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Real-Time Communication Dashboard
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Tenant Pre-Qualification</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                2. Application & Referencing
              </div>
              <li>
                <span className="feature-name">
                  Essential Tenant Referencing
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Full Elite Referencing</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Digital Right to Rent Checks
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Statutory Documents Served</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Digital AST Creation & Signing
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Deposit Collection & Protection
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Section 13 notice (AI)</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Section 48 Notice (AI)</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Document Management</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                3. Tenancy Setup & Onboarding
              </div>
              <li>
                <span className="feature-name">Tenant & Landlord Portals</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Smart Compliance Alerts</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                4. Ongoing Tenancy Management
              </div>
              <li>
                <span className="feature-name">Rent Collection (AI)</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Rent Collection (Human)</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Debt Collection (AI)</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Work Order & Maintenance Management
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Automated Workflows & Tenancy Renewals
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Integrations with Xero, QuickBooks
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                5. Compliance & Legal Support
              </div>
              <li>
                <span className="feature-name">
                  Full Property Management Suite
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Accounting & Financial Reporting
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Legal Support & Evictions</span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
            </ul>
            <a href="#" className="pricing-button">
              Get Started
            </a>
          </div>
          {/* <!-- Enterprise Plan --> */}
          <div className="pricing-plan">
            <div className="plan-header">
              <div className="pricing-title">Business</div>
              <div className="pricing-price">
                £50<span>/mo</span>
              </div>
            </div>
            <ul className="pricing-features">
              <div className="section-title-placeholder">
                1. Marketing the Property
              </div>
              <li>
                <span className="feature-name">
                  Property Listings (LettingsMate)
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Property Listings (Rightmove, Zoopla, etc.)
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Viewing Management</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Real-Time Communication Dashboard
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Tenant Pre-Qualification</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                2. Application & Referencing
              </div>
              <li>
                <span className="feature-name">
                  Essential Tenant Referencing
                </span>
                <span className="feature-value">
                  <span className="icon-no">×</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Full Elite Referencing</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Digital Right to Rent Checks
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Statutory Documents Served</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Digital AST Creation & Signing
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Deposit Collection & Protection
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Section 13 notice (AI)</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Section 48 Notice (AI)</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Document Management</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                3. Tenancy Setup & Onboarding
              </div>
              <li>
                <span className="feature-name">Tenant & Landlord Portals</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Smart Compliance Alerts</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                4. Ongoing Tenancy Management
              </div>
              <li>
                <span className="feature-name">Rent Collection (AI)</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Rent Collection (Human)</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Debt Collection (AI)</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Work Order & Maintenance Management
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Automated Workflows & Tenancy Renewals
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Integrations with Xero, QuickBooks
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>

              <div className="section-title-placeholder">
                5. Compliance & Legal Support
              </div>
              <li>
                <span className="feature-name">
                  Full Property Management Suite
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">
                  Accounting & Financial Reporting
                </span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
              <li>
                <span className="feature-name">Legal Support & Evictions</span>
                <span className="feature-value">
                  <span className="icon-yes">✓</span>
                </span>
              </li>
            </ul>
            <a href="#" className="pricing-button">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
