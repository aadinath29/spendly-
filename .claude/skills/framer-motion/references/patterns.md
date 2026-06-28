# Framer Motion — copy-paste patterns

All imports are from `motion/react`. Adjust class names to the project's styling (this project
uses Tailwind 4). These are starting points — keep the structure, tune the values.

## Table of contents
- [Animated modal / dialog](#animated-modal--dialog)
- [Staggered card grid (entrance)](#staggered-card-grid-entrance)
- [Route / page transitions](#route--page-transitions)
- [Scroll progress bar](#scroll-progress-bar)
- [Parallax on scroll](#parallax-on-scroll)
- [Drag-to-reorder list](#drag-to-reorder-list)
- [Shared-layout animated tabs](#shared-layout-animated-tabs)
- [Reduced-motion-aware wrapper](#reduced-motion-aware-wrapper)
- [LazyMotion bundle setup](#lazymotion-bundle-setup)

## Animated modal / dialog

```jsx
import { motion, AnimatePresence } from "motion/react";

function Modal({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 bg-black/50 grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            key="panel"
            className="bg-white rounded-2xl p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## Staggered card grid (entrance)

```jsx
import { motion } from "motion/react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const card = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

function CardGrid({ items }) {
  return (
    <motion.div className="grid grid-cols-3 gap-4" variants={container} initial="hidden" animate="show">
      {items.map((it) => (
        <motion.div key={it.id} variants={card} className="rounded-xl border p-4">
          {it.title}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

To reveal on scroll instead of on mount, swap `animate="show"` for
`whileInView="show" viewport={{ once: true, amount: 0.2 }}`.

## Route / page transitions

With React Router v6 (`react-router-dom`, already in this project). Key the `AnimatePresence` on
the location so the old page exits as the new one enters. Use `mode="wait"` for a clean swap.

```jsx
import { AnimatePresence, motion } from "motion/react";
import { useLocation, useRoutes } from "react-router-dom";

function AnimatedRoutes() {
  const location = useLocation();
  const element = useRoutes(routes, location); // routes = your route config array
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
}
```

If using `<Routes>`/`<Route>` JSX instead of `useRoutes`, pass `location={location}` to `<Routes>`
and key the wrapping `motion.div` on `location.pathname`.

## Scroll progress bar

```jsx
import { motion, useScroll } from "motion/react";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
```

`origin-left` (CSS `transform-origin`) is required so the bar grows from the left.

## Parallax on scroll

```jsx
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

function Parallax({ src }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  return (
    <div ref={ref} className="overflow-hidden">
      <motion.img src={src} style={{ y }} className="w-full" />
    </div>
  );
}
```

## Drag-to-reorder list

Use the built-in `Reorder` namespace — no manual index math.

```jsx
import { Reorder } from "motion/react";
import { useState } from "react";

function ReorderableList() {
  const [items, setItems] = useState(["Rent", "Groceries", "Transit"]);
  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
      {items.map((item) => (
        <Reorder.Item key={item} value={item} className="rounded-lg border p-3 bg-white cursor-grab">
          {item}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
```

`Reorder.Item` is a motion component, so it accepts `whileDrag`, `layout`, etc. Keys/values must be
stable and unique.

## Shared-layout animated tabs

```jsx
import { motion } from "motion/react";
import { useState } from "react";

function Tabs({ tabs }) {
  const [active, setActive] = useState(tabs[0]);
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button key={tab} onClick={() => setActive(tab)} className="relative px-4 py-2">
          {tab}
          {active === tab && (
            <motion.div
              layoutId="tab-underline"
              className="absolute left-0 right-0 -bottom-px h-0.5 bg-indigo-500"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
```

The single `layoutId` makes the underline slide between tabs even though it's a different element
each render.

## Reduced-motion-aware wrapper

Centralize the accessibility check so every animation respects it.

```jsx
import { motion, useReducedMotion } from "motion/react";

function FadeIn({ children, y = 16 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

Alternatively wrap the app in `<MotionConfig reducedMotion="user">` to make motion auto-disable
transform/layout animations when the OS setting is on.

## LazyMotion bundle setup

Cut the animation bundle by loading features lazily and using the `m` component.

```jsx
import { LazyMotion, domAnimation, m } from "motion/react";

function App() {
  return (
    <LazyMotion features={domAnimation}>
      <m.div animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
        content
      </m.div>
    </LazyMotion>
  );
}
```

Use `domMax` instead of `domAnimation` if you need drag/layout/pan gestures. Inside `LazyMotion`,
use `m.*` (not `motion.*`) to get the size benefit.
