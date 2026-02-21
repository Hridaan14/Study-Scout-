# StudyScout — Functions & Logic Definition (Final V1)

## Purpose
Define how StudyScout processes user input and selects the most relevant YouTube study videos.
This file defines logic only. No UI or styling rules are included.

---

## 1. User Input Handling

### Accepted Input
Single free-text input that may include:
- Topic or chapter name
- Class or grade
- Preferred language
- Optional duration (e.g. "10 min", "30 minutes")

Examples:
- "Motion class 9 english"
- "Photosynthesis class 10 hindi 20 min"

### Input Parsing Rules
- Extract:
  - Topic keywords (mandatory)
  - Class / grade (optional but preferred)
  - Language (optional)
  - Duration (optional)
- If class or language is missing:
  - Proceed using available information
- Topic is required to perform search

---

## 2. Search Query Formation

- Combine extracted data into a YouTube search query
- Core format:
  - Topic + class + language + education keywords

Education keywords appended automatically:
- "lecture"
- "class"
- "explained"

Example:
- "Motion class 9 physics english lecture"

---

## 3. Video Fetching (YouTube API)

- Use YouTube Data API
- Fetch more videos than required (e.g. 20 results)
- Constraints:
  - Video type only
  - Safe search enabled
  - Prefer educational category when available

---

## 4. Video Ranking Logic (Core Flagship Logic)

### Primary Signals (High Weight)
- View count
- Like count

These are treated as the **strongest indicators of student preference**.

### Secondary Signals (Lower Weight)
- Like-to-view ratio
- Title relevance to topic and class
- Educational keywords in title

### Ranking Rule
- Compute an engagement-based score
- Sort videos by score in descending order
- Popularity (views + likes) dominates ranking

---

## 5. Duration Handling Logic

### Default Behavior
- Ignore videos:
  - Shorter than 5 minutes
  - Longer than 60 minutes

### User-Specified Duration Override
- If user specifies a duration:
  - Only consider videos close to that duration
  - Ignore default duration limits
- Duration preference takes priority over default rules

---

## 6. Language Handling

- Prefer videos in the user-specified language
- If insufficient results are found:
  - Allow fallback to English
- Do not block results strictly due to language

---

## 7. Result Selection

- Final output count:
  - Exactly 3 videos
- Select top 3 ranked videos after filtering

---

## 8. Output Data (Per Video)

Each video returns:
- Video title
- Thumbnail
- View count
- Like count
- Direct YouTube link

No summaries, descriptions, or AI explanations are included.

---

## 9. No-Result Handling

If no suitable videos are found:
- Display message:
  "No relevant videos found. Try refining your topic."

Below the message:
- Display a primary button:
  - Text: "Search again"
- Button returns user to input state

---

## 10. Error Handling

- API failure:
  - Show generic error message
- Do not expose technical or API errors to users

---

## 11. Functional Constraints (V1)

- No user accounts
- No saved history
- No personalization
- No recommendations
- No AI tutoring or explanations

---

## Functional Philosophy

Popularity is a powerful signal.

StudyScout prioritizes:
- What students actually watch
- What students actually like
- Fast, confident discovery over deep intelligence
