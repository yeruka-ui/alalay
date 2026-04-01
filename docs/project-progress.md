# Alalay — Project Progress Documentation

## What is Alalay?
Alalay is a React Native mobile app built with Expo. It is designed to help users manage health-related tasks, records, and appointments. The app uses a purple/pink color theme throughout.

---

## Project Structure

```
alalay/
├── app/
│   ├── _layout.tsx         # Root layout — wraps all screens
│   ├── index.tsx           # Entry point — redirects to record_locker
│   ├── dashboard.tsx       # Dashboard screen (calendar + task tabs)
│   └── record_locker.tsx   # Records screen (search + document tabs)
├── components/
│   └── tabFilterBar.tsx    # Reusable tab filter component
├── styles/
│   └── index.styles.ts     # Shared styles for all screens
└── docs/
    └── project-progress.md # This file
```

---

## Screens Built

### 1. Dashboard (`app/dashboard.tsx`)
The main task management screen.

**Features:**
- **Purple header panel** with a nested lighter purple card
- **Month/Year display** — tapping it opens a date picker (calendar dialog)
  - Android: native calendar dialog, auto-dismisses on selection
  - iOS: spinner inside a slide-up modal with a "Done" button
- **Horizontal date carousel** — scrollable row of date cards
  - Active date card is wider and highlighted in purple
  - Inactive cards are smaller and light pink
  - Carousel auto-scrolls to center the selected date on load and on change
- **"+ Add Task" button** in the top-right of the header
- **TabFilterBar** at the bottom with 4 tabs: Pending, Medication, Appointments, Completed

**Key concepts learned:**
- `useRef` to control a `ScrollView` programmatically (`scrollTo`)
- `useEffect` to trigger scroll when `selectedDate` changes
- `Dimensions.get("window").width` to calculate scroll position relative to screen size
- `Platform.OS` to render different components on iOS vs Android
- `Modal` for the iOS date picker overlay

---

### 2. Record Locker (`app/record_locker.tsx`)
A screen for storing and browsing health records (IDs, prescriptions, lab results).

**Features:**
- **Purple top panel** as a decorative header bar
- **Back button** — circular button with a `‹` arrow, left side
- **"Records" title** — centered using `position: "absolute"` trick so it stays centered regardless of the back button
- **Search bar** — rounded input with a Feather search icon inside it
  - Icon and input sit in a `flexDirection: "row"` container
  - `placeholderTextColor` controls the hint text color
- **TabFilterBar** at the bottom with 4 tabs: All, IDs, Rx, Results
- **"+" add button** — circular purple button to the right of the tab bar

**Key concepts learned:**
- `position: "absolute"` on text to center it independently of sibling elements
- Feather icons from `@expo/vector-icons`
- `placeholderTextColor` prop vs `color` style (typed text vs hint text)
- `flex: 1` + `justifyContent: "space-between"` to push content to top and bottom of screen
- Avoiding `position: "absolute"` on buttons that should sit in normal flow

---

## Reusable Component

### `TabFilterBar` (`components/tabFilterBar.tsx`)
A horizontal tab bar that can be dropped into any screen.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `tabs` | `{ id, label, icon }[]` | Array of tab definitions |
| `activeTab` | `string` | The `id` of the currently selected tab |
| `onTabChange` | `(id: string) => void` | Called when user taps a tab |

**How to use it:**
```tsx
const [activeTab, setActiveTab] = useState("all");
const tabs = [
  { id: "all", label: "All", icon: "grid" },
  { id: "ids", label: "IDs", icon: "credit-card" },
];

<TabFilterBar
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

**Key concepts learned:**
- Passing data down via props
- `flex: 1` on each tab so all tabs share equal width
- Active/inactive styling driven by comparing `tab.id === activeTab`

---

## Shared Styles (`styles/index.styles.ts`)
All styles live in one file and are imported by screens that need them.

> **Why it's in `styles/` and not `app/`:** Expo Router treats every file inside `app/` as a screen/route. Putting a non-screen file like a styles file there causes a warning. Moving it to `styles/` outside of `app/` fixes this.

**Color palette used:**
| Color | Hex | Used for |
|-------|-----|---------|
| Deep purple | `#850099` | Outer container background |
| Bright purple | `#B902D6` / `#BE01DC` | Buttons, active elements, title text |
| Light purple | `#E6ADEF` | Inner panel, active tab background |
| Light pink | `#FEE8FE` | Inactive date cards |
| Light lavender | `#F0EEFE` | Back button background |

---

## Navigation (`app/_layout.tsx` + `app/index.tsx`)
- Expo Router's file-based routing is used — each file in `app/` is a route
- `_layout.tsx` wraps all screens in `SafeAreaProvider` and a `Stack` navigator with headers hidden
- `index.tsx` is the entry point and immediately redirects to the desired starting screen using `<Redirect href="/record_locker" />`

---

## Packages Used
| Package | Purpose |
|---------|---------|
| `expo-router` | File-based navigation |
| `@expo/vector-icons` (Feather) | Icons (search, tab icons) |
| `@react-native-community/datetimepicker` | Native date picker for iOS and Android |
| `react-native-safe-area-context` | Safe area handling for notches/home bars |
