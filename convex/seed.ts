import { internalMutation } from "./_generated/server";

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if seed data already exists
    const existingOrgs = await ctx.db.query("organizations").first();
    if (existingOrgs) {
      throw new Error(
        "Database already contains data. Clear the database first or use a fresh instance."
      );
    }

    const now = Date.now();

    // ─── Organizations ───────────────────────────────────────────
    const org1 = await ctx.db.insert("organizations", {
      name: "Acme Corp",
      primaryColor: "#2563EB",
      createdAt: now - 30 * 86400000, // 30 days ago
    });

    const org2 = await ctx.db.insert("organizations", {
      name: "TechVentures",
      primaryColor: "#7C3AED",
      createdAt: now - 20 * 86400000,
    });

    const org3 = await ctx.db.insert("organizations", {
      name: "GlobalRetail",
      primaryColor: "#059669",
      createdAt: now - 10 * 86400000,
    });

    // ─── Users ───────────────────────────────────────────────────
    const admin = await ctx.db.insert("users", {
      email: "admin@nimble.la",
      name: "Admin User",
      role: "admin",
      supabaseUserId: "seed-admin-001",
      isActive: true,
      createdAt: now - 30 * 86400000,
    });

    const client1a = await ctx.db.insert("users", {
      email: "maria@acmecorp.com",
      name: "Maria Garcia",
      role: "client",
      orgId: org1,
      supabaseUserId: "seed-client-001",
      isActive: true,
      createdAt: now - 25 * 86400000,
    });

    const client1b = await ctx.db.insert("users", {
      email: "carlos@acmecorp.com",
      name: "Carlos Rodriguez",
      role: "client",
      orgId: org1,
      supabaseUserId: "seed-client-002",
      isActive: true,
      createdAt: now - 24 * 86400000,
    });

    const client2a = await ctx.db.insert("users", {
      email: "ana@techventures.io",
      name: "Ana Martinez",
      role: "client",
      orgId: org2,
      supabaseUserId: "seed-client-003",
      isActive: true,
      createdAt: now - 18 * 86400000,
    });

    const client2b = await ctx.db.insert("users", {
      email: "luis@techventures.io",
      name: "Luis Hernandez",
      role: "client",
      orgId: org2,
      supabaseUserId: "seed-client-004",
      isActive: true,
      createdAt: now - 17 * 86400000,
    });

    const client3a = await ctx.db.insert("users", {
      email: "sofia@globalretail.com",
      name: "Sofia Lopez",
      role: "client",
      orgId: org3,
      supabaseUserId: "seed-client-005",
      isActive: true,
      createdAt: now - 8 * 86400000,
    });

    // ─── Positions ───────────────────────────────────────────────
    // Acme Corp
    const pos1 = await ctx.db.insert("positions", {
      title: "Senior Frontend Developer",
      description:
        "Looking for an experienced React/Next.js developer to lead our web platform team.",
      status: "open",
      orgId: org1,
      createdAt: now - 20 * 86400000,
    });

    const pos2 = await ctx.db.insert("positions", {
      title: "Product Manager",
      description:
        "We need a strategic product manager to drive our B2B SaaS roadmap.",
      status: "open",
      orgId: org1,
      createdAt: now - 15 * 86400000,
    });

    const pos3 = await ctx.db.insert("positions", {
      title: "DevOps Engineer",
      description: "Cloud infrastructure and CI/CD pipeline specialist.",
      status: "closed",
      orgId: org1,
      createdAt: now - 25 * 86400000,
    });

    // TechVentures
    const pos4 = await ctx.db.insert("positions", {
      title: "Full Stack Developer",
      description:
        "Node.js + React developer for our fintech product.",
      status: "open",
      orgId: org2,
      createdAt: now - 14 * 86400000,
    });

    const pos5 = await ctx.db.insert("positions", {
      title: "UX Designer",
      description:
        "Design lead for mobile and web applications.",
      status: "open",
      orgId: org2,
      createdAt: now - 10 * 86400000,
    });

    // GlobalRetail
    const pos6 = await ctx.db.insert("positions", {
      title: "Data Analyst",
      description:
        "SQL and Python expert to support business intelligence initiatives.",
      status: "open",
      orgId: org3,
      createdAt: now - 7 * 86400000,
    });

    const pos7 = await ctx.db.insert("positions", {
      title: "Marketing Manager",
      description: "Lead digital marketing campaigns across LATAM.",
      status: "open",
      orgId: org3,
      createdAt: now - 5 * 86400000,
    });

    // ─── Candidates ──────────────────────────────────────────────
    const cand1 = await ctx.db.insert("candidates", {
      fullName: "Alejandro Torres",
      email: "alejandro.torres@email.com",
      phone: "+52 55 1234 5678",
      currentRole: "Senior React Developer",
      currentCompany: "StartupX",
      summary:
        "5+ years of experience building web applications with React, Next.js, and TypeScript. Strong in performance optimization and component architecture.",
      createdAt: now - 18 * 86400000,
      updatedAt: now - 2 * 86400000,
    });

    const cand2 = await ctx.db.insert("candidates", {
      fullName: "Valentina Morales",
      email: "valentina.morales@email.com",
      phone: "+57 300 987 6543",
      currentRole: "Product Manager",
      currentCompany: "FinCo",
      summary:
        "Product leader with 7 years of experience in B2B SaaS. Track record of 3x ARR growth at previous company.",
      createdAt: now - 16 * 86400000,
      updatedAt: now - 3 * 86400000,
    });

    const cand3 = await ctx.db.insert("candidates", {
      fullName: "Diego Ramirez",
      email: "diego.ramirez@email.com",
      currentRole: "Full Stack Engineer",
      currentCompany: "MegaApp",
      summary:
        "Versatile engineer comfortable with Node.js, Python, and React. Previously at two YC startups.",
      createdAt: now - 15 * 86400000,
      updatedAt: now - 1 * 86400000,
    });

    const cand4 = await ctx.db.insert("candidates", {
      fullName: "Isabella Chen",
      email: "isabella.chen@email.com",
      phone: "+1 415 555 0102",
      currentRole: "UX/UI Designer",
      currentCompany: "DesignStudio",
      summary:
        "Award-winning designer specializing in mobile-first experiences. Proficient in Figma, prototyping, and user research.",
      createdAt: now - 14 * 86400000,
      updatedAt: now - 4 * 86400000,
    });

    const cand5 = await ctx.db.insert("candidates", {
      fullName: "Mateo Gutierrez",
      email: "mateo.gutierrez@email.com",
      currentRole: "DevOps Engineer",
      currentCompany: "CloudNative Inc",
      summary:
        "AWS certified architect with deep experience in Kubernetes, Terraform, and CI/CD pipelines.",
      createdAt: now - 12 * 86400000,
      updatedAt: now - 5 * 86400000,
    });

    const cand6 = await ctx.db.insert("candidates", {
      fullName: "Camila Reyes",
      email: "camila.reyes@email.com",
      phone: "+56 9 8765 4321",
      currentRole: "Data Analyst",
      currentCompany: "DataDriven",
      summary:
        "Expert in SQL, Python, and Tableau. 4 years of experience in e-commerce analytics.",
      createdAt: now - 10 * 86400000,
      updatedAt: now - 2 * 86400000,
    });

    const cand7 = await ctx.db.insert("candidates", {
      fullName: "Sebastian Vargas",
      email: "sebastian.vargas@email.com",
      currentRole: "Frontend Developer",
      currentCompany: "WebAgency",
      summary:
        "React and Vue.js developer with a strong eye for design. 3 years of experience in agency settings.",
      createdAt: now - 9 * 86400000,
      updatedAt: now - 1 * 86400000,
    });

    const cand8 = await ctx.db.insert("candidates", {
      fullName: "Lucia Fernandez",
      email: "lucia.fernandez@email.com",
      phone: "+54 11 4567 8901",
      currentRole: "Marketing Director",
      currentCompany: "BrandCo",
      summary:
        "10+ years leading digital marketing in LATAM. Expert in performance marketing, SEO, and brand strategy.",
      createdAt: now - 8 * 86400000,
      updatedAt: now - 3 * 86400000,
    });

    const cand9 = await ctx.db.insert("candidates", {
      fullName: "Nicolas Pacheco",
      email: "nicolas.pacheco@email.com",
      currentRole: "Backend Developer",
      currentCompany: "Freelance",
      summary:
        "Node.js and Python specialist. Strong in API design, microservices, and database optimization.",
      createdAt: now - 6 * 86400000,
      updatedAt: now - 1 * 86400000,
    });

    const cand10 = await ctx.db.insert("candidates", {
      fullName: "Andrea Silva",
      email: "andrea.silva@email.com",
      phone: "+55 11 9876 5432",
      currentRole: "Product Designer",
      currentCompany: "InnovateTech",
      summary:
        "End-to-end product designer with experience in SaaS, fintech, and healthcare. Strong in design systems.",
      createdAt: now - 4 * 86400000,
      updatedAt: now - 1 * 86400000,
    });

    // ─── Candidate Files (placeholder entries) ───────────────────
    await ctx.db.insert("candidateFiles", {
      candidateId: cand1,
      fileUrl: "https://example.com/placeholder/alejandro-resume.pdf",
      fileName: "Alejandro_Torres_Resume.pdf",
      fileType: "application/pdf",
      uploadedAt: now - 18 * 86400000,
    });

    await ctx.db.insert("candidateFiles", {
      candidateId: cand2,
      fileUrl: "https://example.com/placeholder/valentina-resume.pdf",
      fileName: "Valentina_Morales_Resume.pdf",
      fileType: "application/pdf",
      uploadedAt: now - 16 * 86400000,
    });

    await ctx.db.insert("candidateFiles", {
      candidateId: cand4,
      fileUrl: "https://example.com/placeholder/isabella-portfolio.pdf",
      fileName: "Isabella_Chen_Portfolio.pdf",
      fileType: "application/pdf",
      uploadedAt: now - 14 * 86400000,
    });

    await ctx.db.insert("candidateFiles", {
      candidateId: cand6,
      fileUrl: "https://example.com/placeholder/camila-resume.pdf",
      fileName: "Camila_Reyes_Resume.pdf",
      fileType: "application/pdf",
      uploadedAt: now - 10 * 86400000,
    });

    await ctx.db.insert("candidateFiles", {
      candidateId: cand8,
      fileUrl: "https://example.com/placeholder/lucia-resume.pdf",
      fileName: "Lucia_Fernandez_Resume.pdf",
      fileType: "application/pdf",
      uploadedAt: now - 8 * 86400000,
    });

    // ─── Candidate-Position Assignments ──────────────────────────
    const stages = ["submitted", "to_interview", "approved", "rejected"] as const;

    // Acme Corp - Senior Frontend Developer
    const cp1 = await ctx.db.insert("candidatePositions", {
      candidateId: cand1,
      positionId: pos1,
      stage: "to_interview",
      createdAt: now - 17 * 86400000,
      updatedAt: now - 5 * 86400000,
      lastInteractionAt: now - 2 * 86400000,
    });

    const cp2 = await ctx.db.insert("candidatePositions", {
      candidateId: cand7,
      positionId: pos1,
      stage: "submitted",
      createdAt: now - 8 * 86400000,
      updatedAt: now - 8 * 86400000,
      lastInteractionAt: now - 8 * 86400000,
    });

    const cp3 = await ctx.db.insert("candidatePositions", {
      candidateId: cand3,
      positionId: pos1,
      stage: "approved",
      createdAt: now - 14 * 86400000,
      updatedAt: now - 3 * 86400000,
      lastInteractionAt: now - 1 * 86400000,
    });

    // Acme Corp - Product Manager
    const cp4 = await ctx.db.insert("candidatePositions", {
      candidateId: cand2,
      positionId: pos2,
      stage: "to_interview",
      createdAt: now - 13 * 86400000,
      updatedAt: now - 4 * 86400000,
      lastInteractionAt: now - 2 * 86400000,
    });

    // Acme Corp - DevOps (closed)
    const cp5 = await ctx.db.insert("candidatePositions", {
      candidateId: cand5,
      positionId: pos3,
      stage: "approved",
      createdAt: now - 22 * 86400000,
      updatedAt: now - 18 * 86400000,
      lastInteractionAt: now - 18 * 86400000,
    });

    // TechVentures - Full Stack
    const cp6 = await ctx.db.insert("candidatePositions", {
      candidateId: cand3,
      positionId: pos4,
      stage: "to_interview",
      createdAt: now - 12 * 86400000,
      updatedAt: now - 6 * 86400000,
      lastInteractionAt: now - 3 * 86400000,
    });

    const cp7 = await ctx.db.insert("candidatePositions", {
      candidateId: cand9,
      positionId: pos4,
      stage: "submitted",
      createdAt: now - 5 * 86400000,
      updatedAt: now - 5 * 86400000,
      lastInteractionAt: now - 5 * 86400000,
    });

    // TechVentures - UX Designer
    const cp8 = await ctx.db.insert("candidatePositions", {
      candidateId: cand4,
      positionId: pos5,
      stage: "approved",
      createdAt: now - 9 * 86400000,
      updatedAt: now - 2 * 86400000,
      lastInteractionAt: now - 1 * 86400000,
    });

    const cp9 = await ctx.db.insert("candidatePositions", {
      candidateId: cand10,
      positionId: pos5,
      stage: "to_interview",
      createdAt: now - 3 * 86400000,
      updatedAt: now - 1 * 86400000,
      lastInteractionAt: now - 1 * 86400000,
    });

    // GlobalRetail - Data Analyst
    const cp10 = await ctx.db.insert("candidatePositions", {
      candidateId: cand6,
      positionId: pos6,
      stage: "submitted",
      createdAt: now - 6 * 86400000,
      updatedAt: now - 6 * 86400000,
      lastInteractionAt: now - 4 * 86400000,
    });

    // GlobalRetail - Marketing Manager
    const cp11 = await ctx.db.insert("candidatePositions", {
      candidateId: cand8,
      positionId: pos7,
      stage: "to_interview",
      createdAt: now - 4 * 86400000,
      updatedAt: now - 2 * 86400000,
      lastInteractionAt: now - 1 * 86400000,
    });

    // Shared candidate: Diego also assigned to GlobalRetail Data Analyst
    const cp12 = await ctx.db.insert("candidatePositions", {
      candidateId: cand3,
      positionId: pos6,
      stage: "submitted",
      createdAt: now - 4 * 86400000,
      updatedAt: now - 4 * 86400000,
      lastInteractionAt: now - 4 * 86400000,
    });

    // ─── Comments ────────────────────────────────────────────────
    await ctx.db.insert("comments", {
      body: "Strong technical background. Let's move forward with an interview.",
      userId: client1a,
      candidatePositionId: cp1,
      createdAt: now - 10 * 86400000,
    });

    await ctx.db.insert("comments", {
      body: "Agreed, his React experience is exactly what we need.",
      userId: client1b,
      candidatePositionId: cp1,
      createdAt: now - 9 * 86400000,
    });

    await ctx.db.insert("comments", {
      body: "Excellent interview performance. Highly recommend for the next round.",
      userId: client1a,
      candidatePositionId: cp3,
      createdAt: now - 5 * 86400000,
    });

    await ctx.db.insert("comments", {
      body: "Great product sense. Her experience at FinCo is very relevant.",
      userId: client1a,
      candidatePositionId: cp4,
      createdAt: now - 6 * 86400000,
    });

    await ctx.db.insert("comments", {
      body: "Impressive portfolio. Schedule a design challenge.",
      userId: client2a,
      candidatePositionId: cp8,
      createdAt: now - 4 * 86400000,
    });

    await ctx.db.insert("comments", {
      body: "She passed the design challenge with flying colors!",
      userId: client2b,
      candidatePositionId: cp8,
      createdAt: now - 2 * 86400000,
    });

    await ctx.db.insert("comments", {
      body: "Good profile but I'd like to see more fintech experience.",
      userId: client2a,
      candidatePositionId: cp6,
      createdAt: now - 7 * 86400000,
    });

    await ctx.db.insert("comments", {
      body: "Interesting background. Let's set up a call.",
      userId: client3a,
      candidatePositionId: cp11,
      createdAt: now - 2 * 86400000,
    });

    // ─── Activity Log ────────────────────────────────────────────
    // Alejandro: submitted → to_interview
    await ctx.db.insert("activityLog", {
      action: "stage_change",
      fromStage: "submitted",
      toStage: "to_interview",
      userId: admin,
      userName: "Admin User",
      candidatePositionId: cp1,
      createdAt: now - 12 * 86400000,
    });

    // Diego: submitted → to_interview → approved (Acme)
    await ctx.db.insert("activityLog", {
      action: "stage_change",
      fromStage: "submitted",
      toStage: "to_interview",
      userId: admin,
      userName: "Admin User",
      candidatePositionId: cp3,
      createdAt: now - 10 * 86400000,
    });

    await ctx.db.insert("activityLog", {
      action: "stage_change",
      fromStage: "to_interview",
      toStage: "approved",
      userId: client1a,
      userName: "Maria Garcia",
      candidatePositionId: cp3,
      createdAt: now - 3 * 86400000,
    });

    // Valentina: submitted → to_interview
    await ctx.db.insert("activityLog", {
      action: "stage_change",
      fromStage: "submitted",
      toStage: "to_interview",
      userId: admin,
      userName: "Admin User",
      candidatePositionId: cp4,
      createdAt: now - 8 * 86400000,
    });

    // Mateo: submitted → approved (DevOps closed)
    await ctx.db.insert("activityLog", {
      action: "stage_change",
      fromStage: "submitted",
      toStage: "approved",
      userId: admin,
      userName: "Admin User",
      candidatePositionId: cp5,
      createdAt: now - 20 * 86400000,
    });

    // Diego: submitted → to_interview (TechVentures)
    await ctx.db.insert("activityLog", {
      action: "stage_change",
      fromStage: "submitted",
      toStage: "to_interview",
      userId: admin,
      userName: "Admin User",
      candidatePositionId: cp6,
      createdAt: now - 8 * 86400000,
    });

    // Isabella: submitted → to_interview → approved
    await ctx.db.insert("activityLog", {
      action: "stage_change",
      fromStage: "submitted",
      toStage: "to_interview",
      userId: admin,
      userName: "Admin User",
      candidatePositionId: cp8,
      createdAt: now - 7 * 86400000,
    });

    await ctx.db.insert("activityLog", {
      action: "stage_change",
      fromStage: "to_interview",
      toStage: "approved",
      userId: client2a,
      userName: "Ana Martinez",
      candidatePositionId: cp8,
      createdAt: now - 2 * 86400000,
    });

    // Andrea: submitted → to_interview
    await ctx.db.insert("activityLog", {
      action: "stage_change",
      fromStage: "submitted",
      toStage: "to_interview",
      userId: admin,
      userName: "Admin User",
      candidatePositionId: cp9,
      createdAt: now - 1 * 86400000,
    });

    // Lucia: submitted → to_interview
    await ctx.db.insert("activityLog", {
      action: "stage_change",
      fromStage: "submitted",
      toStage: "to_interview",
      userId: admin,
      userName: "Admin User",
      candidatePositionId: cp11,
      createdAt: now - 2 * 86400000,
    });

    // Comment activity entries
    await ctx.db.insert("activityLog", {
      action: "comment_added",
      userId: client1a,
      userName: "Maria Garcia",
      candidatePositionId: cp1,
      createdAt: now - 10 * 86400000,
    });

    await ctx.db.insert("activityLog", {
      action: "comment_added",
      userId: client1b,
      userName: "Carlos Rodriguez",
      candidatePositionId: cp1,
      createdAt: now - 9 * 86400000,
    });

    await ctx.db.insert("activityLog", {
      action: "comment_added",
      userId: client2a,
      userName: "Ana Martinez",
      candidatePositionId: cp8,
      createdAt: now - 4 * 86400000,
    });

    // Suppress unused variable warnings
    void stages;
    void cp2;
    void cp7;
    void cp10;
    void cp12;

    return {
      organizations: 3,
      users: 6,
      positions: 7,
      candidates: 10,
      candidatePositions: 12,
      comments: 8,
      activityLogEntries: 13,
    };
  },
});
