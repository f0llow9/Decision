# Decision UI Style Guide for Cursor

This file defines the target UI style for the Decision project.

Use this style guide together with:
- README.md
- decision_prd.md
- .cursor/rules.md
- .cursor/architecture.md

Goal:
Build the frontend UI of Decision in the same visual direction as the provided dashboard reference image.

Do not copy the original product literally.
Use it as a style reference only.

---

# 1 Target Visual Direction

The UI should follow this overall style:

- clean dashboard layout
- soft modern SaaS look
- light theme
- large white cards
- subtle shadows
- rounded corners
- generous spacing
- muted gray background
- minimal but polished interface
- calm blue as the primary accent color

The visual feeling should be:

- clean
- lightweight
- premium
- easy to scan
- modular
- productized

---

# 2 Overall Layout

The application should use a dashboard-style layout.

Structure:

1. Top header bar
2. Left vertical sidebar
3. Main content area
4. Card-based content grid

Page composition:

- fixed left sidebar
- top header across the content area
- scrollable dashboard body
- large content cards arranged in a grid
- spacing between cards must be generous

The page should feel like a modern productivity dashboard, not a plain form app.

---

# 3 Layout Requirements

## 3.1 Header

The top header should include:

- product title or greeting on the left
- optional search input on the right
- optional small utility icons on the right side

Header style:

- white or near-white background
- subtle bottom border
- horizontal padding
- compact but elegant height
- clean typography

For Decision, the left side can display:

- "Decision"
or
- a contextual greeting such as "Good Morning"

The header must feel soft and minimal.

---

## 3.2 Sidebar

The left sidebar should be narrow and icon-based.

Sidebar style:

- vertical
- light background
- subtle divider line
- rounded visual language
- monochrome icons
- active state with blue accent
- compact spacing between icons

Suggested sidebar items:

- Home
- Decisions
- Subscriptions
- Expenses
- Notifications
- Settings

The sidebar should look elegant and lightweight.
Do not make it dark.
Do not use heavy blocks of color.

---

## 3.3 Main Content

The main content area should contain:

- a top section for the create bar
- a card board section below
- responsive card grid
- enough whitespace around every block

Main content should never feel crowded.

---

# 4 Design Language

## 4.1 Color System

Use a soft neutral palette.

Base colors:
- background: very light gray
- cards: white
- border: subtle gray
- text primary: near-black
- text secondary: muted gray
- primary accent: calm blue

Optional supporting accents:
- pink
- teal
- purple
- green

These accent colors should be used sparingly for status chips, icons, chart highlights, and small UI moments.

Do not use oversaturated colors.
Do not use strong gradients as the main style.

---

## 4.2 Spacing

Use spacious layout spacing.

Rules:
- large outer padding for the dashboard
- medium-to-large card padding
- consistent gaps between cards
- strong visual breathing room

The layout should feel premium because of spacing, not because of decorative elements.

---

## 4.3 Border Radius

Use rounded corners consistently.

Recommended style:
- cards: large rounded corners
- inputs: medium rounded corners
- buttons: medium-to-large rounded corners
- small chips: pill or rounded-full

Avoid sharp corners.

---

## 4.4 Shadows

Use soft shadows.

Shadow style:
- subtle
- diffuse
- low contrast

Cards should look elevated slightly from the background.
Do not use heavy or dark shadows.

---

## 4.5 Typography

Typography should be clean and modern.

Rules:
- use a clean sans-serif font stack
- section titles are medium or semibold
- large numeric values can be bold
- supporting text should be muted gray
- avoid overly large headings

The typography should look closer to SaaS dashboards than marketing landing pages.

---

# 5 Card System

Cards are the core visual unit of Decision.

All cards must share a common style system.

Common card style:
- white background
- rounded corners
- subtle border or subtle shadow
- consistent inner padding
- clean hierarchy
- optional icon area
- optional top-right secondary action

Cards should feel modular and reusable.

---

## 5.1 Decision Card

Decision cards should visually communicate:

- item name
- score
- status
- heartbeat count
- behavior total amount
- updated date

Recommended visual hierarchy:
- title at top
- score as a prominent numeric element
- status chip
- supporting meta rows underneath

Optional accents:
- small icon
- slim progress bar
- subtle colored badge

Decision cards should look calm and analytical.

---

## 5.2 Subscription Card

Subscription cards should display:

- subscription name
- price
- billing cycle
- next billing date
- current status

Style:
- compact
- easy to scan
- minimal visual clutter

---

## 5.3 Expense Card

Expense cards should display:

- category name
- latest amount
- latest date
- summary sentence

Example tone:
"上次吃大餐花费 500 元，3 月 9 日"

The card should look informative and lightweight.

---

# 6 Home Page Composition

The Home dashboard should be visually organized like this:

1. Header
2. CreateBar row
3. Main card board

The CreateBar should sit clearly above the card board and feel integrated with the dashboard style.

The card board should support:
- multiple card types
- drag and drop
- responsive arrangement

Cards should not look like plain database entries.
They should look like polished dashboard modules.

---

# 7 CreateBar Style

CreateBar should match the dashboard language.

Structure:
- select input
- text input
- primary action button

Style:
- horizontal layout
- rounded controls
- soft borders
- white background
- compact but premium appearance

The CreateBar should feel like a dashboard control panel.

---

# 8 Detail Page Style

Detail pages should continue the same visual language.

Use:
- large white content cards
- generous spacing
- chart-like or record-like sections
- muted labels and strong values
- clear separation of blocks

Do not make detail pages look like plain admin CRUD forms.

Each detail page should feel like an expanded dashboard panel.

---

# 9 Interaction Style

Interaction principles:

- smooth hover states
- subtle transitions
- soft button feedback
- drag motion should feel light
- clickable areas should be obvious but not aggressive

Do not over-animate.

Use motion only to support clarity.

---

# 10 Charts and Data Blocks

If charts or progress indicators are used, they should match the reference mood:

- minimal
- clean
- soft accent colors
- no clutter
- no heavy axis decorations

Progress bars and metric blocks should look modern and simple.

---

# 11 Tailwind Implementation Rules

Use TailwindCSS for all styling.

Prefer utility classes over custom CSS.

Recommended Tailwind direction:
- light gray background for page
- white cards
- rounded-2xl or rounded-3xl
- shadow-sm or shadow-md with low contrast
- border border-gray-100 or border-gray-200
- text-gray scale for typography
- blue accents for primary actions and active states

Avoid large custom CSS files unless necessary.

---

# 12 What To Avoid

Do not generate these styles:

- dark dashboard UI
- heavy enterprise admin style
- overly colorful startup landing page style
- dense table-first design
- sharp-corner cards
- thick borders
- strong gradients
- oversized typography
- cluttered icons everywhere

The final result must feel calm, modern, and refined.

---

# 13 Cursor Implementation Instruction

When implementing the frontend:

1. Follow this UI style guide
2. Use the existing product architecture and PRD
3. Build the Home page first
4. Create a reusable card design system
5. Apply the same design language to all pages

Priority:
- visual hierarchy
- spacing
- card consistency
- dashboard composition
- clean Tailwind implementation

---

# 14 Direct Prompt To Use In Cursor

Use this exact instruction in Cursor:

"Read README.md, decision_prd.md, .cursor/rules.md, .cursor/architecture.md, and .cursor/ui_system.md.
Implement the frontend UI in a clean light dashboard style based on the provided reference direction.
Use a left icon sidebar, top header, spacious white cards, soft shadows, rounded corners, muted gray background, and blue accent colors.
Do not build a plain admin panel. Build a polished modern dashboard UI for the Decision product."

---

# 15 Decision-Specific UI Interpretation

Translate the reference style into the Decision product as follows:

- The fitness dashboard layout becomes a consumer decision dashboard
- Metric cards become decision / subscription / expense cards
- The calm SaaS visual language remains the same
- The interface should feel like a personal decision cockpit
- The dashboard should encourage repeat use through visual comfort and clarity

This style guide is the source of truth for frontend design direction.
