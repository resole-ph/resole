---
name: Resole Design System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  price-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  section-gap: 64px
---

## Brand & Style
The design system for this marketplace focuses on a high-fidelity, trustworthy aesthetic that bridges the gap between premium sneaker culture and sustainable circular commerce. The brand personality is efficient, transparent, and modern. 

The design style utilizes **Modern Minimalism** with a focus on depth through soft shadows rather than structural borders. By using a "Floating Surface" approach, the interface feels light and airy, emphasizing the high-quality photography of the sneakers. The emotional response should be one of confidence and ease, ensuring that the marketplace feels both professional (like a financial exchange) and approachable (like a community-driven platform).

## Colors
The palette is anchored by a vibrant Primary Blue, utilized for all critical action paths and brand-defining moments. 

- **Primary (#2563EB):** Use for primary buttons, active navigation states, and high-priority links.
- **Background (#F9FAFB):** A cool light gray used as the canvas to allow white surfaces to pop.
- **Surfaces (#FFFFFF):** All cards, modals, and input fields reside on white backgrounds to ensure maximum contrast and cleanliness.
- **Functional Accents:** 
    - **Green (#10B981):** Signals sustainability, verified conditions, and eco-friendly packaging.
    - **Amber (#F59E0B):** Used for AI authentication scores and general warnings.
    - **Red (#EF4444):** Reserved for "Hot Deals," price drops, and urgent system alerts.

## Typography
The system uses **Inter** exclusively to maintain a systematic, utilitarian feel that scales perfectly from small metadata to large promotional headlines.

- **Hierarchy:** Use Bold (700) for product titles and prices to ensure immediate legibility in a dense marketplace.
- **Price Formatting:** Always prefix with the Philippine Peso symbol (₱). Use `price-lg` for product cards to make the valuation a focal point.
- **Utility:** Use `label-md` for badges and category headers to provide a structural contrast to body text.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a max-width container for desktop viewing. 

- **Grid:** Use a 12-column grid for desktop. Listing cards should span 3 columns (4 per row) or 6 columns (2 per row) depending on the desired density of the specific view.
- **Mobile:** Transition to a 2-column grid for product listings to balance image size with browse-ability.
- **Rhythm:** Use an 8px base unit. Component internal padding should default to 16px (md) or 24px (lg) for larger cards.

## Elevation & Depth
This design system avoids borders in favor of **Ambient Shadows**. This creates a "layered" look where content appears to float above the #F9FAFB background.

- **Card Elevation:** Use a soft, multi-layered shadow (0px 4px 20px rgba(0, 0, 0, 0.05)) for all product and stat cards.
- **Active Elevation:** On hover, cards should slightly lift (move -4px on Y-axis) with a more pronounced shadow to indicate interactivity.
- **Modals:** Use a heavy backdrop blur (12px) with a centered white surface to focus user attention.

## Shapes
The shape language is friendly yet structured. 

- **Standard Radius:** 16px (`rounded-lg`) is the default for all cards, containers, and image thumbnails.
- **Pill Shape:** Use full rounding (999px) for all buttons, tags, badges, and search bars. This distinguishes interactive or status elements from structural containers.
- **Inputs:** Use 12px rounding to strike a balance between the soft cards and the pill-shaped buttons.

## Components

### Navigation
The desktop header is a fixed white surface with a subtle bottom shadow. It features a centered, pill-shaped search bar with a light gray background (#F3F4F6) and icon-heavy user actions (Wishlist, Notifications, Profile) on the right.

### Listing Cards
Cards utilize the 16px border radius. 
- **Top Section:** High-res image with a "Heart" icon in a circular pill container in the top-right.
- **Metadata:** AI Score badges (Amber) and Condition badges (Green) sit just below the image.
- **Footer:** Bold price in ₱ and a "Swap" or "Buy" indicator.

### Buttons
- **Primary:** Pill-shaped, solid #2563EB with white text. No shadow for a flat, modern look.
- **Secondary:** Pill-shaped, white background with the standard soft shadow and Primary Blue text.

### Badges & Tags
Pill-shaped with low-opacity background tints of their respective accent colors (e.g., Green text on a 10% opacity Green background) for a sophisticated, non-aggressive "high-fidelity" feel.

### Forms
Input fields are 12px rounded rectangles. Borders should be a very light gray (#E5E7EB), turning Primary Blue only on focus. Labels sit outside the field in `body-sm` bold.

### Stats Cards
Used for seller profiles and sneaker metrics. Small, white 16px rounded cards containing a circular icon container (20% opacity of the icon color) and two lines of text: a bold value and a muted label.