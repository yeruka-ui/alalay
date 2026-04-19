# Design System Specification: Luminous Etherealism

## 1. Overview & Creative North Star: "The Digital Aura"

This design system is built upon the concept of **Luminous Etherealism**. We are moving away from the rigid, segmented "boxed" layouts of traditional material design toward a UI that feels like light passing through colored glass. This system prioritizes depth, soft refraction, and high-energy gradients to create an experience that is both premium and emotionally resonant.

The "Creative North Star" is **The Digital Aura**. Every element should feel as though it is emitting or reflecting light. We break the template look by using hyper-rounded geometry (pills and super-ellipses), intentional asymmetry in icon placement, and overlapping "glass" containers that blur the content beneath them. This creates a tactile, three-dimensional environment where hierarchy is defined by luminescence rather than structural lines.

---

## 2. Colors & Surface Architecture

The palette is a sophisticated interplay of high-saturation Magentas and deep Lavenders, set against a breathy, near-white background.

### The Palette (Key Tokens)
*   **Primary (The Core):** `#9400c9` (Deep Lavender) — Used for high-emphasis actions and active states.
*   **Secondary (The Accent):** `#aa0091` (Vivid Magenta) — Used for status indicators and emotive highlights.
*   **Surface (The Canvas):** `#faf4fc` — A tinted off-white that prevents the "stark" look of pure hex white.
*   **Gradients:** Main surfaces should utilize a linear gradient from `primary` to `primary_container` (#d878ff) at a 135-degree angle to simulate natural light fall-off.

### The "No-Line" Rule
**Strict Prohibition:** Do not use 1px solid borders to section off content. 
Boundaries must be defined exclusively through:
1.  **Tonal Shifts:** Placing a `surface_container_low` (#f5eff7) card on a `surface` (#faf4fc) background.
2.  **Shadow Depth:** Using diffused ambient shadows to lift elements.
3.  **Vibrancy Change:** Moving from a desaturated surface to a saturated gradient.

### Glassmorphism & Signature Textures
To achieve the premium "frosted glass" look, floating headers and interactive cards should use a background of `surface_container_lowest` at 60-80% opacity with a `backdrop-filter: blur(20px)`. This allows the vibrant background gradients to bleed through, creating a "soulful" UI that feels integrated into its environment.

---

## 3. Typography: Editorial Sophistication

We utilize **Plus Jakarta Sans** for its modern, clean, yet friendly geometric construction. The hierarchy is designed to feel like a high-end magazine layout.

*   **Display Scales (lg/md/sm):** Used for heroic moments. These should feel authoritative and utilize tight letter-spacing (-0.02em).
*   **Headline Scales:** Set in `on_surface` (#302e34). These drive the primary narrative of the page.
*   **Title & Body:** Maintain a generous line-height (1.5) to ensure "breathing room."
*   **Contextual Labels:** Use `label-md` in `secondary` (#aa0091) for metadata like "Medication" or "After eating only" to create a distinct visual layer of information that doesn't compete with primary titles.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are replaced by **Ambient Luminance**. 

*   **The Layering Principle:** Stack containers to create depth. 
    *   *Level 0:* `surface` (Base)
    *   *Level 1:* `surface_container` (Subtle grouping)
    *   *Level 2:* `surface_container_highest` (High-priority interactive cards)
*   **Ambient Shadows:** Use a shadow color tinted with the `on_surface` token at 4% opacity. `box-shadow: 0 20px 40px rgba(48, 46, 52, 0.04)`.
*   **The Ghost Border:** If accessibility requires a border, use `outline_variant` (#b0abb3) at 15% opacity. Never use 100% opaque lines.
*   **Luminous Depth:** When an element is "active" (like the current date in a calendar), use a high-saturation `primary` gradient to make it appear as if it’s glowing from within the glass.

---

## 5. Components

### Buttons & CTAs
*   **Primary (FAB/Main Action):** Highly rounded (9999px), using a vertical gradient of `secondary` to `secondary_container`. Text should be `on_secondary`.
*   **Secondary (Add Task):** Smaller pill shapes with `primary` backgrounds and high-contrast `on_primary` text.

### Selection Chips & Navigation
*   **The "Aura" State:** Active navigation items (like the "Pending" tab) should be encased in a soft, low-opacity `surface_variant` (#e1dbe5) pill that expands slightly beyond the icon.
*   **Icons:** Use geometric primitives (Diamonds, Circles, Triangles) to represent categories, rendered in solid `secondary` for high visibility.

### Cards (The "Glass" Container)
*   **Structure:** Cards must have a `DEFAULT` (1rem) or `md` (1.5rem) corner radius. 
*   **Spacing:** Use `3` (1rem) for internal padding and `4` (1.4rem) for vertical separation.
*   **Forbid Dividers:** Do not separate "Paracetamol" from "9:00 AM" with a line. Use horizontal spacing and `title-lg` vs `body-md` typography to create the split.

### Floating Action Button (FAB)
*   A large, circular button (`full` radius) using a vivid gradient. Place it in the bottom-right, overlapping the content below to emphasize the "layered glass" architecture.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace White Space:** Use the Spacing Scale `10` and `12` to separate major functional groups.
*   **Overlap Elements:** Let a FAB or a header slightly overlap a card to prove the depth of the "glass" layers.
*   **Use Subtle Gradients:** Even "flat" buttons should have a 5% tonal shift from top to bottom to feel high-end.

### Don't:
*   **Don't use 90-degree corners:** Every interactive element must have at least an `sm` (0.5rem) radius.
*   **Don't use pure black:** Use `on_surface` (#302e34) for text to maintain the soft, lavender-tinted atmosphere.
*   **Don't use hard shadows:** If the shadow looks like a shadow, it’s too dark. It should look like a soft "glow" or "stain" on the surface below.
*   **Don't use dividers:** If you feel the need for a line, increase the vertical white space or shift the background color of the next section by one step in the Surface Hierarchy.