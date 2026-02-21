# StudyScout — Structure Definition (V1)

## Page Overview
- Application Type: Single-page web app
- Primary Goal: Allow students to find the most relevant YouTube study videos by entering topic, class, and language
- Navigation Depth: One page only
- Core Interaction: Chat-style input → video results

---

## Global Layout
- Page Layout: Vertical, center-focused
- Content Width: Medium (not full-width)
- Alignment: Centered content, left-aligned text where applicable

---

## Header / Navbar

### Position
- Fixed at top of page

### Elements
- Left-aligned text logo:
  - Text: "StudyScout"
- Bottom divider line:
  - Thin horizontal line separating navbar from body

### Purpose
- Brand identification
- Minimal orientation
- No navigation links or buttons

---

## Hero Section

### Purpose
- Immediately communicate value
- Direct attention to core interaction

### Elements (Top to Bottom)

#### 1. Main Headline
- Text:  
  **“Don’t just study. Study smart.”**
- Font Size: Large
- Font Weight: Bold
- Alignment: Center

---

#### 2. Subtext / Attribution
- Line 1 (Primary Subtext):
  - Text:  
    **“What do you want to study today?”**
- Line 2 (Guidance Text):
  - Text:  
    **“Topic • Class • Language”**
- Line 3 (Byline):
  - Text:  
    **“A project by Hridaan Shah”**
- Font Size:
  - Smaller than headline
  - Byline is smallest
- Tone:
  - Calm
  - Informative
  - Non-promotional

---

## Core Interaction Section (Chatbox)

### Purpose
- Main user input area
- Central focus of the entire app

### Chatbox Container
- Style:
  - Large input area
  - Chat-style appearance (rounded, soft edges)
- Default State:
  - Empty input
  - Instructional placeholder visible

### Placeholder / Instruction Text
- Text:
  **“Topic • Class • Language”**

### Input Behavior (Structural Only)
- Single input field
- Accepts free text
- No visible form labels
- Appears conversational rather than form-like

---

## Primary Action Button

### Button Placement
- Below chatbox
- Center aligned

### Button Text
- **“Find videos”**

### Button Behavior (Visual Only)
- Hover animation present
- Clear primary CTA styling
- No secondary buttons

---

## Results Section (Hidden by Default)

### Visibility
- Hidden before search
- Appears after user submits input

---

### Results Container
- Positioned below hero & chatbox
- Vertical list layout

---

### Individual Video Card Structure

Each result item contains:

1. Video Thumbnail
   - Clickable
   - Links externally to YouTube

2. Video Title
   - Clickable
   - Single or two-line max

3. Engagement Metrics
   - View count
   - Like count

### Exclusions (Intentional)
- No video description
- No AI summary
- No duration
- No comments
- No channel description beyond name if needed

---

### Results Limits
- Maximum items shown: 3–5 videos
- No pagination
- No infinite scroll

---

## Empty State

### Before First Search
- Display subtle guidance text:
  - “Start by entering a topic, class, and language above”

---

## Footer (Optional, Minimal)

### Content
- Small text links:
  - Privacy
  - Disclaimer

### Priority
- Very low
- Not visually dominant

---

## Structural Constraints (Important)
- No login or signup
- No user accounts
- No saved history
- No personalization
- No recommendations feed
- No multi-page navigation

---

## Structural Philosophy
- One page
- One action
- One outcome

The structure prioritizes clarity, speed, and trust.
