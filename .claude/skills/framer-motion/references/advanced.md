# Framer Motion — advanced / less-common APIs

All imports from `motion/react`.

## Imperative animation: `useAnimate`

When you need to trigger animations from event handlers, sequence them, or animate non-motion
elements, use the `animate` function from `useAnimate`. The `scope` ref limits selectors to its
subtree.

```jsx
import { useAnimate } from "motion/react";

function Notification() {
  const [scope, animate] = useAnimate();
  async function run() {
    await animate(scope.current, { x: 100 }, { duration: 0.3 });
    await animate("li", { opacity: 1 }, { delay: stagger(0.1) }); // selector within scope
  }
  return <div ref={scope}>…</div>;
}
```

Sequences: pass an array of `[element, keyframes, options]` segments to `animate(...)` to chain
them with overlap control via the segment's `at` option (`"<"`, `"-0.2"`, absolute time).

## Reacting to a motion value: `useMotionValueEvent`

```jsx
import { useScroll, useMotionValueEvent } from "motion/react";

const { scrollY } = useScroll();
useMotionValueEvent(scrollY, "change", (latest) => {
  setHidden(latest > previous && latest > 100); // e.g. hide navbar on scroll-down
});
```

Use this instead of subscribing manually; it cleans up automatically. Still avoid heavy React
state updates on every change — debounce or threshold.

## Global config: `MotionConfig`

Set defaults for the whole tree (transition, reduced motion, nonce for CSP).

```jsx
import { MotionConfig } from "motion/react";

<MotionConfig transition={{ duration: 0.4, ease: "easeInOut" }} reducedMotion="user">
  <App />
</MotionConfig>
```

`reducedMotion="user"` auto-disables transform/layout animation when the OS prefers reduced motion
— a clean app-wide accessibility default. Opacity/color still animate.

## SVG path drawing: `pathLength`

Animate a stroke "drawing in" by tweening `pathLength` (0→1), a motion-only normalized prop.

```jsx
<motion.path
  d="M 0 50 L 50 0 L 100 50"
  stroke="#6366f1" strokeWidth={3} fill="none"
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 1.2, ease: "easeInOut" }}
/>
```

Works on `path`, `circle`, `rect`, `line`, etc. `pathSpacing` and `pathOffset` give dashed/segment
effects.

## Detecting visibility: `useInView`

A hook (not the `whileInView` prop) for when you need the boolean in your own logic, not just to
drive an animation.

```jsx
import { useRef } from "react";
import { useInView } from "motion/react";

const ref = useRef(null);
const inView = useInView(ref, { once: true, amount: 0.5 });
return <div ref={ref}>{inView ? <Chart /> : <Skeleton />}</div>;
```

## Dynamic variants: the `custom` prop

Pass per-instance data into a variant function so each element can compute its own values (e.g.
index-based delay) while still sharing one variant definition.

```jsx
const variants = {
  hidden: { opacity: 0 },
  visible: (i) => ({ opacity: 1, transition: { delay: i * 0.1 } }),
};

{items.map((item, i) => (
  <motion.div key={item.id} custom={i} variants={variants} initial="hidden" animate="visible" />
))}
```

## Raw motion values: `useMotionValue` + `useTransform`

For mouse-follow, tilt, and other input-driven effects that should never re-render React:

```jsx
import { motion, useMotionValue, useTransform } from "motion/react";

function TiltCard() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 600 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left - r.width / 2);
        y.set(e.clientY - r.top - r.height / 2);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    />
  );
}
```

`useTransform` can also take a function for multi-input or non-linear mapping. Wrap an output in
`useSpring` to add smoothing/lag.
