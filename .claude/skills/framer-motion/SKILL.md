---
name: framer-motion
description: >-
  Build animations, transitions, and micro-interactions in React using the modern `motion`
  package (v11+, imported from `motion/react` — the successor to `framer-motion`). Use this
  skill whenever the user wants to animate React UI: fade/slide/scale entrances, page or route
  transitions, mount/unmount (exit) animations, hover/tap/focus effects, drag interactions,
  staggered lists, scroll-linked or scroll-triggered effects, shared-element/layout animations,
  or springy micro-interactions — even when they don't say "Framer Motion" or "motion" by name
  (e.g. "make this fade in", "animate the modal opening", "add a hover bounce", "reveal these
  cards as I scroll", "make the list reorder smoothly"). Covers installation, motion components,
  variants, AnimatePresence, gestures, layout animations, useScroll/useTransform, springs and
  transitions, and performance. Prefer this skill over hand-rolled CSS keyframes or react-spring
  whenever a React project already uses or could use motion.
---

# Framer Motion (the `motion` package)

Animate React UIs with the `motion` package. As of v11 (2024) the library is published as
**`motion`** and imported from **`motion/react`**. The old `framer-motion` package name still
works and is API-compatible, but new code should use `motion/react`.

## Setup

Install in the React app (here, the `client/` workspace):

```bash
npm install motion --prefix client   # or: cd client && npm install motion
```

Import everything from `motion/react`:

```jsx
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "motion/react";
```

If you see existing code importing from `"framer-motion"`, it works unchanged. Don't churn it
unless asked — but write new code against `motion/react`.

## The mental model

A `motion` component is a regular DOM/SVG element (`motion.div`, `motion.button`, `motion.li`,
`motion.svg`, `motion.path`, …) that can animate between states. You describe **states as
objects of style values**, and the library tweens between them.

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}   // state on first mount
  animate={{ opacity: 1, y: 0 }}    // state to animate toward
  exit={{ opacity: 0, y: -20 }}     // state on unmount (needs AnimatePresence)
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  Hello
</motion.div>
```

- `initial` — where it starts. Set `initial={false}` to skip the mount animation and snap to `animate`.
- `animate` — the target. Change it (via state/props) and motion animates to the new values.
- `exit` — only runs when the element is wrapped in `AnimatePresence` (see below).
- `transition` — *how* to animate (timing, easing, spring). Applies to `animate`/`exit`.

Values you set directly on `style` are static; values in `animate` are animated. Animating
`transform` sub-properties (`x`, `y`, `scale`, `rotate`) and `opacity` is cheap and GPU-friendly
— prefer them. See [Performance](#performance).

## Variants — named states (use these for anything non-trivial)

Variants let you name states once and reuse them, and crucially **propagate from a parent to its
children** so you can orchestrate (e.g. stagger) without wiring each child.

```jsx
const list = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

<motion.ul variants={list} initial="hidden" animate="visible">
  {todos.map((t) => (
    <motion.li key={t.id} variants={item}>{t.text}</motion.li>
  ))}
</motion.ul>
```

The parent's `initial`/`animate` are **label strings**; children inherit the active label and
match their own `variants`, so you don't repeat `initial`/`animate` on each child. `staggerChildren`
and `delayChildren` live on the parent's `transition`. This is the idiomatic way to do entrance
animations for lists, cards, nav menus, etc.

## AnimatePresence — animate elements leaving the tree

React removes unmounting elements immediately, so `exit` needs `AnimatePresence` to defer removal
until the exit animation finishes.

```jsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      key="modal"                       // stable, unique key is REQUIRED
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      …
    </motion.div>
  )}
</AnimatePresence>
```

Rules that trip people up:
- Direct children of `AnimatePresence` **must have a unique, stable `key`**. Conditional renders
  (`cond && <motion.x/>`) work because the element is either present or not.
- `mode="wait"` finishes the outgoing exit before the incoming enters (great for swapping one
  thing for another, e.g. tab/route content). `mode="popLayout"` pops exiting items out of layout
  flow so remaining items reflow smoothly (great for removing list items). Default is concurrent.
- For route transitions, key the `AnimatePresence` child on the pathname.

## Gestures — hover, tap, focus, drag

Gesture props animate to a target while the gesture is active, then return:

```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ outline: "2px solid #6366f1" }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Save
</motion.button>
```

Drag:

```jsx
<motion.div
  drag                                  // or drag="x" / drag="y"
  dragConstraints={{ left: -100, right: 100, top: 0, bottom: 0 }}
  dragElastic={0.2}                     // overshoot resistance (0 = hard stop)
  whileDrag={{ scale: 1.1 }}
  onDragEnd={(event, info) => { /* info.offset, info.velocity */ }}
/>
```

`dragConstraints` can also be a ref to a container element to keep the draggable inside it.

## Layout animations — animate layout changes automatically

Add `layout` and motion animates position/size changes (caused by fl/grid reflow, reordering,
expand/collapse) using performant transforms — no manual from/to needed.

```jsx
<motion.div layout>…</motion.div>             // animate when its layout changes
```

Shared-element transitions: give two elements in different render states the **same `layoutId`**
and motion animates between them (e.g. an active-tab underline that slides, a thumbnail expanding
to a detail view).

```jsx
{tabs.map((tab) => (
  <button key={tab} onClick={() => setActive(tab)}>
    {tab}
    {active === tab && <motion.div layoutId="underline" className="underline" />}
  </button>
))}
```

Gotchas: `layout` animates transforms, so animating layout + scaling can distort children — wrap
text/children that shouldn't squish in their own `layout` element, or use `layout="position"` to
animate position only. Border-radius and box-shadow need to be set inline to scale-correct.

## Scroll animations

**Scroll-triggered (reveal on enter)** — simplest, no hooks:

```jsx
<motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}   // once = don't re-animate; amount = % visible to trigger
/>
```

**Scroll-linked (progress drives the value)** — use `useScroll` + `useTransform`:

```jsx
const { scrollYProgress } = useScroll();              // 0→1 over whole page
return <motion.div style={{ scaleX: scrollYProgress }} className="progress-bar" />;
```

`useScroll({ target: ref, offset: ["start end", "end start"] })` tracks one element through the
viewport. Map the 0→1 progress to any output with `useTransform`:

```jsx
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
const y = useTransform(scrollYProgress, [0, 1], [100, -100]);   // parallax
return <motion.img ref={ref} style={{ y }} />;
```

Drive a `style` prop with a **motion value** (output of `useScroll`/`useTransform`/`useSpring`),
not React state — motion values update outside React's render cycle, so scroll/drag stay smooth.

## Transitions & springs

`transition` controls timing. Two main types:

```jsx
transition={{ duration: 0.4, ease: "easeInOut" }}                 // tween (time-based)
transition={{ type: "spring", stiffness: 300, damping: 30 }}      // spring (physics-based)
```

- **Spring** feels natural for interactive UI (buttons, drag, layout). `stiffness` ↑ = snappier;
  `damping` ↑ = less bounce; `mass` ↑ = heavier/slower. `bounce` (0–1) + `duration` is an easier
  alternative knob set.
- **Tween** is predictable for entrances/exits. Eases: `"easeOut"`, `"easeInOut"`, `"anticipate"`,
  or a cubic-bezier array `[0.16, 1, 0.3, 1]`.
- Per-property transitions: `transition={{ default: {duration: 0.3}, scale: {type:"spring"} }}`.
- `useSpring(motionValue, { stiffness, damping })` smooths a jumpy motion value (e.g. lag a
  scroll-driven value for a trailing effect).

## Performance

The library is fast if you let it animate the right things:

- **Animate `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`.** These run on the compositor
  (GPU) and never trigger layout/paint. Animating `width`, `height`, `top`, `left`, `margin`, etc.
  forces layout on every frame — use `layout` (which converts size/position changes into transforms)
  or animate `scale`/`x`/`y` instead.
- **Drive continuous animations (scroll, drag, mouse) with motion values, not React state** —
  setting state every frame re-renders the whole subtree. `useScroll`/`useMotionValue`/`useTransform`
  bypass React renders.
- **Respect reduced motion.** `const reduce = useReducedMotion();` then skip/shrink movement when
  `true`. Users with vestibular sensitivity have this OS setting on.
- **Shrink the bundle with `LazyMotion`** if size matters: load only the features you use via
  `domAnimation`/`domMax` and use the lightweight `m` component instead of `motion`.
- Set `initial={false}` on elements that shouldn't animate on first paint (e.g. persisted UI state).

## Putting it together — quick recipes

For ready-to-paste implementations of common patterns (animated modal/dialog, staggered card grid,
route/page transitions, scroll progress bar, parallax, drag-to-reorder list, shared-layout tabs,
reduced-motion wrapper, and a `LazyMotion` setup), read
[references/patterns.md](references/patterns.md). Pull it up when the task matches one of those so
you reuse a vetted structure instead of reconstructing it.

For the less-common APIs (`useAnimate` imperative control, `useMotionValueEvent`, `MotionConfig`,
SVG path drawing with `pathLength`, `useInView`, custom variant `custom` prop), see
[references/advanced.md](references/advanced.md).

## Common mistakes to avoid

- Forgetting `AnimatePresence` around conditionally-rendered elements → `exit` silently does nothing.
- Missing/unstable `key` on `AnimatePresence` children → exit animations don't fire or fire wrong.
- Animating layout properties (`width`/`height`/`top`/`left`) instead of transforms → janky.
- Updating React state every frame for scroll/drag instead of using motion values → re-render storms.
- Putting `staggerChildren` on the child instead of the parent's `transition` → no stagger.
- Setting `initial` and `animate` to the same value and expecting motion → there must be a delta.
