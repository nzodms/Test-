/**
 * All user-facing copy, centralized for future localization.
 * Components never hardcode sentences — they read from here.
 * Tone: calm, direct, professional. No drama, no marketing fluff.
 */

export const copy = {
  nav: {
    howItWorks: "How it works",
    agencies: "For agencies",
    signIn: "Sign in",
    demo: "View demo workspace",
    startScan: "Start a scan",
  },

  landing: {
    purpose: "Find where your content has resurfaced.",
    searchPlaceholder: "Search a creator username",
    searchAria: "Creator username, @handle or profile URL",
    searchAction: "Scan",
    publicSourcesOnly: "Search indexed public sources",
    tryDemo: "Try a demo scan",
    platformLabel: "Platform",
    platformAny: "Any platform",
    errors: {
      empty: "Enter a username, @handle or profile URL.",
      invalid: "That doesn't look like a username or profile URL.",
      tooShort: "Usernames have at least 3 characters.",
    },
    demoNotice: "Demo scan — simulated results",
    coverageTitle: "What a scan opens",
    coverage: [
      {
        name: "Public websites",
        body: "Indexed pages that host or embed reposted galleries.",
      },
      {
        name: "Forums",
        body: "Threads and boards where content is shared in bulk.",
      },
      {
        name: "Indexed mirrors",
        body: "Copies that survive after the original page is removed.",
      },
      {
        name: "Public channels",
        body: "Openly readable channels and feeds that redistribute posts.",
      },
      {
        name: "Archived pages",
        body: "Snapshots kept by archiving services after deletion.",
      },
    ],
    coverageNote:
      "Argus reads only what is already publicly indexed. It never accesses private or paid content, and detailed findings stay locked until you verify the profile is yours.",
  },

  scanner: {
    sessionLabel: "Scan session",
    statusByPhase: {
      idle: "Ready",
      initializing: "Initializing scan",
      identity: "Resolving identity",
      sources: "Opening sources",
      matching: "Comparing matches",
      analysis: "Analyzing exposure",
      assembling: "Assembling report",
      complete: "Scan complete",
      locked: "Report locked",
    },
    registryTitle: "Operations",
    sourcesTitle: "Source coverage",
    matchesTitle: "Potential matches",
    summaryTitle: "Live summary",
    activityTitle: "Detection activity",
    skip: "Skip animation",
    replay: "Replay scan",
    newSearch: "Search another username",
    edit: "Edit search",
    kpis: {
      matches: "Potential matches",
      sources: "Indexed sources",
      highConfidence: "High confidence",
      recentActivity: "Active this week",
    },
    exposure: {
      label: "Exposure level",
      low: "Low",
      moderate: "Moderate",
      elevated: "Elevated",
      high: "High",
    },
    complete: "Scan complete",
    detected: "Potential matches detected",
  },

  lock: {
    title: "Scan complete",
    summary: (matches: number, sources: number) =>
      `${matches} potential matches detected across ${sources} indexed sources.`,
    action: "Verify ownership to unlock the full report and start monitoring.",
    cta: "Claim this profile",
    secondary: "Search another username",
    protection: "Sensitive details remain protected until ownership is verified.",
    lockedItem: "Locked until verification",
  },

  sequences: {
    found: {
      label: "What was found",
      title: "Every match, classified before you see it",
      body: "Results arrive graded and ordered — so review starts with what matters, not with a pile of links.",
    },
    action: {
      label: "From detection to action",
      title: "A finding is the start of a process, not a screenshot",
      steps: [
        {
          name: "Detection",
          body: "A match is found on an indexed public source and graded for confidence.",
        },
        {
          name: "Review",
          body: "You confirm whether the match is your content — one decision, recorded.",
        },
        {
          name: "Ownership verification",
          body: "Your profile is verified once; every action after that carries proof.",
        },
        {
          name: "Takedown request",
          body: "A removal request is prepared with the evidence attached, ready to send.",
        },
        {
          name: "Monitoring",
          body: "The source stays watched. Removals are confirmed, not assumed.",
        },
        {
          name: "Recurrence detection",
          body: "If the same content resurfaces elsewhere, it's flagged against the original case.",
        },
      ],
    },
    monitoring: {
      label: "Continuous monitoring",
      title: "The scan you just watched, running weekly",
      body: "New detections are compared against your history, graded, and delivered as a quiet summary — with an alert only when confidence is high.",
    },
    agency: {
      label: "Agency workspace",
      title: "Every roster, one review queue",
      body: "Agencies monitor all managed profiles from a single workspace: priorities surface across creators, and pending actions never sit unseen.",
    },
    final: {
      title: "Start with your public username.",
      cta: "Start a scan",
      onboarding: "Set up monitoring",
    },
  },

  onboarding: {
    title: "Set up your workspace",
    demoBadge: "Demo mode",
    back: "Back",
    next: "Continue",
    finish: "Open dashboard",
    restart: "Start over",
    exit: "Save & exit",
    resume: "Resuming where you left off",
    steps: {
      account: {
        title: "How will you use Argus?",
        blurb: "This shapes your workspace — it can be changed later.",
        creator: "Creator",
        creatorBody: "Protect your own profiles and content.",
        agency: "Agency",
        agencyBody: "Manage protection for the creators you represent.",
      },
      profiles: {
        title: "Add the public profiles to protect",
        blurb: "Usernames or profile URLs. Public information only.",
        username: "Username",
        platform: "Platform",
        url: "Profile URL (optional)",
        add: "Add profile",
        empty: "Add at least one profile to continue.",
      },
      ownership: {
        title: "Proving ownership",
        blurb:
          "Full reports unlock only for verified owners. Verification will use one of these methods:",
        methods: [
          { name: "Profile link", body: "A temporary code placed in your public bio." },
          { name: "Temporary code", body: "A one-time code sent through the platform." },
          { name: "Connected account", body: "Sign-in through a linked social account." },
          { name: "Manual review", body: "Our team verifies documentation you provide." },
        ],
        demoContinue: "Continue in demo mode",
        demoNote: "No real verification is performed in the demo.",
      },
      monitoring: {
        title: "Monitoring preferences",
        blurb: "How thoroughly and how often Argus re-scans.",
        frequency: "Scan frequency",
        coverage: "Source coverage",
        alerts: "High-confidence alerts",
        alertsBody: "Immediate notice when a match is very likely your content.",
        weekly: "Weekly summary",
        weeklyBody: "A calm digest of new detections and changes.",
      },
      notifications: {
        title: "Where should we reach you?",
        blurb: "Only what you choose. Nothing else.",
        email: "Email",
        emailBody: "Alerts and summaries to your inbox.",
        dashboard: "Dashboard",
        dashboardBody: "Everything is always visible in the workspace.",
        integrations: "Integrations",
        integrationsBody: "Slack and webhoophooks are planned — not yet available.",
        planned: "Planned",
      },
      workspace: {
        title: "Preparing your workspace",
        lines: [
          "Creating workspace",
          "Adding profiles",
          "Preparing monitoring",
          "Configuring alerts",
        ],
        ready: "Your workspace is ready",
      },
    },
  },

  dashboard: {
    demoBadge: "Demo workspace",
    demoNote: "Simulated data — connect a real account to begin monitoring.",
    sections: {
      overview: "Overview",
      findings: "Findings",
      sources: "Sources",
      monitoring: "Monitoring",
      takedowns: "Takedowns",
      profiles: "Profiles",
      settings: "Settings",
    },
  },

  legal: {
    positioning: [
      "Public sources only",
      "Ownership verification required",
      "Sensitive details remain protected",
    ],
    footerLinks: {
      privacy: "Privacy",
      terms: "Terms",
      contentPolicy: "Content policy",
      takedownPolicy: "Takedown policy",
    },
  },
} as const;
