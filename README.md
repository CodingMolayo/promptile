# Block-based LLM Chat UI (MVP)

## 1. Service Overview

This web application redefines the LLM chat experience by structuring each
"user question + LLM answer" as a single **Block**.

Instead of long, scroll-heavy chat logs, users interact with a **Block Board**
where answers are visually organized, easy to scan, and easy to revisit.

> Core Value:  
> One question + one answer = one Block.
> Head-Body-Tail structure(like blockchain)

Make LLM answers **readable, scannable, and reusable**.

---

## 2. Target Users (MVP)

- Desktop web users
- Heavy LLM users:
  - Developers
  - Planners / PMs
  - Researchers
  - Students
- Users who frequently revisit past LLM answers

Mobile optimization is **out of scope** for MVP, but click-based interactions
are designed to remain mobile-compatible.

---

## 3. Core Concepts

### 3.1 Session
- A session represents one conversation topic.
- Left sidebar = list of sessions.
- One session contains multiple blocks.

### 3.2 Block
A Block is the atomic unit of this service.

Each block contains:
- User question
- LLM-generated answer

Blocks are **visual objects**, not chat messages.

---

## 4. High-level UI Layout

- **Left**: Session List (Chat-style navigation)
- **Center**: Block Board (Grid-based block visualization)
- **Overlay**: Block-centered pop-up (modal)

There is no right-side fixed panel in MVP.

---

## 5. Block Interaction Model (MVP)

All interactions are **click-based** (no hover dependency).

1. Click a Block
2. Action icons appear:
   - View Answer
   - Continue Question
   - Edit Question
3. Action behavior:
   - View / Edit → Block Detail Pop-up
   - Continue → Blank Block Pop-up

---

## 6. LLM Integration (MVP)

- LLM Provider: **groq API**
- Each block triggers **one independent LLM request**
- No continuous chat context
- Optional: parent block content may be passed as context

Sesstion Summary is **not included** in MVP.
Block previews use truncated text from the original answer.

---

## 7. Tech Stack

### Frontend
- TypeScript
- React
- Next.js (App Router)

### Backend
- Node.js (TypeScript)
- API routes for:
  - Block CRUD
  - Gemini API proxy

## component tree
app/
├── layout.tsx
└── page.tsx                    # Main container
    │
    ├── api/
    │   └── generate/
    │          └── route.ts                # groq API proxy    
    │
    ├── BlockBoard/             # Center grid area
    │   ├── BlockBoard.tsx
    │   ├── BlockCard.tsx       # Individual block with click handlers
    │   ├── BlockActionMenu.tsx # Icons: View/Continue/Edit
    │   └── EmptyBoardState.tsx
    │
    ├── BlockModal/             # Overlay popup
    │   ├── BlockModal.tsx      # Modal wrapper
    │   ├── BlockDetailView.tsx # View mode (Q&A display)
    │   ├── BlockEditForm.tsx   # Edit mode (question edit)
    │   └── BlockContinueForm.tsx # Continue mode (new question)
    │
    └── SessionList/            # Left sidebar
        ├── SessionList.tsx
        ├── SessionItem.tsx
        └── NewSessionButton.tsx

hooks/
├── useAuth.ts                 # user login
├── useBlocks.ts                # Block CRUD operations
├── useModal.ts                # Modal open/close state
└── useSession.ts               # Session state management

lib/
├── blockTreeUtils.ts           # Head-Body-Tail utils
├── firebase.ts                (# empty now)
├── gemini.ts                   # groq API client
├── storage.ts                  # Data persistence logic
└── types.ts                    # TypeScript types (Session, Block)

---

## 8. Scope Control

### In Scope (MVP)
- Block-based UI
- mind-map style Free block positioning
- Head-Body-Tail structure
- Block version history(only version)
- LLM API integration(groq)
- Session-based navigation

### Out of Scope
- Full graph 
- Block version history(detail)
- Collaboration / sharing
- Mobile optimization
