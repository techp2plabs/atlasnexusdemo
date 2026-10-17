# Atlas Nexus — Product

## Vision
Connect brands, agencies, networks, and YouTube creators in one platform for managing creator partnerships and evaluating campaign results. Atlas Nexus combines network operations with a shared workflow for discovering creators, planning campaigns, coordinating participation and content delivery, and reviewing performance.

## Brand Purpose
Help brands and creators turn collaboration into an organized, measurable business relationship. Brands and agencies need a clear path from creator selection and investment planning to campaign execution and results. Creators need access to relevant opportunities, a way to present their channel and rates, and visibility into application decisions and submission progress.

YouTube Brand Campaign supports two complementary experiences: **Agency Console** and **Creator Portal**, delivered through role-specific views within Atlas Nexus.

## Target User
- **Brand / Agency Team:** discovers and compares creators, defines campaign objectives and budgets, reviews applicants, coordinates deliverables, and evaluates performance. Current campaign-management access uses platform or organization owner/admin roles; Brand is a business persona, not a separate implemented account role.
- **Organization Owner/Admin:** manages partner networks, channels, members, contracts, and brand campaigns within their organization.
- **Platform Admin:** oversees organizations, access, Creator Suites configuration, public content, transactional email, and YouTube API operations.
- **Network Operator:** manages channels and contracts within their MCN scope and reviews performance.
- **Creator:** finds open brand campaigns, presents channel information and proposed rates, follows review and eligibility decisions, and submits campaign videos. Creators also view accessible channels and contracts and use enabled Creator Suites.

## Core Problem
Creator partnerships span disconnected research, rate cards, application conversations, content links, and performance spreadsheets. Brands struggle to connect creator selection and planned investment with verified deliverables and actual results. Creators lack a consistent process for finding opportunities, applying, and following participation status.

Networks also operate a four-level hierarchy (Platform → Organization → Partner Network → Channel/Creator), requiring consistent ownership, permissions, revenue splits, and performance evidence. Atlas Nexus brings these operational and collaboration needs into connected workspaces.

## Value Proposition
- **For brands and agencies:** a continuous workflow from discovery and package planning to applicant review, video verification, and campaign monitoring.
- **For creators:** an accessible campaign participation flow with proposed rates, decision visibility, upload codes, and submission tracking.
- **For organizations and networks:** centralized channel relationships, contracts, scoped team access, and reusable reporting.
- **For campaign stakeholders:** clearer separation between source metrics, calculated estimates, AI analysis, and imported commerce evidence.

## Solution
Atlas Nexus provides:
- Scoped workspaces and role-aware navigation across the network hierarchy.
- Channel management and YouTube connections, with persisted analytics for responsive reporting.
- Revenue-share contracts, cascading split previews, and revenue reconciliation.
- Creator Suites for brand deal reports, monthly channel reports, channel profiling, exports, public sharing, and on-demand AI analysis.
- A YouTube Brand Campaign workspace connecting creator discovery, campaign planning, applications, video verification, and monitoring.
- Administrative controls for users, invitations, tool access, content, email templates, quota usage, and analytics sync.

## Brand Campaign Capabilities
- **Discover and shortlist:** maintain creator profiles, search and filter available performance data, compare creators, and review rate cards and imported commerce baselines.
- **Plan investment and deliverables:** define campaign identity, products, dates, budget, investment mix, creator roster, and packages; save a forecast and resolve launch-readiness requirements. Forecasts are estimates, not guaranteed outcomes.
- **Manage participation:** creators browse open campaigns and submit applications; agency reviewers approve or reject them, followed by eligibility assessment before eligible creators enter the confirmed roster.
- **Coordinate content delivery:** issue Atlas campaign codes, reserve pre-upload submissions, attach posted-video links, and verify or reject videos. Only tracked videos contribute to monitoring.
- **Evaluate results:** review tracked-video performance against the saved campaign baseline, inspect creator/video breakdowns, import commerce evidence, and request AI monitoring analysis.

Current commerce evidence comes from manual imports; automatic merchant/order attribution and connected paid-ad performance are not established capabilities. Discovery fit scoring and its Insight tab remain placeholders. Atlas campaign codes support internal coordination and do not establish native YouTube Studio partnership consent.

## Feature Architecture
The sidebar groups the product into **Dashboard**, **Core Modules**, **Entities**, **Access Control**, and **Settings**.

**Core Modules** connects two collaboration experiences:
- **Agency / brand operations:** Creator Discovery → Campaigns → Applications, with planning, roster management, Running, Monitoring, and Activity inside the campaign workspace.
- **Creator participation:** open campaign browsing → application → agency decision → eligibility → roster participation → video submission.

**Analytics** and **Creator Suites** support performance analysis and shareable reporting. **Entities** connects organizations, MCNs, channels, and contracts. **Access Control** and **Settings** provide membership, permissions, tool configuration, content, email, and operational monitoring.

Sidebar visibility depends on role; data access is also enforced by the backend. Creators can participate in campaigns without organization membership. MCN operators do not currently see the Brand Campaign sidebar, although Creator Discovery APIs permit scoped MCN access.

See [features/feature_list.md](features/feature_list.md) for the navigation map, [features/feature_youtube_brand_campaign.md](features/feature_youtube_brand_campaign.md) for campaign capabilities, and [technical.md](technical.md) for implementation architecture.

## Availability
This documentation reflects the checked-in frontend and backend implementation reviewed on **2026-10-10**; it does not certify production deployment.

Collaborative Notes, multi-platform rate cards, and currency support have explicit rollout caveats in their feature documents. Revenue Reports remains implemented but hidden from the sidebar. Placeholder UI and roadmap documents are not evidence of available functionality.
