# Alalay Codebase — Learning Guide

A file-by-file explanation of every concept in the current codebase.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [\_layout.tsx — The Root Shell](#2-_layouttsx--the-root-shell)
3. [index.tsx — The Calendar Screen](#3-indextsx--the-calendar-screen)
   - [Imports](#imports)
   - [State Variables (useState)](#state-variables-usestate)
   - [Refs (useRef)](#refs-useref)
   - [Helper Functions](#helper-functions)
   - [generateDates — Building the Date Carousel](#generatedates--building-the-date-carousel)
   - [scrollToDate — Math Behind Centering a Card](#scrolltodate--math-behind-centering-a-card)
   - [useEffect — Reacting to State Changes](#useeffect--reacting-to-state-changes)
   - [JSX — The Visual Layout](#jsx--the-visual-layout)
   - [Modal — The Month/Year Picker](#modal--the-monthyear-picker)
4. [index.styles.ts — StyleSheet](#4-indexstylests--stylesheet)
5. [tabFilterBar.tsx — A Reusable Component](#5-tabfilterbartsx--a-reusable-component)
   - [TypeScript Types for Props](#typescript-types-for-props)
   - [Component Communication (Props)](#component-communication-props)
6. [Key Concepts Glossary](#6-key-concepts-glossary)

---

## 1. Project Structure

```
alalay/
├── app/
│   ├── _layout.tsx        ← Root layout, wraps every screen
│   ├── index.tsx          ← Main calendar screen (home route "/")
│   └── index.styles.ts    ← Styles for index.tsx, kept in a separate file
├── components/
│   └── tabFilterBar.tsx   ← Reusable tab bar component
└── package.json
```

**Why split styles into their own file?**
`index.tsx` already has a lot of logic. Moving styles to `index.styles.ts` keeps each file focused on one job — logic vs. appearance. This is a common React Native convention.

---

## 2. `_layout.tsx` — The Root Shell

```tsx
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
```

### `expo-router` and `Stack`

`expo-router` is a file-based router. Every file inside `app/` automatically becomes a route:

- `app/index.tsx` → the `/` (home) route
- `app/profile.tsx` would become the `/profile` route

`<Stack>` is a navigator that stacks screens on top of each other (like pushing cards). `headerShown: false` removes the default title bar from all screens.

### `SafeAreaProvider`

Phones have notches, status bars, and rounded corners. `SafeAreaProvider` gives your entire app awareness of those "unsafe" areas so you can avoid drawing behind them. It must wrap the whole app (placed here, at the root) to work correctly.

---

## 3. `index.tsx` — The Calendar Screen

### Imports

```tsx
import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TabFilterBar from "../components/tabFilterBar";
import { styles } from "./index.styles";
```

| Import             | What it is                                                     |
| ------------------ | -------------------------------------------------------------- |
| `Stack`            | Controls this specific screen's header options                 |
| `useState`         | Stores values that change and triggers re-renders              |
| `useRef`           | Stores a reference to a DOM element without causing re-renders |
| `useEffect`        | Runs code _after_ a render, in response to state changes       |
| `Dimensions`       | Gets the device's screen width/height                          |
| `Modal`            | A popup overlay that appears on top of everything              |
| `ScrollView`       | A scrollable container                                         |
| `Text`             | Renders text (required — you cannot put raw strings in JSX)    |
| `TouchableOpacity` | A pressable element that fades slightly when tapped            |
| `View`             | A box/container (like `<div>` in web)                          |

---

### State Variables (useState)

```tsx
const [selectedDate, setSelectedDate] = useState(new Date());
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [pickerStep, setPickerStep] = useState<"month" | "year">("month");
const [tempMonth, setTempMonth] = useState<number>(new Date().getMonth());
const [activeTab, setActiveTab] = useState("pending");
```

**Pattern:** `const [value, setValue] = useState(initialValue)`

- `value` is what you _read_
- `setValue(newValue)` is how you _change_ it
- Every time `setValue` is called, React re-renders the component with the new value

| Variable         | Purpose                                                  |
| ---------------- | -------------------------------------------------------- |
| `selectedDate`   | The date currently highlighted in the carousel           |
| `isDropdownOpen` | Whether the month/year picker modal is visible           |
| `pickerStep`     | Two-step picker flow: `"month"` first, then `"year"`     |
| `tempMonth`      | Holds the month selection _before_ the year is confirmed |
| `activeTab`      | Which tab in `TabFilterBar` is selected                  |

**Why `tempMonth`?**
The user picks a month, _then_ picks a year before anything is applied. `tempMonth` holds the in-progress month choice so if the user cancels mid-flow, `selectedDate` is unchanged.

---

### Refs (useRef)

```tsx
const scrollViewRef = useRef<ScrollView>(null);
```

A ref is like a sticky note attached to a real component. `useRef` gives you direct access to the underlying `ScrollView` element so you can call `.scrollTo()` on it.

**Key difference from state:** Changing a ref does _not_ cause a re-render. It's just a pointer.

---

### Helper Functions

```tsx
const getMonthName = (monthIndex: number): string => { ... }
const getDayName = (dayIndex: number, short: boolean = true): string => { ... }
```

These are pure functions — given the same input, they always return the same output, and they change nothing outside themselves. JavaScript's `Date` object gives you month/day as a number (0–11, 0–6), so these functions translate those numbers into human-readable strings.

**`short: boolean = true`** — this is a _default parameter_. If you call `getDayName(3)` without a second argument, `short` defaults to `true`. If you call `getDayName(3, false)`, you get the full name.

---

### `generateDates` — Building the Date Carousel

```tsx
const generateDates = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const dates = [];

  // 2 padding days from previous month
  dates.push(new Date(year, month, -1)); // second-to-last day of previous month
  dates.push(new Date(year, month, 0)); // last day of previous month

  // All days of the current month
  const lastDay = new Date(year, month + 1, 0); // day 0 of next month = last day of this month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    dates.push(new Date(year, month, day));
  }

  // 2 padding days from next month
  dates.push(new Date(year, month + 1, 1));
  dates.push(new Date(year, month + 1, 2));

  return dates;
};
```

**Trick: `new Date(year, month, 0)`**
JavaScript's `Date` constructor wraps around when you give it day `0`. Day `0` of a month means the last day of the _previous_ month. Day `-1` means the second-to-last day of the previous month. This is how the padding days are calculated without needing a lookup table.

The 2 padding days at each end ensure the first and last days of the month are never stuck at the edge of the carousel — there's always something on either side.

---

### `scrollToDate` — Math Behind Centering a Card

```tsx
const CARD_WIDTH = 50;
const ACTIVE_CARD_WIDTH = 90;
const GAP = 10;

const scrollToDate = (index: number) => {
  const screenWidth = Dimensions.get("window").width;
  const totalHorizontalPadding = (10 + 20) * 2;
  const visibleWidth = screenWidth - totalHorizontalPadding;

  let scrollPosition = 0;
  for (let i = 0; i < index; i++) {
    scrollPosition += CARD_WIDTH + GAP; // sum up widths of all cards before this one
  }
  scrollPosition += ACTIVE_CARD_WIDTH / 2; // move to center of the active card
  scrollPosition -= visibleWidth / 2; // offset so the center of the screen lines up

  scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
};
```

**Goal:** Make the selected card appear centered on screen.

**The math:**

1. Walk through all cards _before_ the target index and sum their widths + gaps
2. Add half the active card's width → now `scrollPosition` points to the _center_ of the target card
3. Subtract half the visible screen width → the scroll offset that places that center point at the middle of the screen

**`(10 + 20) * 2`** — the `container` style has `padding: 10` and `purplePanel` has `padding: 20`. Both sides (left + right) means `×2`. This is the total horizontal space that the carousel _doesn't_ occupy.

**`scrollViewRef.current?.scrollTo(...)`** — the `?.` is optional chaining. It means "if `current` is not null, call `scrollTo`". This prevents a crash if the ref isn't attached yet.

---

### `useEffect` — Reacting to State Changes

```tsx
useEffect(() => {
  const selectedIndex = dates.findIndex(
    (date) =>
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear(),
  );

  setTimeout(() => scrollToDate(selectedIndex !== -1 ? selectedIndex : 0), 100);
}, [selectedDate]);
```

**`useEffect(callback, [dependencies])`**

The callback runs _after every render where a dependency changed_. Here the dependency is `selectedDate`, so this effect fires whenever the selected date changes.

**Why `setTimeout(..., 100)`?**
When `selectedDate` changes (e.g., a new month is picked), React re-renders and the `ScrollView` gets new content. There's a tiny moment before the layout is physically drawn. The 100ms delay ensures the `ScrollView` has finished laying out before we try to scroll it.

**Why `findIndex` instead of using the `index` directly?**
This effect runs after _any_ `selectedDate` change — including when the month/year picker closes and sets a completely new date. In that case, we don't have the card's index from a tap event, so we must search the `dates` array.

---

### JSX — The Visual Layout

```tsx
return (
  <>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.container}>       ← dark purple outer box
      <View style={styles.purplePanel}>   ← light purple inner box
        <View style={styles.header}>      ← row: month label + Add Task button
          ...
        </View>
        <ScrollView ref={scrollViewRef} horizontal ...>
          {dates.map((date, index) => (   ← renders one card per date
            <TouchableOpacity key={date.toISOString()} ...>
              ...
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
    <TabFilterBar ... />
    <Modal ...> ... </Modal>
  </>
);
```

**`<>` and `</>`** — _Fragment_. A component can only return one root element. Fragments let you return multiple siblings without adding an extra `<View>` wrapper that could affect layout.

**`<Stack.Screen options={{ headerShown: false }} />`** — overrides the screen's header for _this specific screen_, even though `_layout.tsx` already sets `headerShown: false` globally. Useful when you want one screen to behave differently.

**`dates.map((date, index) => ...)`** — `.map()` transforms an array into an array of JSX elements. React renders each one. The `key` prop (must be unique) helps React efficiently update only the cards that changed.

**`key={date.toISOString()}`** — `.toISOString()` converts a Date to a unique string like `"2026-03-29T00:00:00.000Z"`. Using it as a key guarantees no two cards share the same key.

---

### Modal — The Month/Year Picker

```tsx
<Modal visible={isDropdownOpen} transparent={true} animationType="fade" onRequestClose={() => setIsDropdownOpen(false)}>
  <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsDropdownOpen(false)}>
    <View style={styles.dropdownMenuSingle}>
      {pickerStep === "month" && ( ... )}
      {pickerStep === "year" && ( ... )}
    </View>
  </TouchableOpacity>
</Modal>
```

**`transparent={true}`** — the modal background is see-through. The `modalOverlay` style adds the dark semi-transparent backdrop manually using `rgba(0, 0, 0, 0.5)`.

**Tap-outside-to-close trick:** The `TouchableOpacity` covers the whole screen (via `flex: 1`). Tapping outside the white box (`dropdownMenuSingle`) hits the overlay and closes the modal. The inner `View` _doesn't_ have `onPress`, so tapping inside the box does nothing to the overlay.

**`{pickerStep === "month" && ( ... )}`** — conditional rendering. In JSX, `false && <X />` renders nothing. So this only draws the month list when `pickerStep` is `"month"`.

**Two-step flow:**

1. User opens the modal → `pickerStep = "month"`, month list shown
2. User taps a month → `setTempMonth(monthIndex)`, `setPickerStep("year")`, year list shown
3. User taps a year → `setSelectedDate(new Date(year, tempMonth, 1))`, modal closes
4. User taps "Back" → `setPickerStep("month")`, return to month list

Day is forced to `1` when applying: `new Date(year, tempMonth, 1)`. This makes sense — if you jump from March 31 to February, day 31 doesn't exist, so landing on day 1 is safe.

---

## 4. `index.styles.ts` — StyleSheet

```ts
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({ ... });
```

`StyleSheet.create()` is React Native's equivalent of CSS. Styles are JavaScript objects.

**Key differences from CSS:**

- Property names are camelCase: `backgroundColor`, not `background-color`
- Values that would be `px` in CSS are just plain numbers: `fontSize: 28`, not `"28px"`
- No inheritance — every element must declare its own styles
- `flexDirection` defaults to `"column"` in React Native (opposite of CSS web)

**Notable styles:**

| Style                | What it does                                         |
| -------------------- | ---------------------------------------------------- |
| `container`          | Dark purple `#850099` outer ring with padding        |
| `purplePanel`        | Light purple `#E6ADEF` inner card                    |
| `activeCard`         | Wide (90px) tall card for the selected date          |
| `inactiveCard`       | Narrow (50px) card for unselected dates              |
| `modalOverlay`       | Full-screen semi-transparent black backdrop          |
| `dropdownMenuSingle` | White rounded box that holds the picker              |
| `selectedItem`       | Light purple highlight for the chosen item in a list |

---

## 5. `tabFilterBar.tsx` — A Reusable Component

### TypeScript Types for Props

```tsx
type Tab = {
  id: string;
  label: string;
  icon: string;
};

type Props = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
};
```

**`type`** declares the _shape_ of an object. TypeScript will error if you pass the wrong shape.

**`Tab[]`** means "an array of `Tab` objects".

**`(id: string) => void`** is a _function type_. It says: "this prop must be a function that accepts one string argument and returns nothing." This matches `setActiveTab` from `useState`.

### Component Communication (Props)

```tsx
// In index.tsx — parent
const [activeTab, setActiveTab] = useState("pending");
const tabs = [
  { id: "pending", label: "Pending", icon: "bell" },
  ...
];

<TabFilterBar
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}   ← passing the setter function itself as a prop
/>
```

```tsx
// In tabFilterBar.tsx — child
export default function TabFilterBar({ tabs, activeTab, onTabChange }: Props) {
  return (
    <View>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <TouchableOpacity key={tab.id} onPress={() => onTabChange(tab.id)} ...>
            <Feather name={tab.icon as any} size={24} />
            <Text>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
```

**Data flows down, events bubble up:**

- `index.tsx` owns `activeTab` state and passes it _down_ to `TabFilterBar`
- When a tab is pressed, `TabFilterBar` calls `onTabChange(tab.id)`, which _is_ `setActiveTab`
- `setActiveTab` updates state in `index.tsx`, causing a re-render, which passes the new `activeTab` back down

This is the standard React pattern: **lift state up** to the closest common ancestor, pass it down via props.

**`tab.icon as any`** — `Feather` from `@expo/vector-icons` expects its `name` prop to be one of a fixed list of icon name strings. Since our `icon` field is typed as a generic `string`, TypeScript would complain. `as any` tells TypeScript to skip checking this specific value.

---

## 6. Key Concepts Glossary

| Term                      | Plain Explanation                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Component**             | A function that returns JSX. The building block of React UIs.                                               |
| **JSX**                   | HTML-like syntax inside JavaScript files. Gets compiled to function calls.                                  |
| **State**                 | Data that belongs to a component and changes over time. Changes trigger re-renders.                         |
| **Props**                 | Data passed _into_ a component from its parent. Read-only inside the component.                             |
| **Re-render**             | React calls your component function again with new state/props and updates the screen.                      |
| **Ref**                   | A mutable pointer to a DOM element or a stored value. Does not cause re-renders.                            |
| **Effect**                | Code that runs after a render, typically to sync with something outside React (scrolling, timers, network). |
| **Pure function**         | A function with no side effects. Same input always gives same output.                                       |
| **Fragment**              | `<>...</>` — groups multiple JSX elements without adding a real element to the tree.                        |
| **Optional chaining**     | `?.` — safely accesses a property/method only if the object is not null/undefined.                          |
| **Conditional rendering** | `{condition && <Component />}` — renders `<Component />` only when `condition` is true.                     |
| **Default parameter**     | `fn(x = defaultValue)` — uses `defaultValue` when no argument is passed.                                    |
