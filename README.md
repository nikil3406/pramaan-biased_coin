# Pramaan
### Skills backed by evidence. Recognition backed by trust.

**A voice-first, AI-assisted skill verification and digital credential platform for India's blue-collar workforce.**

---


## Run the Prototype

Install dependencies and start the local development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Camera and microphone features work on `localhost` or a secure HTTPS connection when the browser grants permission.

## 1. The Problem

Millions of skilled workers in India work in the informal sector as electricians, plumbers, masons, welders, and technicians.

They acquire their skills through years of practical experience, apprenticeships, and on-the-job learning. However, many lack formal certificates or recognized credentials to demonstrate their abilities.

This creates a gap between **having a skill and being able to prove that skill**.

As a result:

- Skilled workers struggle to demonstrate their actual capabilities.
- Employers find it difficult to assess workers before hiring.
- Experienced workers may receive lower wages because they lack formal qualifications.
- Traditional certification systems are often expensive, inaccessible, and difficult to navigate.

The problem is not the absence of skills. It is the absence of a reliable way to recognize and verify them.

## 2. Our Solution

Pramaan is a voice-first platform designed to help informal-sector workers demonstrate their practical skills and build a portable digital identity backed by evidence.

Instead of relying entirely on educational certificates or self-declared experience, Pramaan introduces a practical, evidence-based approach to skill recognition.

Workers can:

- Create a profile using regional-language voice interactions.
- Select their trade and declare their skills.
- Complete practical skill demonstrations.
- Submit video and audio evidence of their work.
- Receive verified skill credentials through an evidence-backed assessment process.
- Share their digital Skill Passport with potential employers.

Employers can discover skilled workers, evaluate their profiles and credentials, and connect with suitable candidates.

**Our goal is to make practical skills visible, verifiable, and valuable.**

## 3. How Pramaan Works

The platform follows a worker-centric journey.

### Step 1: Voice-First Worker Onboarding

Workers create their profiles through a simple, multilingual interface.

- Supports regional-language interactions.
- Uses voice-guided questions to collect information.
- Allows workers to provide spoken answers instead of relying entirely on typing.
- Captures trade, experience, location, and specializations.

The experience is designed for workers who may have limited digital literacy.

### Step 2: Skill Identification

Workers select their profession and the skills they want to demonstrate.

Examples include:

- Electricians: wiring, circuit installation, fault identification.
- Plumbers: pipe fitting, leakage repair, plumbing installation.
- Masons: bricklaying, plastering, concrete work.
- Welders: joint preparation, welding, fabrication.

Each trade can have its own practical assessment requirements.

### Step 3: Evidence-Based Skill Assessment

Rather than accepting self-declared skills as proof, Pramaan introduces practical demonstrations.

Workers receive instructions for completing specific tasks and submit video or audio evidence.

The verification process can use multiple signals:

- **Visual evidence:** Analyse submitted demonstrations and identify relevant tools or objects.
- **Voice evidence:** Capture spoken explanations and responses to assessment challenges.
- **Identity consistency:** Compare identity evidence across relevant stages.
- **Assessment criteria:** Evaluate submissions against trade-specific assessment rubrics.
- **Human review:** Allow qualified reviewers or trusted assessors to evaluate evidence and provide endorsements.

AI assists the verification process, but it does not independently certify a worker's workmanship.

### Step 4: Digital Skill Passport

Once skills have passed the required verification process, workers can receive a digital Skill Passport.

The passport provides a portable representation of their professional identity and recognized capabilities.

It can include:

- Worker profile and trade.
- Verified skills.
- Assessment and verification status.
- Supporting evidence references.
- Relevant endorsements.
- A unique QR code for sharing.

Workers can share their Skill Passport with employers without repeatedly explaining or proving their experience from scratch.

### Step 5: Employer Discovery and Hiring

Pramaan connects verified workers with employment opportunities.

Employers can:

- Discover workers by trade, skill, and location.
- Review worker profiles and verified credentials.
- Examine relevant assessment information.
- Create job opportunities.
- Identify workers whose capabilities match job requirements.

This creates a connection between practical skill recognition and real employment opportunities.

---

## 4. What Makes Pramaan Different?

| Traditional approach | Pramaan |
|---|---|
| Relies heavily on formal certificates | Recognizes practical skills through demonstrations |
| Often requires complex registration | Voice-first, accessible onboarding |
| Skills are frequently self-declared | Skills are supported by assessment evidence |
| Credentials may be difficult to share | Portable QR-based Skill Passport |
| Employers depend on informal references | Structured worker profiles and verification information |
| Limited accessibility for low-literacy users | Regional-language voice interactions |

### Our Key Differentiators

**1. Practical skill recognition**

We focus on what a worker can actually do, rather than only what qualifications they possess.

**2. Voice-first accessibility**

Regional-language voice interactions reduce the dependence on reading, writing, and complex forms.

**3. Evidence-backed credentials**

Skill claims are connected to practical demonstrations, assessment criteria, and review information.

**4. AI-assisted verification**

AI helps analyse evidence and supports the assessment process while retaining human oversight.

**5. Portable professional identity**

A worker's Skill Passport can be shared across employers and employment opportunities.

---

## 5. System Architecture

Pramaan combines a modern web platform with cloud-based AI, voice, and evidence-processing services.

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Progressive Web App capabilities
- Camera and microphone access
- IndexedDB for local data and offline support

### Voice and Language
- ElevenLabs for multilingual text-to-speech.
- Regional-language assessment instructions.
- Spoken prompts and audio summaries.
- AWS Transcribe for speech-to-text processing.

### Evidence Storage and Delivery
- Amazon S3 for audio and video evidence.
- Multipart uploads for larger media files.
- Amazon CloudFront for media delivery.

### AI-Assisted Verification
- Amazon Rekognition for image and visual evidence analysis.
- AWS Transcribe for processing spoken responses.
- Amazon Bedrock for AI-assisted interpretation against assessment rubrics.

### Backend and Data
- Next.js server-side APIs and business logic.
- AWS Lambda for asynchronous processing.
- Database-backed worker profiles, assessments, and credentials.
- SHA-256 evidence hashes and audit records for integrity checks.

### Authentication and Sharing
- Phone-based authentication.
- QR-based Skill Passport.
- Shareable worker profiles and credential links.

*The architecture describes the intended system design. Individual integrations and capabilities are subject to implementation and validation.*

---

## 6. Responsible AI and Trust

A skill credential can directly affect a person's employment and livelihood. Therefore, reliability and fairness are essential.

Pramaan follows a human-supervised verification approach.

- AI-generated analysis is treated as supporting evidence, not an unquestionable decision.
- Identity checks, spoken challenge responses, and visual detection are verification signals, not absolute proof of authenticity.
- Practical skills are assessed against trade-specific criteria.
- Human reviewers can examine submitted evidence and resolve uncertain cases.
- Workers can be asked to provide additional demonstrations when evidence is insufficient.
- Evidence records and audit information help maintain traceability.

**Pramaan aims to use AI to strengthen trust, not replace human judgment.**

---

## 7. Who Benefits?

### Workers
- Gain recognition for skills acquired through practical experience.
- Build a professional digital identity.
- Demonstrate their capabilities with evidence.
- Improve access to employment opportunities.

### Employers
- Discover workers based on actual skills.
- Access structured profiles and verification information.
- Reduce dependence on informal and inconsistent hiring signals.
- Find suitable candidates more efficiently.

### Skill Development Organisations
- Support practical skill assessments.
- Maintain structured records of demonstrated capabilities.
- Help workers build recognized professional profiles.

---

## 8. Expected Impact

Pramaan aims to contribute to a more inclusive and skill-driven employment ecosystem.

Our expected outcomes include:

- Better recognition of informal-sector skills.
- Improved accessibility to skill assessment.
- Greater transparency in hiring.
- More opportunities for experienced workers without formal qualifications.
- A portable digital identity for India's blue-collar workforce.

The larger vision is to help transform practical experience into credible, shareable proof of capability.

---

## 9. Future Vision

Pramaan can evolve into a broader skill-recognition ecosystem through:

- More regional languages and trade categories.
- Standardized trade-specific assessment frameworks.
- Partnerships with training institutes and industry assessors.
- Employer integrations and job-matching capabilities.
- Cross-platform credential verification.
- Wider adoption of portable digital skill identities.

---

## 10. The Vision

A person's ability should not be limited by the certificates they possess.

Millions of workers have spent years mastering their trades. Their skills deserve recognition, their experience deserves credibility, and their abilities deserve opportunities.

**Pramaan — Every skill deserves proof. Every worker deserves recognition.**
