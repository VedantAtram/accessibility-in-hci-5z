"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── DATA & CONSTANTS ───────────────────────────────────────────────────────

const POUR_DATA = {
  Perceivable: {
    letter: "P",
    definition: "Information and UI components must be presentable to users in ways they can perceive. If someone can't see, hear, or otherwise sense content, it simply does not exist for them.",
    passExample: {
      title: "✓ Real example: Hospital website with good alt text",
      code: '<img src="er-entrance.jpg"\n  alt="Main entrance to Mercy General\n  emergency room, glass doors with\n  red ER sign above">',
      desc: "A blind user navigating the hospital website knows exactly which entrance photo they're looking at.",
    },
    failExample: {
      title: "✗ Real example: E-commerce site missing alt text",
      code: '<img src="product-2847.jpg">\n<!-- Screen reader says: "image" -->\n<!-- User has no idea what product this is -->',
      desc: "A blind shopper on this retail site can't tell if this product image shows shoes, a jacket, or a laptop.",
    },
    annotation: {
      label: "Spot it on a real page",
      desc: 'On the Maplewood Library site, the interior photos have alt="OLYMPUS DIGITAL CAMERA," the camera\'s auto-generated filename, not a real description. Click the hero image or the About photo on the mock below to inspect the actual HTML and see the problem.',
    },
    scenarios: [
      'Product images on Amazon-style sites with alt="" or no alt attribute',
      "YouTube embeds or tutorial videos with no captions (affects 466M+ people with hearing loss globally)",
      "Infographics that convey data only through color, such as red vs. green charts with no labels",
      "Light gray placeholder text (#aaa) used as actual content on marketing sites",
    ],
  },
  Operable: {
    letter: "O",
    definition: "UI components and navigation must be operable. Every interactive element must work with keyboard, assistive tech, and alternative inputs, not just a mouse.",
    passExample: {
      title: "✓ Real example: Accessible date picker",
      code: '<input type="date"\n  aria-label="Check-in date"\n  onKeyDown={handleArrowKeys}>\n<!-- Arrow keys move between dates -->\n<!-- Enter selects a date -->\n<!-- Escape closes the picker -->',
      desc: "A keyboard user on a hotel booking site can pick travel dates using arrow keys, Enter, and Escape. No mouse needed.",
    },
    failExample: {
      title: "✗ Real example: Mouse-only mega menu",
      code: '<div class="mega-menu"\n  onMouseEnter={show}\n  onMouseLeave={hide}>\n  <!-- 42 navigation links inside -->\n  <!-- No keyboard event handlers -->\n  <!-- No skip-nav link on page -->\n</div>',
      desc: "A keyboard user on this university website can't open the department menu at all. It only responds to mouse hover.",
    },
    annotation: {
      label: "Spot it on a real page",
      desc: 'On the library site, the dropdown menus under "About," "Using The Library," etc. only open on mouse hover, and keyboard users can\'t access sub-pages like Library Cards, Meeting Rooms, or Event Calendar. Try clicking the nav area on the mock below to inspect the actual HTML.',
    },
    scenarios: [
      "Restaurant websites where the entire menu is a PDF opened via hover-only tooltip",
      "Banking sites with session timeouts that can't be extended (WCAG 2.2.1)",
      "E-commerce checkout flows where custom dropdowns trap keyboard focus",
      "News sites where the cookie consent banner has no visible focus indicator",
    ],
  },
  Understandable: {
    letter: "U",
    definition: "Information and operation of the UI must be understandable. Users should be able to comprehend content and predict how controls behave.",
    passExample: {
      title: "✓ Real example: Clear form validation",
      code: '<label for="email">Email address</label>\n<input id="email" type="email"\n  aria-describedby="email-error"\n  aria-invalid="true">\n<p id="email-error" role="alert">\n  Please enter a valid email\n  (e.g., name@example.com)\n</p>',
      desc: "The user on this signup form sees exactly what's wrong and how to fix it, with the error linked to the input.",
    },
    failExample: {
      title: "✗ Real example: Cryptic error after form submit",
      code: '<div class="toast error">\n  Error code: 0x80070005\n  Request failed.\n</div>\n<!-- No link to the problem field -->\n<!-- No explanation of what to fix -->',
      desc: "A user on this government benefits form sees a hex error code after submitting 12 fields, with no idea which field failed or why.",
    },
    annotation: {
      label: "Spot it on a real page",
      desc: 'On the library site, the "Sign up for newsletter" form has placeholder text as the only label, so it disappears when you start typing, so you forget which field you\'re in. After submitting, the page shows "Error 422" with no human-readable message. On success, nothing visible changes and no confirmation appears.',
    },
    scenarios: [
      "Healthcare portals showing \"Error: null\" after patient form submission",
      "Government sites where the navigation layout completely changes between sections",
      "Banking apps that auto-redirect without warning when session refreshes",
      "E-commerce sites where the language switches mid-page (e.g., checkout in untranslated English on a Spanish site)",
    ],
  },
  Robust: {
    letter: "R",
    definition: "Content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies like screen readers.",
    passExample: {
      title: "✓ Real example: Semantic navigation",
      code: '<nav aria-label="Main navigation">\n  <ul role="menubar">\n    <li role="none">\n      <a role="menuitem" href="/catalog">\n        Browse Catalog\n      </a>\n    </li>\n  </ul>\n</nav>',
      desc: "VoiceOver announces: 'Main navigation, menu bar, Browse Catalog, menu item.' The user knows exactly where they are.",
    },
    failExample: {
      title: "✗ Real example: Div-based navigation",
      code: '<div class="nav-wrapper">\n  <div class="nav-item"\n    onclick="location=\'/catalog\'">\n    Browse Catalog\n  </div>\n</div>\n<!-- No <nav>, no <a>, no roles -->\n<!-- VoiceOver says: "Browse Catalog" -->\n<!-- (just text, not a link or nav) -->',
      desc: "VoiceOver can't tell this is navigation. JAWS doesn't list it in the landmarks menu. The user has no way to jump to the nav.",
    },
    annotation: {
      label: "Spot it on a real page",
      desc: 'On the library site, the custom "FAQ accordion" sections use <div onclick> instead of <button> with aria-expanded. Screen readers announce them as plain text, and users don\'t know they\'re expandable. The event calendar widget uses duplicate IDs (id="event" on every card), which breaks label associations.',
    },
    scenarios: [
      "WordPress themes using <div class='button'> instead of <button> for CTAs",
      "React SPAs where client-side routing doesn't announce page changes to screen readers",
      "Custom dropdown selects built with <div> and <span> missing role='listbox' and role='option'",
      "Legacy jQuery UI widgets with broken or outdated ARIA patterns (e.g., missing aria-expanded on accordions)",
    ],
  },
};

const WORKED_EXAMPLE_STEPS = [
  {
    principle: "Perceivable",
    title: "Step 1: Check Perceivable",
    inspect: 'Open maplewoodpubliclibrary.org. Right-click on the library interior photo and choose "Inspect" to check its alt attribute. Then check the text contrast on the hero banner.',
    questions: [
      "Does the library interior photo have meaningful, descriptive alt text?",
      "Is the hero banner heading text readable against the background? (Check with WebAIM Contrast Checker)",
      "Do any images on the page use auto-generated or camera-default alt text?",
      "Does the About section photo have descriptive alt text, or does it repeat the same issue?",
    ],
    finding: 'The interior photos have alt="OLYMPUS DIGITAL CAMERA," which is the camera\'s auto-generated filename, not a real description. A screen reader literally announces "OLYMPUS DIGITAL CAMERA" which tells the user nothing about what the photo shows. Several images use generic title attributes instead of descriptive alt text.',
    whyItMatters: 'A blind patron hears "OLYMPUS DIGITAL CAMERA" and has no idea they\'re looking at the library\'s reading room. This is worse than an empty alt because it actively confuses the user with meaningless text. It\'s a real issue found on the actual maplewoodpubliclibrary.org site.',
    tip: "In Chrome DevTools, hover over any text to see its computed contrast ratio in the color picker. Anything below 4.5:1 for normal text is a WCAG AA failure.",
  },
  {
    principle: "Operable",
    title: "Step 2: Check Operable",
    inspect: "Put your mouse aside. Starting from the browser's address bar, press Tab repeatedly and try to reach every interactive element on the library page.",
    questions: [
      'Can you Tab into the "Using The Library ▾" dropdown and open it with Enter or Space?',
      "Is there a 'Skip to content' link that appears when you first Tab into the page?",
      "Can you see a visible focus ring (outline) on each element as you Tab through?",
      "Can you navigate to and activate the event registration buttons using only keyboard?",
    ],
    finding: 'The dropdown sub-menus under "About," "Using The Library," etc. rely on mouse hover to open, and keyboard users pressing Tab skip right past them. The site does have a "Skip to content" link, which is good! But focus indicators are minimal on some interactive elements, and the mobile menu toggle behavior is inconsistent across screen sizes.',
    whyItMatters: 'A patron using a switch device or keyboard can\'t browse the dropdown navigation to find pages like "Library Cards" or "Event Calendar," and they\'d need to know the exact URL. The dropdown menus contain the library\'s most important links.',
    tip: 'Try this right now: press Tab on any website. If you lose track of where the focus is, that site has an Operable problem. This is what keyboard-only users experience every day.',
  },
  {
    principle: "Understandable",
    title: "Step 3: Check Understandable",
    inspect: 'Interact with the "Sign up for our newsletter" form. Try submitting it empty, with a bad email, and with valid data. Read every message carefully.',
    questions: [
      "Do the form fields have visible, persistent labels (not just placeholder text)?",
      "When you submit with errors, does the page explain what's wrong in plain language?",
      "After a successful submission, does a clear confirmation message appear?",
      "Is the page's primary language set in the HTML (<html lang='en'>)?",
    ],
    finding: 'The form uses placeholder text as labels, so once you start typing, you can\'t see what the field is for. Submitting with a bad email shows "Error 422" with no explanation. After a successful submit, the form silently resets with no "Thank you" message, no confirmation, nothing.',
    whyItMatters: 'A user with a cognitive disability may forget which field they\'re filling in when placeholders disappear. "Error 422" means nothing to anyone without developer experience. The silent success leaves every user wondering "Did that work?"',
    tip: "The golden rule: if you have to guess what happened after clicking a button, the page fails Understandable. Every action should have a clear, human-readable response.",
  },
  {
    principle: "Robust",
    title: "Step 4: Check Robust",
    inspect: 'Open the browser\'s DevTools (F12), go to the Elements tab, and inspect the page\'s HTML structure. Look at how navigation, the FAQ accordion, and event cards are built. Also try running the "axe DevTools" extension.',
    questions: [
      "Does the page use <nav>, <main>, <header>, <footer> landmarks?",
      "Do the FAQ accordion panels use <button> with aria-expanded, or just <div onclick>?",
      "Are there duplicate id attributes? (Search the source for repeated IDs)",
      "Does the navigation use <a> tags for links, or <div onclick> workarounds?",
    ],
    finding: 'The page uses <header> and <main> landmarks correctly, which is good! But the FAQ accordion uses <div class="faq-toggle" onclick="toggleFAQ(3)"> with no <button>, no aria-expanded, and no keyboard handler. Three event cards all share id="event-card", which breaks any label association. The nav links use <div onclick> instead of <a href>.',
    whyItMatters: 'JAWS and NVDA can\'t announce FAQ items as expandable controls because they\'re invisible as interactive elements. Duplicate IDs mean aria-labelledby references are ambiguous. Using <div onclick> instead of <a> means screen readers don\'t announce these as links.',
    tip: 'Run "axe DevTools" in Chrome. It catches duplicate IDs, missing ARIA roles, and non-semantic elements automatically. It found 14 issues on this one page in under 2 seconds.',
  },
];

// 7 audit checkpoints: 5 are real violations, 2 are things the site does correctly.
// Learner must identify which are violations, classify under POUR, and rate severity.
type Severity = "Low" | "Medium" | "High" | null;
type AuditFinding = {
  id: string;
  element: string;
  observation: string;
  hint?: string;
  isViolation: boolean;
  correctPour: Pour;
  correctSeverity: Severity;
  wcag: string;
  explanation: string;
  impact: string;
  fixSuggestion?: string | null;
};

const AUDIT_FINDINGS: AuditFinding[] = [
  {
    id: "alt-text",
    element: "Hero & About Section Images",
    observation: 'Inspect the hero banner photo and the building photo in the About section. Both have an alt attribute, but look at what it says.',
    hint: 'Try clicking the hero image in inspect mode. What does the alt attribute actually contain?',
    isViolation: true,
    correctPour: "Perceivable",
    correctSeverity: "High",
    wcag: "1.1.1 Non-text Content",
    explanation: 'Both images use alt="OLYMPUS DIGITAL CAMERA," the camera\'s auto-generated metadata, not a human-written description. One shows the library interior, the other the building exterior, but a screen reader announces the same meaningless text for both. This is a real issue on maplewoodpubliclibrary.org.',
    impact: "Affects all screen reader users on every page load. Two different photos are indistinguishable, and the user hears identical meaningless text for both.",
    fixSuggestion: 'Replace with descriptive text: alt="Maplewood Library reading room with bookshelves and seating areas" and alt="Maplewood Public Library brick building exterior on Lohmeyer Avenue"',
  },
  {
    id: "nav-keyboard",
    element: "Navigation Dropdown Menus",
    observation: 'The main nav has 5 dropdown menus (About ▾, Using The Library ▾, etc). Try using only your keyboard: can you access the sub-menu items like "Library Cards" or "Event Calendar"?',
    hint: 'Click the nav area in inspect mode. Look at the event handlers: is there an onkeydown or onfocus handler?',
    isViolation: true,
    correctPour: "Operable",
    correctSeverity: "High",
    wcag: "2.1.1 Keyboard",
    explanation: 'The dropdown sub-menus only open on mouse hover (onmouseenter). There are no keyboard event handlers: no onkeydown, no onfocus, no aria-expanded. Keyboard users can Tab to the top-level items but can never reach the 20+ sub-pages hidden inside the dropdowns.',
    impact: "Blocks keyboard and switch-device users from accessing most of the site's content. Pages like Library Cards, Meeting Rooms, and Event Calendar are only reachable via dropdown.",
    fixSuggestion: 'Add keyboard handlers: Enter/Space to toggle dropdown, Arrow keys to navigate items, Escape to close. Add aria-expanded and aria-haspopup attributes.',
  },
  {
    id: "form-labels",
    element: "Newsletter Signup Form",
    observation: 'Look at the newsletter form\'s input fields. Do they have visible labels, or only placeholder text? What happens when you submit with invalid data?',
    hint: 'Click the form in inspect mode. Are there any <label> elements? What does the error message say?',
    isViolation: true,
    correctPour: "Understandable",
    correctSeverity: "Medium",
    wcag: "3.3.2 Labels or Instructions",
    explanation: 'The form uses placeholder text ("Your name", "Email address") as its only labels, and they vanish when the user types. Invalid submissions show "Error 422" (a raw HTTP status code) with no explanation. Successful submissions silently reset the form with no confirmation message.',
    impact: "Users with cognitive disabilities forget which field they're in once placeholders disappear. All users are confused by 'Error 422.' Everyone wonders if their submission worked.",
    fixSuggestion: 'Add persistent <label> elements above each input. Replace "Error 422" with "Please enter a valid email address (e.g., name@example.com)." Add a success confirmation: "Thanks! You\'re subscribed."',
  },
  {
    id: "faq-semantics",
    element: "FAQ Accordion Section",
    observation: 'The FAQ section has expandable questions. Inspect the HTML: are these built with <button> elements and ARIA attributes, or something else?',
    hint: 'Click the FAQ area in inspect mode. What HTML element is used? Is there an aria-expanded attribute?',
    isViolation: true,
    correctPour: "Robust",
    correctSeverity: "Medium",
    wcag: "4.1.2 Name, Role, Value",
    explanation: 'The FAQ items are <div onclick="toggleFAQ()"> elements with no <button>, no role attribute, no aria-expanded, no keyboard handler, not in the tab order. Screen readers announce these as static text. Users have no idea they are interactive or expandable.',
    impact: "Screen reader users can't discover or operate the FAQ. Keyboard users can't reach or activate the items. The FAQ content is effectively hidden from assistive technology users.",
    fixSuggestion: 'Rebuild each FAQ item using <button aria-expanded="false"> to toggle a panel. Add keyboard support (Enter/Space to toggle). JAWS will then announce "How do I get a library card? collapsed button."',
  },
  {
    id: "focus-indicators",
    element: "Focus Indicators on Interactive Elements",
    observation: 'Press Tab repeatedly through the page. Can you see a visible outline or highlight on each focused element, or does focus seem to disappear?',
    hint: 'This isn\'t about one specific element; it\'s about a global CSS rule. What happens to the browser\'s default outline?',
    isViolation: true,
    correctPour: "Operable",
    correctSeverity: "High",
    wcag: "2.4.7 Focus Visible",
    explanation: 'The site uses the CSS rule * { outline: none; } which suppresses the browser\'s default focus indicator on all elements. When a keyboard user presses Tab, they have no visual indication of which element is currently focused. They are navigating blind.',
    impact: "Every keyboard user on every page, and they can Tab through elements but can't see where they are. This makes the entire site nearly unusable via keyboard.",
    fixSuggestion: 'Remove * { outline: none; }. Add a custom focus style: :focus-visible { outline: 2px solid #0b610b; outline-offset: 2px; } for a branded but visible indicator.',
  },
  {
    id: "landmarks",
    element: "Page Landmark Structure",
    observation: 'Inspect the page\'s top-level HTML structure. Does it use semantic elements like <header>, <main>, and <footer>, or generic <div> wrappers?',
    hint: 'Look at the outermost HTML elements. Are they <div class="header"> or actual <header> tags?',
    isViolation: false,
    correctPour: "Robust",
    correctSeverity: null,
    wcag: "4.1.2 Name, Role, Value",
    explanation: 'The page correctly uses HTML5 landmark elements (<header>, <main>, <footer>) which provide proper roles for assistive technologies. Screen reader users can jump between these sections using shortcut keys (e.g., pressing "m" in NVDA jumps to <main>). This is Robust because the markup is correctly interpreted by diverse user agents.',
    impact: "This is done correctly, and screen reader users can efficiently navigate the page structure.",
    fixSuggestion: null,
  },
  {
    id: "skip-link",
    element: '"Skip to Content" Link',
    observation: 'Press Tab once from the browser\'s address bar. Does a "Skip to content" link appear at the top of the page?',
    hint: 'This is a common accessibility feature: a hidden link that becomes visible on focus. Does this site have one?',
    isViolation: false,
    correctPour: "Operable",
    correctSeverity: null,
    wcag: "2.4.1 Bypass Blocks",
    explanation: 'The site includes a "Skip to content" link as the first focusable element. When a keyboard user presses Tab, this link appears and allows them to jump directly past the navigation to the main content area. This correctly implements WCAG 2.4.1.',
    impact: "This is done correctly, and keyboard users can skip repetitive navigation on every page.",
    fixSuggestion: null,
  },
];

const PRETEST_QUESTIONS = [
  {
    id: "q1",
    text: "A user who is blind cannot tell what an image shows because there is no alt text. Which POUR principle is violated?",
    options: ["Operable", "Perceivable", "Understandable", "Robust"],
    correct: "Perceivable",
    explanation: "Alt text makes images perceivable to screen reader users. Without it, the image content cannot be perceived at all. This is a Perceivable violation because the information is invisible to the user's senses.",
    lo: "LO1",
  },
  {
    id: "q2",
    text: "A form submits but gives no confirmation message. The user doesn't know if it worked. Which POUR principle is violated?",
    options: ["Operable", "Perceivable", "Understandable", "Robust"],
    correct: "Understandable",
    explanation: "The user can see and interact with the form, so it's perceivable and operable. But they can't understand the result of their action. Missing feedback makes the interface unpredictable, which is an Understandable violation.",
    lo: "LO1",
  },
  {
    id: "q3",
    text: "A video has no captions. Which POUR principle is violated?",
    options: ["Operable", "Perceivable", "Understandable", "Robust"],
    correct: "Perceivable",
    explanation: "Captions make audio content perceivable to deaf and hard-of-hearing users. Without captions, the video's audio content cannot be perceived. This is a Perceivable violation.",
    lo: "LO1",
  },
];

// Practice questions: DIFFERENT from pre/post-test (Redundancy Principle)
const PRACTICE_Q1 = {
  id: "pq1",
  text: 'On an airline booking website, the seat selection map is built entirely with <div> and <span> elements styled to look like seats. There are no ARIA roles (role="grid", role="gridcell"), no aria-labels, and no aria-selected states. A screen reader user hears only a stream of meaningless text. Which POUR principle is violated?',
  options: ["Perceivable", "Operable", "Understandable", "Robust"],
  correct: "Robust",
  explanation: 'The seat map isn\'t robust enough for assistive technologies to interpret. Without semantic markup or ARIA roles (role="grid", role="gridcell", aria-selected), screen readers can\'t parse the widget\'s structure or state. The content looks fine visually but falls apart for non-visual user agents.',
  hint: "The user can perceive text on screen and the controls are mouse-operable. The issue is specifically about whether assistive technology can interpret the widget's structure.",
  lo: "LO1",
};

const PRACTICE_Q2 = {
  id: "pq2",
  text: "On a healthcare patient portal, the navigation menu has no visible focus indicator. When a patient uses Tab to navigate (because they have a hand tremor and can't use a mouse precisely), they can see the menu items but can't tell which one is currently focused. They press Enter randomly, hoping they're on the right link. Which POUR principle is violated?",
  options: ["Perceivable", "Operable", "Understandable", "Robust"],
  correct: "Operable",
  explanation: "The menu items are visible (Perceivable) and the HTML is valid (Robust), but the lack of focus indicators makes the navigation effectively inoperable for keyboard users. They can technically Tab to elements but can't effectively operate the interface because they don't know where focus is.",
  hint: "The user can see all the menu options. The content is there. But can they effectively use the navigation with their input method?",
  lo: "LO1",
};

const PRIORITY_ITEMS = [
  { id: "alt", text: "Images have no alt text", impact: "High", severity: "High", frequency: "Every page load", explanation: "Completely blocks all image information for screen reader users. A blind user has no idea what any image shows. Affects every visit by every blind or low-vision user." },
  { id: "contrast", text: "Color contrast ratio is 2.5:1 (fails AA)", impact: "High", severity: "High", frequency: "Every page load", explanation: "Makes text very difficult to read for users with low vision, color blindness, or anyone in bright light. The WCAG AA minimum is 4.5:1, so 2.5:1 is a significant failure affecting a large user population." },
  { id: "skipnav", text: "Page has no skip navigation link", impact: "Medium", severity: "Medium", frequency: "Every page load", explanation: "Forces keyboard users to Tab through all navigation items before reaching page content. Frustrating and time-consuming, but does not completely block access to content." },
  { id: "decorative", text: "Decorative icon has no aria-label", impact: "Low", severity: "Low", frequency: "Every page load", explanation: "Screen readers may announce the decorative icon unnecessarily. A minor annoyance that adds noise to the screen reader experience but does not block understanding of any real content." },
];

// ─── UTILITY COMPONENTS ─────────────────────────────────────────────────────

// Reusable types
type Pour = "Perceivable" | "Operable" | "Understandable" | "Robust";
type Question = { id: string; text: string; options: string[]; correct: string; explanation?: string };


function SkipLink() {
  return (
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-teal-700 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:text-sm">
      Skip to main content
    </a>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total} aria-label={`Progress: step ${current} of ${total}`}>
        <div className="h-full bg-teal-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm text-gray-500 font-mono whitespace-nowrap" aria-hidden="true">{current} / {total}</span>
    </div>
  );
}

function Card({ children, className = "", ...rest }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode; className?: string }) {
  return (
    <div {...rest} className={`border border-gray-200 rounded-xl p-5 bg-white shadow-sm ${className}`}>{children}</div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "Continue",
  backLabel = "Back",
  nextDisabled = false,
}: {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  backLabel?: string
  nextDisabled?: boolean
}) {
  return (
    <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
      {onBack ? (
        <button onClick={onBack} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">{backLabel}</button>
      ) : <div />}
      {onNext && (
        <button onClick={onNext} disabled={nextDisabled} className="px-5 py-2 text-sm font-medium text-white bg-teal-700 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{nextLabel}</button>
      )}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs font-mono overflow-x-auto text-gray-700 my-2 leading-relaxed whitespace-pre-wrap">{code}</pre>
  );
}

function FeedbackBanner({
  correct,
  message,
}: {
  correct: boolean
  message: string
}) {
  return (
    <div className={`mt-3 p-4 rounded-xl border text-sm leading-relaxed ${correct ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`} role="status" aria-live="polite">
      <span className="font-semibold">{correct ? "✓ Correct!" : "✗ Not quite."}</span>{" "}{message}
    </div>
  );
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode
}) {
  return <p className="text-xs uppercase tracking-wide text-teal-600 font-semibold mb-1">{children}</p>;
}

// ─── INTERACTIVE MOCK WEBPAGE: Maplewood Public Library (maplewoodpubliclibrary.org) ────
// Learners click elements to "inspect" them, revealing HTML source + POUR violations
// This IS the teaching tool, not just a picture.

function LibraryPhotoSvg() {
  return (
    <svg viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f5f0e0"/><stop offset="100%" stopColor="#e8dcc8"/></linearGradient>
      </defs>
      <rect width="400" height="140" fill="url(#wall)"/>
      <rect x="0" y="95" width="400" height="45" fill="#8B7355" opacity="0.22"/>
      {[30,120,210,300].map(x=>(
        <g key={x}>
          <rect x={x} y="8" width="52" height="80" fill="#B0D4E8" rx="2" stroke="#b8a882" strokeWidth="1"/>
          <line x1={x+26} y1="8" x2={x+26} y2="88" stroke="#b8a882" strokeWidth="0.6"/>
          <line x1={x} y1="48" x2={x+52} y2="48" stroke="#b8a882" strokeWidth="0.6"/>
        </g>
      ))}
      {[90,180,270].map(x=>(
        <g key={x}>
          <rect x={x} y="25" width="22" height="60" fill="#654321" rx="1" opacity="0.75"/>
          {[30,39,48,57,66,75].map((y,i)=>(
            <rect key={y} x={x+2} y={y} width="18" height="6" fill={["#c0392b","#2980b9","#27ae60","#f39c12","#8e44ad","#1abc9c"][i]} rx="0.5" opacity="0.55"/>
          ))}
        </g>
      ))}
      {[105,225].map(x=>(
        <g key={x}>
          <rect x={x} y="102" width="65" height="4" fill="#A0522D" rx="1"/>
          {[[x+18,97],[x+45,97]].map(([px,py],i)=>(
            <g key={i}><ellipse cx={px} cy={py} rx="4" ry="6" fill={["#4a6741","#5b4a8a"][i]} opacity="0.45"/><circle cx={px} cy={py-8} r="3.5" fill="#DEB887" opacity="0.5"/></g>
          ))}
        </g>
      ))}
    </svg>
  );
}

// The inspectable element wrapper: click to reveal code + POUR violation
function Inspectable({
  id,
  activeId,
  onInspect,
  label,
  code,
  violation,
  principle,
  children,
  className = "",
}: {
  id: string
  activeId: string | null
  onInspect: (id: string | null) => void
  label: string
  code: string
  violation: string
  principle: "Perceivable" | "Operable" | "Understandable" | "Robust"
  children: React.ReactNode
  className?: string
}) {
  const isActive = activeId === id;
  type Pour = "Perceivable" | "Operable" | "Understandable" | "Robust";
  type ColorKey = "blue" | "orange" | "purple" | "red" | "gray";

  const principleColors: Record<Pour, Exclude<ColorKey, "gray">> = { Perceivable: "blue", Operable: "orange", Understandable: "purple", Robust: "red" };
  const pc: ColorKey = principleColors[principle as Pour] ?? "gray";

  const ringColors: Record<ColorKey, string> = { blue: "#3b82f6", orange: "#f97316", purple: "#8b5cf6", red: "#ef4444", gray: "#9ca3af" };
  const rc = ringColors[pc];

  return (
    <div className={`relative group ${className}`}>
      <div
        onClick={(e) => { e.stopPropagation(); onInspect(isActive ? null : id); }}
        className="cursor-pointer transition-all duration-150 rounded"
        style={isActive
          ? { boxShadow: `0 0 0 2.5px ${rc}`, background: `${rc}08` }
          : { boxShadow: `0 0 0 1.5px ${rc}50` }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.boxShadow = `0 0 0 2px ${rc}`; e.currentTarget.style.background = `${rc}10`; }}
        onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.boxShadow = `0 0 0 1.5px ${rc}50`; e.currentTarget.style.background = ''; } }}
        title={`Click to inspect: ${label}`}
        role="button"
        tabIndex={0}
        aria-label={`Inspect: ${label}`}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onInspect(isActive ? null : id); } }}
      >
        {children}
        {/* Hover/focus hint label */}
        <div className={`absolute -top-5 left-1 px-1.5 py-0.5 rounded text-white font-bold pointer-events-none transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"}`}
          style={{fontSize:"8px", background: isActive ? rc : "#555", zIndex: 10, whiteSpace: "nowrap"}}>
          {isActive ? `✕ Close` : `🔍 Click to inspect`}
        </div>
      </div>
      {/* Inspection panel: simulates DevTools */}
      {isActive && (
        <div className="mt-1 border rounded-md overflow-hidden shadow-lg bg-gray-900 text-white relative" style={{zIndex:20, fontSize:"7.5px"}}>
          {/* DevTools-style header */}
          <div className="flex items-center justify-between px-2 py-1 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Elements</span>
              <span className="text-gray-600">|</span>
              <span className="text-yellow-400 font-medium">Accessibility</span>
            </div>
            <button onClick={(e)=>{e.stopPropagation();onInspect(null);}} className="text-gray-400 hover:text-white font-bold px-1">✕</button>
          </div>
          {/* HTML source */}
          <div className="px-2 py-1.5 font-mono border-b border-gray-700" style={{fontSize:"7px",lineHeight:"1.5"}}>
            <pre className="whitespace-pre-wrap text-green-300">{code}</pre>
          </div>
          {/* POUR violation callout */}
          <div className="px-2 py-1.5 flex items-start gap-1.5">
            <span className={`flex-shrink-0 px-1 py-0.5 rounded font-bold text-white`}
              style={{fontSize:"6.5px", background: pc === "blue" ? "#3b82f6" : pc === "orange" ? "#f97316" : pc === "purple" ? "#8b5cf6" : "#ef4444"}}>
              {principle}
            </span>
            <span className="text-gray-300 leading-snug">{violation}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MockWebpage({ highlights = [], mode = "static" }: { highlights?: string[]; mode?: "static" | "inspect" }) {
  type Area = "hero" | "images" | "nav" | "faq" | "form" | "contrast" | "video";
  const hl = (area: Area) => highlights.includes(area);
  const green = "#0b610b";

  // Interactive inspection mode state, only used on screens that enable it
  const [inspecting, setInspecting] = useState<string | null>(null);
  const interactive = mode === "inspect";

  // Wrap elements for inspection or for static highlight mode
  const Wrap: any = interactive
    ? Inspectable
    : ({ children, id, className = "" }: { children: React.ReactNode; id: string; className?: string }) => {
        const areaMap: Record<string, Area> = { heroImg: "hero", aboutImg: "images", navDropdown: "nav", faqAccordion: "faq", formSection: "form" };
        const area = areaMap[id];
        return (
          <div className={`${className} ${area && hl(area) ? "ring-2 ring-red-400 rounded relative" : ""}`}>
            {children}
            {area && hl(area) && (
              <div className="absolute -top-3 right-1 bg-red-600 text-white rounded px-1 py-0.5 font-bold" style={{ fontSize: "6.5px", zIndex: 5 }}>⚠</div>
            )}
          </div>
        );
      };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white select-none shadow-sm text-xs"
      role="img" aria-label="Maplewood Public Library website: click elements to inspect their HTML and accessibility"
      onClick={() => interactive && setInspecting(null)}>

      {/* ─── MODE INDICATOR ─── */}
      {interactive && (
        <>
        <div className="bg-gray-900 text-white px-3 py-2 flex items-center gap-2.5" style={{fontSize:"10px"}}>
          <span className="relative flex items-center">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-blue-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded font-bold text-xs tracking-wide">INTERACTIVE</span>
          <span className="text-gray-200">Click any <span className="text-blue-300 font-semibold">color-highlighted</span> area to inspect its HTML and accessibility issues</span>
        </div>
        <div className="bg-gray-800 px-3 py-1 flex items-center gap-3 flex-wrap" style={{fontSize:"9px"}}>
          <span className="text-gray-400">Border colors by principle:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:"#3b82f6"}}></span><span className="text-blue-300">Perceivable</span></span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:"#f97316"}}></span><span className="text-orange-300">Operable</span></span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:"#8b5cf6"}}></span><span className="text-purple-300">Understandable</span></span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:"#ef4444"}}></span><span className="text-red-300">Robust</span></span>
        </div>
        </>
      )}

      {/* ─── BROWSER CHROME ─── */}
      <div className="bg-gradient-to-b from-gray-200 to-gray-100 border-b border-gray-300 px-2.5 py-1 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-red-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 border border-green-500/30" />
        </div>
        <div className="flex-1 bg-white rounded-md px-2 py-0.5 border border-gray-200 flex items-center gap-1 shadow-inner" style={{fontSize:"8px"}}>
          <span className="text-gray-400">🔒</span>
          <span className="text-gray-500">maplewoodpubliclibrary.org</span>
        </div>
      </div>

      {/* ─── TOP UTILITY BAR ─── */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-100" style={{fontSize:"7px",background:"#f8f8f8"}}>
        <div className="flex items-center gap-2 text-gray-400">
          <span>📘 Facebook</span>
          <span>📷 Instagram</span>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <span>Home</span>
          <span>My Account</span>
          <span className="font-medium">314-781-READ</span>
        </div>
      </div>

      {/* ─── HEADER + NAV ─── */}
      <div className={`flex items-center justify-between px-3 py-2 bg-white border-b border-gray-100`}>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{background:green}}>
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-white" fill="currentColor">
              <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm8-1a1 1 0 00-1 1v12a1 1 0 001 1h4a1 1 0 001-1V4a1 1 0 00-1-1h-4z"/>
            </svg>
          </div>
          <div>
            <div className="font-bold leading-none" style={{fontSize:"10px",color:green}}>Maplewood Public Library</div>
            <div className="text-gray-400" style={{fontSize:"6.5px"}}>A Missouri State Library</div>
          </div>
        </div>
        <Wrap id="navDropdown" activeId={inspecting} onInspect={setInspecting}
          label="Navigation Dropdown" principle="Operable"
          code={`<div class="menu-item"\n  onmouseenter="showSubmenu()">\n  Using The Library ▾\n  <div class="submenu" style="display:none">\n    <!-- 6 links hidden until hover -->\n  </div>\n</div>\n<!-- No onkeydown, no onfocus -->\n<!-- No aria-expanded attribute -->`}
          violation="Dropdown menus only open on mouse hover. Keyboard users can Tab to the top-level item but can't access any sub-pages like 'Library Cards' or 'Meeting Rooms.' Needs keyboard handlers + aria-expanded.">
          <div className="flex items-center gap-2" style={{fontSize:"8px"}}>
            <span className="text-gray-600 cursor-default font-medium">About ▾</span>
            <span className="text-gray-600 cursor-default font-medium border-b-2 border-dashed border-orange-300">Using The Library ▾</span>
            <span className="text-gray-600 cursor-default font-medium">Online Resources ▾</span>
            <span className="text-gray-600 cursor-default font-medium">What's Happening ▾</span>
            <span className="text-gray-600 cursor-default font-medium">Youth Services ▾</span>
            <svg viewBox="0 0 16 16" className="w-3 h-3 text-gray-400"><circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5"/><line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5"/></svg>
          </div>
        </Wrap>
      </div>

      {/* ─── HERO with inspectable image ─── */}
      <Wrap id="heroImg" activeId={inspecting} onInspect={setInspecting}
        label="Hero Image Alt Text" principle="Perceivable"
        code={`<img src="P1010051-cropped-scaled.jpg"\n  alt="OLYMPUS DIGITAL CAMERA"\n  title="OLYMPUS DIGITAL CAMERA"\n  class="hero-image">\n\n<!-- alt text is the camera's auto-generated\n     filename, not a description of the photo.\n     Screen reader announces:\n     "OLYMPUS DIGITAL CAMERA, image" -->`}
        violation='The alt text is "OLYMPUS DIGITAL CAMERA," auto-generated by the camera, not written by a human. A screen reader user hears meaningless camera metadata instead of "Library interior with bookshelves and reading tables." This is a real issue on the actual maplewoodpubliclibrary.org site.'>
        <div className="relative h-20 overflow-hidden">
          <LibraryPhotoSvg />
          <div className="absolute inset-0" style={{background:"linear-gradient(to right, rgba(11,97,11,0.75) 0%, rgba(11,97,11,0.4) 60%, transparent 100%)"}} />
          <div className="absolute inset-0 flex items-center px-4">
            <div>
              <div className="font-bold text-white leading-tight" style={{fontSize:"13px"}}>Welcome To The Maplewood</div>
              <div className="font-bold text-white leading-tight" style={{fontSize:"13px"}}>Public Library</div>
            </div>
          </div>
          {/* Code tag showing the real alt attribute */}
          {(interactive || hl("hero")) && (
            <div className="absolute bottom-1 right-1 bg-black/70 text-amber-300 rounded px-1.5 py-0.5 font-mono" style={{fontSize:"6.5px"}}>
              alt="OLYMPUS DIGITAL CAMERA"
            </div>
          )}
        </div>
      </Wrap>

      {/* ─── MISSION ─── */}
      <div className="px-3 py-2 text-center border-b border-gray-100">
        <p className="text-gray-500 leading-relaxed italic" style={{fontSize:"8px"}}>We seek to provide the community a diverse offering of print and electronic materials, services, and opportunities for learning, entertainment, and social interaction.</p>
      </div>

      {/* ─── ABOUT + PHOTO ─── */}
      <div className="px-3 py-2 grid grid-cols-2 gap-2 border-b border-gray-100">
        <div>
          <div className="uppercase font-bold tracking-wider mb-0.5" style={{fontSize:"6.5px",color:green}}>About</div>
          <div className="font-bold text-gray-800 mb-1" style={{fontSize:"9px"}}>The Maplewood Public Library</div>
          <p className="text-gray-500 leading-relaxed" style={{fontSize:"7px"}}>Our library serves Maplewood, Missouri, a near suburb of St. Louis. Founded in 1935, one of the oldest in the area.</p>
          <div className="mt-1 inline-block px-2 py-0.5 rounded cursor-default text-white font-medium" style={{fontSize:"7px",background:green}}>Read More</div>
        </div>
        <Wrap id="aboutImg" activeId={inspecting} onInspect={setInspecting}
          label="About Section Image" principle="Perceivable"
          code={`<img src="P1010050-cropped-scaled.jpg"\n  alt="OLYMPUS DIGITAL CAMERA"\n  title="OLYMPUS DIGITAL CAMERA">\n\n<!-- SAME problem: camera metadata as alt.\n     This photo shows the library building\n     exterior but the alt text says nothing\n     about that. -->`}
          violation={"Same camera-generated alt text \"OLYMPUS DIGITAL CAMERA\" on a second image. Two different photos, identical meaningless alt text. A screen reader user can't distinguish them at all."}>
          <div className="rounded overflow-hidden border border-gray-200">
            <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <rect width="200" height="100" fill="#e8dcc8"/>
              <rect x="40" y="25" width="120" height="55" fill="#d4c5a0" stroke="#b8a882" strokeWidth="1" rx="2"/>
              <rect x="50" y="30" width="20" height="25" fill="#87CEEB" opacity="0.5" rx="1"/>
              <rect x="80" y="30" width="20" height="25" fill="#87CEEB" opacity="0.5" rx="1"/>
              <rect x="110" y="30" width="20" height="25" fill="#87CEEB" opacity="0.5" rx="1"/>
              <rect x="88" y="55" width="24" height="25" fill="#654321" rx="1"/>
              <circle cx="108" cy="67" r="1.5" fill="#ffd700"/>
              <rect x="60" y="18" width="80" height="8" fill={green} rx="1"/>
              <text x="100" y="24.5" textAnchor="middle" fill="white" fontSize="5" fontFamily="sans-serif" fontWeight="bold">MAPLEWOOD PUBLIC LIBRARY</text>
              {[45,65,130,150].map(x => <circle key={x} cx={x} cy="78" r="5" fill="#2d5a1e" opacity="0.4"/>)}
            </svg>
            {(interactive || hl("images")) && (
              <div className="bg-black/70 text-amber-300 text-center py-0.5 font-mono" style={{fontSize:"6.5px"}}>
                alt="OLYMPUS DIGITAL CAMERA"
              </div>
            )}
          </div>
        </Wrap>
      </div>

      {/* ─── CALENDAR + MEETING ROOM ─── */}
      <div className="px-3 py-2 grid grid-cols-2 gap-2 border-b border-gray-100">
        <div className="border border-gray-200 rounded p-2 bg-gray-50">
          <div className="font-bold text-gray-800 mb-0.5" style={{fontSize:"9px"}}>📅 Calendar</div>
          <p className="text-gray-500" style={{fontSize:"7px"}}>Check for new and upcoming events.</p>
          <div className="mt-1 inline-block px-2 py-0.5 rounded cursor-default text-white font-medium" style={{fontSize:"7px",background:green}}>View Now</div>
        </div>
        <div className="border border-gray-200 rounded p-2 bg-gray-50">
          <div className="font-bold text-gray-800 mb-0.5" style={{fontSize:"9px"}}>🚪 Meeting Room</div>
          <p className="text-gray-500" style={{fontSize:"7px"}}>Available to public. Max 47 persons.</p>
          <div className="mt-1 inline-block px-2 py-0.5 rounded cursor-default text-white font-medium" style={{fontSize:"7px",background:green}}>Reserve Now</div>
        </div>
      </div>

      {/* ─── LIBRARY CARDS ─── */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="uppercase font-bold tracking-wider mb-0.5" style={{fontSize:"6.5px",color:green}}>Library Cards</div>
        <div className="font-bold text-gray-800 mb-0.5" style={{fontSize:"9px"}}>How To Get A Card</div>
        <p className="text-gray-500" style={{fontSize:"7px"}}>Any Maplewood resident gets a free card. St. Louis City/County residents can also get one through our cooperative program.</p>
      </div>

      {/* ─── SERVICES ─── */}
      <div className="px-3 py-2 text-center border-b border-gray-100" style={{background:"#f5f5f0"}}>
        <div className="font-bold text-gray-800 mb-0.5" style={{fontSize:"10px"}}>Services For All Ages</div>
        <p className="text-gray-500" style={{fontSize:"7px"}}>Books, magazines, DVDs, audiobooks, and downloadable content.</p>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <div className="px-2 py-0.5 rounded cursor-default text-white font-medium" style={{fontSize:"7px",background:green}}>Search Catalog</div>
          <div className="px-2 py-0.5 rounded cursor-default text-white font-medium" style={{fontSize:"7px",background:green}}>Visit Us Today</div>
        </div>
      </div>

      {/* ─── NEWSLETTER FORM (Understandable violations) ─── */}
      <Wrap id="formSection" activeId={inspecting} onInspect={setInspecting} className="mx-3 my-2"
        label="Newsletter Form" principle="Understandable"
        code={`<form action="/subscribe" method="POST">\n  <!-- No <label> elements! -->\n  <input placeholder="Your name">\n  <input placeholder="Email address">\n  <button type="submit">Subscribe</button>\n</form>\n\n<!-- On invalid submit: -->\n<div class="error">Error 422</div>\n<!-- No field-level messages -->\n<!-- On success: form silently resets -->\n<!-- No confirmation shown -->`}
        violation='Form uses placeholder text as the only labels, and they vanish when typing. Submit errors show "Error 422" (a raw HTTP code). Successful submission silently resets the form with no confirmation. Violates WCAG 3.3.1 (Error Identification) and 3.3.2 (Labels or Instructions).'>
        <div className="rounded p-2.5 border border-gray-200 bg-gray-50">
          <div className="font-bold text-gray-800 mb-0.5" style={{fontSize:"9px"}}>📬 Stay Connected</div>
          <div className="text-gray-500 mb-1.5" style={{fontSize:"7px"}}>Get updates on new books, events, and programs.</div>
          <div className="flex gap-1.5">
            <input className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-gray-400 shadow-inner" placeholder="Your name" readOnly tabIndex={-1} style={{fontSize:"8px"}} />
            <input className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-gray-400 shadow-inner" placeholder="Email address" readOnly tabIndex={-1} style={{fontSize:"8px"}} />
            <div className="text-white rounded px-2 py-1 cursor-default font-medium shadow-sm flex-shrink-0" style={{fontSize:"8px",background:green}}>Subscribe</div>
          </div>
        </div>
      </Wrap>

      {/* ─── FAQ ACCORDION (Robust violations) ─── */}
      <Wrap id="faqAccordion" activeId={inspecting} onInspect={setInspecting} className="mx-3 mb-2"
        label="FAQ Accordion" principle="Robust"
        code={`<div class="faq-item"\n  onclick="toggleFAQ(1)">\n  <span>How do I get a library card?</span>\n  <span class="arrow">▾</span>\n</div>\n\n<!-- Problems: -->\n<!-- • Uses <div> not <button> -->\n<!-- • No role="button" -->\n<!-- • No aria-expanded="true|false" -->\n<!-- • No onkeydown handler -->\n<!-- • Not in tab order (no tabindex) -->\n<!-- Screen reader: reads as static text -->`}
        violation={"FAQ items are <div onclick>, not <button>, no ARIA roles, no keyboard handlers, not in tab order. Screen readers announce them as plain text, not interactive controls. Users don't know these are expandable. Violates WCAG 4.1.2 (Name, Role, Value)."}>
        <div>
          <div className="font-bold text-gray-800 mb-1" style={{fontSize:"9px"}}>Frequently Asked Questions</div>
          <div className="border border-gray-200 rounded overflow-hidden divide-y divide-gray-100">
            {["How do I get a library card?","What are the late return fees?","Can I reserve a study room?"].map(q => (
              <div key={q} className="flex items-center justify-between px-2 py-1.5 bg-white cursor-default">
                <span className="text-gray-700" style={{fontSize:"8px"}}>{q}</span>
                <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-gray-400 flex-shrink-0"><path d="M3 5L6 8L9 5" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
              </div>
            ))}
          </div>
        </div>
      </Wrap>

      {/* ─── PARTNER LOGOS ─── */}
      <div className="px-3 py-1.5 flex items-center justify-center gap-3 border-t border-gray-100" style={{background:"#f8f8f8"}}>
        {["IMLS","MO State Library","Safe Place","MLC"].map(n => (
          <div key={n} className="border border-gray-200 rounded px-1.5 py-0.5 text-gray-400 bg-white" style={{fontSize:"6px"}}>{n}</div>
        ))}
      </div>

      {/* ─── FOOTER ─── */}
      <div className="px-3 py-2" style={{background:green}}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-white font-bold" style={{fontSize:"8px"}}>Maplewood Public Library</div>
            <div className="text-green-200" style={{fontSize:"7px"}}>7550 Lohmeyer Ave.</div>
            <div className="text-green-200" style={{fontSize:"7px"}}>Maplewood, MO 63143</div>
          </div>
          <div>
            <div className="text-white font-bold" style={{fontSize:"7.5px"}}>Contact</div>
            <div className="text-green-200" style={{fontSize:"7px"}}>314-781-7323</div>
            <div className="text-green-200" style={{fontSize:"7px"}}>info@maplewoodpubliclibrary.org</div>
          </div>
          <div>
            <div className="text-white font-bold" style={{fontSize:"7.5px"}}>Hours</div>
            <div className="text-green-200" style={{fontSize:"6.5px"}}>Mon–Thu: 9 AM–8 PM</div>
            <div className="text-green-200" style={{fontSize:"6.5px"}}>Fri–Sat: 9 AM–5 PM</div>
            <div className="text-green-200" style={{fontSize:"6.5px"}}>Sun: Closed</div>
          </div>
        </div>
        <div className="text-center text-green-300 mt-1.5 pt-1 border-t border-green-700" style={{fontSize:"6px"}}>
          © 2026 Maplewood Public Library | All rights reserved.
        </div>
      </div>
    </div>
  );
}


// ─── SCREEN COMPONENTS ──────────────────────────────────────────────────────

function TestScreen({ title, subtitle, questions, onComplete, onBack }: { title: string; subtitle?: string; questions: Question[]; onComplete: (score: number) => void; onBack?: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const handleSelect = (qId: string, option: string) => { if (!submitted) setAnswers((prev) => ({ ...prev, [qId]: option })); };
  const handleSubmit = () => { if (Object.keys(answers).length >= questions.length) setSubmitted(true); };
  const score = questions.reduce((s: number, q: Question) => s + (answers[q.id] === q.correct ? 1 : 0), 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">{title}</h2>
      <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
      <div className="space-y-6">
  {questions.map((q: Question, qi: number) => (
          <Card key={q.id}>
            <p className="font-medium text-gray-800 mb-3">Q{qi + 1}. {q.text}</p>
            <div className="space-y-2" role="radiogroup" aria-label={`Question ${qi + 1}`}>
              {q.options.map((opt: string) => {
                const selected = answers[q.id] === opt;
                const isCorrect = q.correct === opt;
                let cls = "border-gray-200 bg-white";
                if (submitted && selected && isCorrect) cls = "border-green-400 bg-green-50";
                else if (submitted && selected && !isCorrect) cls = "border-red-400 bg-red-50";
                else if (submitted && isCorrect) cls = "border-green-300 bg-green-50/50";
                else if (selected) cls = "border-gray-600 bg-gray-50";
                return (
                  <button key={opt} role="radio" aria-checked={selected} onClick={() => handleSelect(q.id, opt)} disabled={submitted}
                    className={`w-full text-left px-4 py-2.5 rounded border ${cls} text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 disabled:cursor-default`}>
                    {opt}
                    {submitted && isCorrect && <span className="float-right text-green-600">✓</span>}
                    {submitted && selected && !isCorrect && <span className="float-right text-red-500">✗</span>}
                  </button>
                );
              })}
            </div>
            {submitted && <FeedbackBanner correct={answers[q.id] === q.correct} message={q.explanation || ""} />}
          </Card>
        ))}
      </div>
      {!submitted ? (
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
          {onBack ? <button onClick={onBack} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">Back</button> : <div />}
          <button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}
            className="px-5 py-2 text-sm font-medium text-white bg-teal-700 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Submit Answers</button>
        </div>
      ) : (
        <div className="mt-6">
          <Card className="text-center">
            <p className="text-lg font-bold text-gray-800">{score} / {questions.length} correct</p>
            <p className="text-sm text-gray-500 mt-1">{score === questions.length ? "Excellent work! You nailed every question." : score >= 2 ? "Good effort! Check the feedback above to see what you missed." : "No worries, that's what this lesson is for. Let's learn together."}</p>
          </Card>
          <div className="flex justify-end mt-4">
            <button onClick={() => onComplete(score)} className="px-5 py-2 text-sm font-medium text-white bg-teal-700 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">Continue →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function IntroScreen({ onNext }: { onNext?: () => void }) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">HCI520 · Learner-centered Design</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">Accessibility in HCI</h1>
        <p className="text-gray-600 leading-relaxed max-w-xl">
          Hey there! In this lesson, you'll learn how to evaluate webpages for accessibility problems using the WCAG 2.1 POUR principles. We'll use a mock version of a public library website as our test case, based on issues found on actual sites.
        </p>
      </div>
      <Card className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">What you'll learn</h3>
        <div className="space-y-3">
          {[
            { n: "1", t: "Classify a webpage accessibility issue under the correct POUR principle", s: "Bloom: 2.2 Classifying · Bb: Conceptual Knowledge" },
            { n: "2", t: "Execute a POUR-based evaluation checklist on a webpage and flag specific violations correctly", s: "Bloom: 3.2 Executing · Ca: Procedural Knowledge" },
            { n: "3", t: "Rank a set of confirmed WCAG violations by priority and justify the top choice using severity factors", s: "Bloom: 5.2 Critiquing · Bc: Conceptual Knowledge" },
          ].map((lo) => (
            <div key={lo.n} className="flex gap-3 items-start">
              <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">{lo.n}</span>
              <div><p className="text-sm text-gray-700 font-medium">{lo.t}</p><p className="text-xs text-gray-400">{lo.s}</p></div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="mb-6 bg-gray-50">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">How this lesson works</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          We'll start with a quick pre-test (just to see where you're starting, no pressure!), then walk through each POUR principle with examples from hospital sites, airline booking, government forms, and more. After that, you'll evaluate a mock <strong>Maplewood Public Library</strong> website for real accessibility issues, classify new scenarios, and rank violations by priority. A post-test at the end measures what you've learned.
        </p>
      </Card>
      <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
        <span>⏱ ~25 minutes</span><span>8 sections</span><span>Pre-test & Post-test</span>
      </div>
      <p className="text-xs text-gray-400 mb-6">Created by Vedant Atram · Instructor: Prof. Peter Hastings</p>
      <NavButtons onNext={onNext} nextLabel="Start Pre-Test →" />
    </div>
  );
}

function POURScreen({ onBack, onNext }: { onBack?: () => void; onNext?: () => void }) {
  const principles = Object.keys(POUR_DATA) as Pour[];
  const [active, setActive] = useState<Pour>(principles[0]);
  const data = POUR_DATA[active];
  const highlightMap = { Perceivable: ["hero", "contrast", "images", "video"], Operable: ["nav"], Understandable: ["form"], Robust: ["nav", "faq"] };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">The POUR Principles</h2>
      <p className="text-sm text-gray-500 mb-5">WCAG 2.1 organizes accessibility into four principles. Explore each tab, and the examples come from real-world websites you'd actually encounter.</p>
      <div className="flex gap-1 mb-5 border-b border-gray-200" role="tablist" aria-label="POUR Principles">
        {principles.map((p) => (
          <button key={p} role="tab" aria-selected={active === p} id={`tab-${p}`} aria-controls={`panel-${p}`} onClick={() => setActive(p)}
            className={`px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 rounded-t ${active === p ? "bg-white border border-b-white border-gray-200 text-gray-900 -mb-px" : "text-gray-500 hover:text-gray-700"}`}>
            <span className="font-bold mr-1">{POUR_DATA[p].letter}</span><span className="hidden sm:inline">{p}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`}>
        <Card className="mb-4"><p className="text-sm text-gray-700 leading-relaxed">{data.definition}</p></Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card>
            <h4 className="text-sm font-semibold text-green-700 mb-2">{data.passExample.title}</h4>
            <CodeBlock code={data.passExample.code} />
            <p className="text-xs text-gray-500 mt-1">{data.passExample.desc}</p>
          </Card>
          <Card>
            <h4 className="text-sm font-semibold text-red-700 mb-2">{data.failExample.title}</h4>
            <CodeBlock code={data.failExample.code} />
            <p className="text-xs text-gray-500 mt-1">{data.failExample.desc}</p>
          </Card>
        </div>
        <Card className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">{data.annotation.label}</h4>
          <p className="text-xs text-gray-400 mb-3">Click any color-highlighted element on the page to inspect its HTML source. Borders are color-coded by POUR principle.</p>
          <MockWebpage highlights={highlightMap[active]} mode="inspect" />
          <div className="bg-slate-50 rounded-lg p-4 border border-gray-100 mt-4">
            <SectionLabel>What's wrong here</SectionLabel>
            <p className="text-sm text-gray-700 leading-relaxed mt-1">{data.annotation.desc}</p>
          </div>
        </Card>
        <Card>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Real-world {active} violations you'll see in the wild</h4>
          <div className="space-y-1.5">
            {data.scenarios.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600"><span className="text-teal-400 mt-0.5">•</span><span>{s}</span></div>
            ))}
          </div>
        </Card>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function WorkedExampleScreen({ onBack, onNext }: { onBack?: () => void; onNext?: () => void }) {
  const [stepIdx, setStepIdx] = useState<number>(0);
  const step = WORKED_EXAMPLE_STEPS[stepIdx];
  const hlPerStep = [["hero", "contrast", "images", "video"], ["nav"], ["form"], ["nav", "faq"]];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Watch Before You Try</h2>
      <p className="text-sm text-gray-500 mb-5">Let's walk through evaluating the Maplewood Library homepage together, one POUR principle at a time. I'll show you exactly what to look for, and in the next section you'll do it yourself.</p>
      <div className="flex gap-2 mb-5" role="group" aria-label="Evaluation steps">
        {WORKED_EXAMPLE_STEPS.map((s, i) => (
          <button key={i} onClick={() => setStepIdx(i)} aria-current={i === stepIdx ? "step" : undefined}
            className={`flex-1 text-xs py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${i === stepIdx ? "bg-teal-700 text-white" : i < stepIdx ? "bg-gray-200 text-gray-600" : "bg-gray-100 text-gray-400"}`}>
            {s.principle}
          </button>
        ))}
      </div>
      {/* ── Instruction callout ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-xl leading-none mt-0.5">🔍</span>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">This is an interactive preview, not a real website</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              The webpage below is a mock-up for you to inspect. <strong>Click on any color-highlighted element</strong> to see its actual HTML source code and the accessibility violation. Each border color represents a different POUR principle. Read the evaluation notes below the preview as you explore each step.
            </p>
          </div>
        </div>
      </div>

      {/* ── Mock Webpage: full width ── */}
      <div className="mb-5">
        <SectionLabel>Maplewood Library homepage</SectionLabel>
        <MockWebpage highlights={hlPerStep[stepIdx]} mode="inspect" />
      </div>

      {/* ── Evaluation Notes ── */}
      <Card className="mb-4">
        <h3 className="font-semibold text-gray-800 mb-3">{step.title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div><SectionLabel>What to inspect</SectionLabel><p className="text-sm text-gray-700">{step.inspect}</p></div>
            <div>
              <SectionLabel>Questions to ask</SectionLabel>
              <div className="space-y-1">{step.questions.map((q, i) => (<p key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-teal-400">→</span>{q}</p>))}</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><SectionLabel>Finding</SectionLabel><p className="text-sm text-amber-800">{step.finding}</p></div>
            <div><SectionLabel>Why it matters</SectionLabel><p className="text-sm text-gray-700">{step.whyItMatters}</p></div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3"><p className="text-sm text-blue-800">💡 <strong>Pro tip:</strong> {step.tip}</p></div>
          </div>
        </div>
      </Card>
      <div className="flex justify-between items-center mt-6">
        <button onClick={() => stepIdx > 0 ? setStepIdx(stepIdx - 1) : (onBack && onBack())} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
          {stepIdx > 0 ? "← Previous Step" : "Back"}
        </button>
        <button onClick={() => stepIdx < WORKED_EXAMPLE_STEPS.length - 1 ? setStepIdx(stepIdx + 1) : (onNext && onNext())}
          className="px-5 py-2 text-sm font-medium text-white bg-teal-700 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">
          {stepIdx < WORKED_EXAMPLE_STEPS.length - 1 ? "Next Step →" : "Now you try →"}
        </button>
      </div>
    </div>
  );
}

function ChecklistScreen({ onBack, onNext, onChecklistScore }: { onBack?: () => void; onNext?: () => void; onChecklistScore: (correct: number, total: number) => void }) {
  const VIOLATIONS = AUDIT_FINDINGS.filter(f => f.isViolation);
  const TOTAL_VIOLATIONS = VIOLATIONS.length;

  // Per-finding state: { flagged: bool, pour: string|null, severity: string|null }
  const [findings, setFindings] = useState<Record<string, { flagged: boolean; pour: Pour | null; severity: string | null }>>(() => {
    const init: Record<string, { flagged: boolean; pour: Pour | null; severity: string | null }> = {};
    AUDIT_FINDINGS.forEach(f => { init[f.id] = { flagged: false, pour: null, severity: null }; });
    return init;
  });
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const update = (id: string, field: "pour" | "severity", value: Pour | string | null) => {
    if (submitted) return;
    setFindings(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const toggleFlag = (id: string) => {
    if (submitted) return;
    setFindings(prev => ({
      ...prev,
      [id]: { ...prev[id], flagged: !prev[id].flagged, ...(!prev[id].flagged ? {} : { pour: null, severity: null }) }
    }));
  };

  // Scoring
  const computeScore = () => {
    let identifyCorrect = 0, pourCorrect = 0, sevCorrect = 0;
    AUDIT_FINDINGS.forEach(f => {
      const entry = findings[f.id];
      // Identification: flagged violation = correct, not flagging pass = correct
      if (f.isViolation && entry.flagged) identifyCorrect++;
      if (!f.isViolation && !entry.flagged) identifyCorrect++;
      // POUR classification (only scored for correctly-flagged violations)
      if (f.isViolation && entry.flagged && entry.pour === f.correctPour) pourCorrect++;
      // Severity (only scored for correctly-flagged violations)
      if (f.isViolation && entry.flagged && entry.severity === f.correctSeverity) sevCorrect++;
    });
    return { identifyCorrect, pourCorrect, sevCorrect, totalItems: AUDIT_FINDINGS.length, totalViolations: TOTAL_VIOLATIONS };
  };

  const canSubmit = AUDIT_FINDINGS.every(f => {
    const entry = findings[f.id];
    if (entry.flagged) return entry.pour && entry.severity;
    return true; // unflagged items are valid (they might be passes)
  });

  const handleSubmit = () => {
    setSubmitted(true);
    const score = computeScore();
    // Pass combined accuracy to results: identification + POUR out of total possible
    const correct = score.identifyCorrect + score.pourCorrect;
    const total = score.totalItems + score.totalViolations; // 7 identification + 5 POUR = 12
    onChecklistScore(correct, total);
    // Auto-scroll to feedback after a beat
    setTimeout(() => { if (reportRef.current) reportRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); }, 300);
  };

  const score = submitted ? computeScore() : null;

  // Status badge for each finding in the report
  const getStatus = (f: typeof AUDIT_FINDINGS[number]) => {
    const entry = findings[f.id];
    if (f.isViolation && entry.flagged) return "found";
    if (f.isViolation && !entry.flagged) return "missed";
    if (!f.isViolation && !entry.flagged) return "correct-pass";
    if (!f.isViolation && entry.flagged) return "false-positive";
    return "unknown";
  };

  const pourColors = {
    Perceivable: { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-300" },
    Operable: { bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-300" },
    Understandable: { bg: "bg-purple-100", text: "text-purple-700", ring: "ring-purple-300" },
    Robust: { bg: "bg-red-100", text: "text-red-700", ring: "ring-red-300" },
  };

  const sevColors = { High: "bg-red-100 text-red-700", Medium: "bg-amber-100 text-amber-700", Low: "bg-gray-200 text-gray-600" };

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 leading-tight">Your Turn: Accessibility Audit</h2>
          <p className="text-xs text-gray-400 font-mono">maplewoodpubliclibrary.org · WCAG 2.1 Level AA</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-1 mt-2">
        You're the accessibility auditor now. Examine the Maplewood Library homepage below, then evaluate each checkpoint in the audit worksheet.
      </p>
      <p className="text-xs text-gray-400 mb-4">There are {AUDIT_FINDINGS.length} checkpoints to evaluate. Not all of them are violations; some things the site does correctly. Part of a real audit is recognizing what works, too.</p>

      {/* ── Prominent task guide ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
        <div className="flex items-start gap-3">
          <span className="text-xl leading-none mt-0.5">📋</span>
          <div>
            <p className="text-sm font-semibold text-amber-900 mb-2">How this activity works. 3 steps</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                <p className="text-xs text-amber-800"><strong>Inspect the mock webpage</strong>: Click on any <strong>color-highlighted element</strong> in the preview below to view its HTML source code and spot issues. Each border color matches a POUR principle. This is an interactive mock-up, not a real website.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                <p className="text-xs text-amber-800"><strong>Evaluate each checkpoint</strong>. Scroll down to the audit worksheet. For each item, decide: is this a violation or does the site pass? If it's a violation, classify the POUR principle and severity.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                <p className="text-xs text-amber-800"><strong>Submit for feedback</strong>. After marking all items, click "Submit Audit" to see how you did with detailed explanations for each finding.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOCK WEBPAGE ── */}
      <Card className="mb-5 !p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">🖥️</span>
            <SectionLabel>Target Page: Click highlighted areas to inspect</SectionLabel>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-600 font-medium">Interactive</span>
          </div>
        </div>
        <MockWebpage mode="inspect" />
      </Card>

      {/* ── AUDIT WORKSHEET ── */}
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel>Audit Checkpoints: {AUDIT_FINDINGS.length} items</SectionLabel>
        {!submitted && (
          <span className="text-xs text-gray-400">{AUDIT_FINDINGS.filter(f => findings[f.id].flagged).length} flagged as violations</span>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {AUDIT_FINDINGS.map((f, idx) => {
          const entry = findings[f.id];
          const status = submitted ? getStatus(f) : null;
          const isExpanded = expandedId === f.id;

          // Card border color
          let borderClass = "border-gray-200";
          if (submitted) {
            if (status === "found" || status === "correct-pass") borderClass = "border-green-300";
            else borderClass = "border-red-300";
          } else if (entry.flagged) {
            borderClass = "border-amber-300";
          }

          let bgClass = "bg-white";
          if (submitted) {
            if (status === "found" || status === "correct-pass") bgClass = "bg-green-50/50";
            else bgClass = "bg-red-50/50";
          }

          return (
            <div key={f.id} className={`border rounded-lg overflow-hidden transition-colors ${borderClass} ${bgClass}`}>
              {/* ── Finding Header Row ── */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleFlag(f.id)}
                    disabled={submitted}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
                      entry.flagged
                        ? submitted
                          ? (f.isViolation ? "bg-green-500 border-green-500" : "bg-red-500 border-red-500")
                          : "bg-amber-500 border-amber-500"
                        : submitted
                          ? (!f.isViolation ? "border-green-400" : "border-red-400")
                          : "border-gray-300 hover:border-gray-400"
                    } disabled:cursor-default`}
                    aria-label={`Flag "${f.element}" as accessibility violation`}
                    aria-checked={entry.flagged}
                    role="checkbox"
                  >
                    {entry.flagged && (
                      <svg viewBox="0 0 12 12" className="w-3 h-3 text-white"><path d="M2.5 6L5 8.5L9.5 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">#{idx + 1}</span>
                      <h3 className="text-sm font-semibold text-gray-800">{f.element}</h3>
                      {submitted && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          status === "found" ? "bg-green-200 text-green-800" :
                          status === "correct-pass" ? "bg-green-200 text-green-800" :
                          status === "missed" ? "bg-red-200 text-red-800" :
                          "bg-red-200 text-red-800"
                        }`}>
                          {status === "found" ? "✓ Correctly Identified" :
                           status === "correct-pass" ? "✓ Correctly Marked as Pass" :
                           status === "missed" ? "✗ Missed. This Was a Violation" :
                           "✗ False Positive. This Actually Passes"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{f.observation}</p>

                    {/* Hint toggle */}
                    {!submitted && (
                      <button onClick={() => setExpandedId(isExpanded ? null : f.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1.5 focus:outline-none focus:underline">
                        {isExpanded ? "Hide hint ▴" : "Need a hint? ▾"}
                      </button>
                    )}
                    {isExpanded && !submitted && (
                      <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2.5">
                        <p className="text-xs text-blue-800">💡 {f.hint}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── POUR + Severity selectors (visible when flagged) ── */}
                {entry.flagged && (
                  <div className="mt-3 ml-8 flex flex-wrap items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    {/* POUR Category */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">POUR Principle</label>
                      <div className="flex gap-1">
                        {(["Perceivable", "Operable", "Understandable", "Robust"] as Pour[]).map((p: Pour) => {
                          const pc = pourColors[p];
                          const sel = entry.pour === p;
                          const isCorrect = submitted && f.isViolation && p === f.correctPour;
                          const isWrong = submitted && sel && f.isViolation && p !== f.correctPour;
                          return (
                            <button key={p} onClick={() => update(f.id, "pour", p)} disabled={submitted}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-default ${
                                submitted
                                  ? isCorrect ? "bg-green-200 text-green-800 ring-2 ring-green-400" : isWrong ? "bg-red-200 text-red-800 ring-2 ring-red-400 line-through" : sel ? `${pc.bg} ${pc.text}` : "bg-gray-100 text-gray-400"
                                  : sel ? `${pc.bg} ${pc.text} ring-2 ${pc.ring}` : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                              aria-pressed={sel}>
                              {p.charAt(0)}
                            </button>
                          );
                        })}
                      </div>
                      {submitted && f.isViolation && entry.pour !== f.correctPour && (
                        <p className="text-xs text-red-600 mt-1">Correct: {f.correctPour}</p>
                      )}
                    </div>

                    {/* Severity */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Severity</label>
                      <div className="flex gap-1">
                        {(["Low", "Medium", "High"] as ("Low"|"Medium"|"High")[]).map((s: "Low"|"Medium"|"High") => {
                          const sel = entry.severity === s;
                          const isCorrect = submitted && f.isViolation && s === f.correctSeverity;
                          const isWrong = submitted && sel && f.isViolation && s !== f.correctSeverity;
                          return (
                            <button key={s} onClick={() => update(f.id, "severity", s)} disabled={submitted}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-default ${
                                submitted
                                  ? isCorrect ? "bg-green-200 text-green-800 ring-2 ring-green-400" : isWrong ? "bg-red-200 text-red-800 ring-2 ring-red-400 line-through" : sel ? sevColors[s] : "bg-gray-100 text-gray-400"
                                  : sel ? `${sevColors[s]} ring-2 ring-gray-300` : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                              aria-pressed={sel}>
                              {s}
                            </button>
                          );
                        })}
                      </div>
                      {submitted && f.isViolation && entry.severity !== f.correctSeverity && (
                        <p className="text-xs text-red-600 mt-1">Correct: {f.correctSeverity}</p>
                      )}
                    </div>

                    {/* WCAG reference */}
                    <div className="text-xs text-gray-400 font-mono ml-auto">WCAG {f.wcag.split(" ")[0]}</div>
                  </div>
                )}
              </div>

              {/* ── Feedback panel (after submit) ── */}
              {submitted && (
                <div className={`px-4 pb-4 pt-0`}>
                  <div className={`rounded-lg p-3 border text-sm leading-relaxed ${
                    (status === "found" || status === "correct-pass")
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}>
                    <p className="mb-1.5"><span className="font-semibold">WCAG {f.wcag}</span></p>
                    <p className="text-xs leading-relaxed">{f.explanation}</p>
                    <p className="text-xs mt-1.5 opacity-80"><strong>Impact:</strong> {f.impact}</p>
                    {f.fixSuggestion && <p className="text-xs mt-1 opacity-80"><strong>Fix:</strong> {f.fixSuggestion}</p>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── SUBMIT BUTTON ── */}
      {!submitted ? (
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button onClick={onBack} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">Back</button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className="px-5 py-2.5 text-sm font-medium text-white bg-teal-700 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>
            Submit Audit
          </button>
        </div>
      ) : (
        <>
          {/* ── SCORE SUMMARY ── */}
          <div ref={reportRef} className="scroll-mt-4">
            <Card className="mb-5" role="status" aria-live="polite">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">Issues Identified</p>
              <p className="text-2xl font-bold text-gray-800">{score!.identifyCorrect}<span className="text-sm text-gray-400 font-normal">/{score!.totalItems}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">violations + passes</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">POUR Classification</p>
                  <p className="text-2xl font-bold text-gray-800">{score!.pourCorrect}<span className="text-sm text-gray-400 font-normal">/{score!.totalViolations}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">correct categories</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">Severity Rating</p>
                  <p className="text-2xl font-bold text-gray-800">{score!.sevCorrect}<span className="text-sm text-gray-400 font-normal">/{score!.totalViolations}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">correct ratings</p>
                </div>
              </div>
            </Card>
          </div>

          {/* ── FINDINGS REPORT TOGGLE ── */}
          <button onClick={() => setShowReport(!showReport)}
            className="w-full text-left mb-4 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-600"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/></svg>
              <span className="font-semibold text-gray-800 text-sm">Accessibility Findings Report</span>
              <span className="text-xs text-gray-400 font-mono">{TOTAL_VIOLATIONS} violations · {AUDIT_FINDINGS.length - TOTAL_VIOLATIONS} passes</span>
            </div>
            <span className="text-gray-400 text-sm">{showReport ? "▴" : "▾"}</span>
          </button>

          {showReport && (
            <Card className="mb-5 !p-0 overflow-hidden">
              {/* Report header */}
              <div className="bg-gray-800 text-white px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">WCAG 2.1 Level AA Accessibility Audit</h3>
                    <p className="text-gray-300 text-xs mt-0.5">maplewoodpubliclibrary.org · Homepage</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Auditor: Learner</p>
                    <p className="text-xs text-gray-400">Course: HCI520. Accessibility in HCI</p>
                  </div>
                </div>
                {/* Summary bar */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="text-xs text-gray-300">{VIOLATIONS.filter(f => findings[f.id].flagged).length}/{TOTAL_VIOLATIONS} violations found</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <span className="text-xs text-gray-300">{AUDIT_FINDINGS.filter(f => !f.isViolation && !findings[f.id].flagged).length}/{AUDIT_FINDINGS.length - TOTAL_VIOLATIONS} passes confirmed</span>
                  </div>
                </div>
              </div>

              {/* Report body: one section per finding */}
              <div className="divide-y divide-gray-100">
                {AUDIT_FINDINGS.map((f, idx) => {
                  const entry = findings[f.id];
                  const status = getStatus(f);
                  const learnerCorrectId = status === "found" || status === "correct-pass";
                  const learnerCorrectPour = f.isViolation && entry.flagged && entry.pour === f.correctPour;
                  const learnerCorrectSev = f.isViolation && entry.flagged && entry.severity === f.correctSeverity;

                  return (
                    <div key={f.id} className="px-5 py-4">
                      {/* Row 1: finding header */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">F-{String(idx + 1).padStart(2, "0")}</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${f.isViolation ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {f.isViolation ? "VIOLATION" : "PASS"}
                        </span>
                        <h4 className="text-sm font-semibold text-gray-800">{f.element}</h4>
                        {/* Learner accuracy badges */}
                        <span className={`text-xs px-1.5 py-0.5 rounded ml-auto ${learnerCorrectId ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {learnerCorrectId ? "✓ ID'd" : "✗ ID"}
                        </span>
                        {f.isViolation && (
                          <>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${learnerCorrectPour ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {learnerCorrectPour ? "✓ POUR" : "✗ POUR"}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${learnerCorrectSev ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {learnerCorrectSev ? "✓ Severity" : "✗ Severity"}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Row 2: metadata */}
                      <div className="flex items-center gap-3 mb-2 text-xs">
                        <span className={`px-2 py-0.5 rounded font-medium ${pourColors[f.correctPour]?.bg} ${pourColors[f.correctPour]?.text}`}>{f.correctPour}</span>
                        {f.isViolation && f.correctSeverity && (
                          <span className={`px-2 py-0.5 rounded font-medium ${sevColors[f.correctSeverity]}`}>{f.correctSeverity} Severity</span>
                        )}
                        <span className="text-gray-400 font-mono">WCAG {f.wcag}</span>
                      </div>

                      {/* Row 3: explanation */}
                      <p className="text-xs text-gray-600 leading-relaxed">{f.explanation}</p>
                      <p className="text-xs text-gray-500 mt-1"><strong>Impact:</strong> {f.impact}</p>
                      {f.fixSuggestion && <p className="text-xs text-gray-500 mt-1"><strong>Recommended Fix:</strong> {f.fixSuggestion}</p>}

                      {/* Learner comparison (if they got something wrong) */}
                      {!learnerCorrectId && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                          {f.isViolation
                            ? "You didn't flag this as a violation. Try inspecting this element on the page because the issue becomes clearer when you see the underlying HTML."
                            : `You flagged this as a violation, but it's actually implemented correctly. ${f.explanation}`}
                        </div>
                      )}
                      {learnerCorrectId && f.isViolation && (!learnerCorrectPour || !learnerCorrectSev) && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                          You found the issue!
                          {!learnerCorrectPour && ` You classified it as ${entry.pour || "unset"}, but the correct principle is ${f.correctPour}.`}
                          {!learnerCorrectSev && ` You rated severity as ${entry.severity || "unset"}, but the correct severity is ${f.correctSeverity} because ${f.correctSeverity === "High" ? "it blocks core functionality for entire user groups" : f.correctSeverity === "Medium" ? "it degrades the experience significantly but does not fully block access" : "it creates minor friction without blocking core functionality"}.`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <NavButtons onBack={onBack} onNext={onNext} />
        </>
      )}
    </div>
  );
}

function PracticeQuizScreen({ question, screenTitle, screenSubtitle, onBack, onNext, onAnswer, answerId }: { question: Question & { hint?: string }; screenTitle: string; screenSubtitle?: string; onBack?: () => void; onNext?: () => void; onAnswer: (id: string, correct: boolean) => void; answerId: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const handleSubmit = () => { setSubmitted(true); onAnswer(answerId, selected === question.correct); };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">{screenTitle}</h2>
      <p className="text-sm text-gray-500 mb-5">{screenSubtitle}</p>
      <Card>
        <p className="font-medium text-gray-800 mb-2">{question.text}</p>
        <p className="text-sm text-gray-500 mb-3">Which POUR principle is violated?</p>
        {!submitted && !showHint && <button onClick={() => setShowHint(true)} className="text-xs text-blue-600 hover:text-blue-800 mb-3 focus:outline-none focus:underline">Need a hint?</button>}
        {showHint && !submitted && <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3"><p className="text-sm text-blue-800">💡 {question.hint}</p></div>}
        <div className="space-y-2" role="radiogroup" aria-label="Answer options">
          {question.options.map((opt: string) => {
            const isSel = selected === opt, isCorrect = question.correct === opt;
            let cls = "border-gray-200 bg-white";
            if (submitted && isSel && isCorrect) cls = "border-green-400 bg-green-50";
            else if (submitted && isSel && !isCorrect) cls = "border-red-400 bg-red-50";
            else if (submitted && isCorrect) cls = "border-green-300 bg-green-50/50";
            else if (isSel) cls = "border-gray-600 bg-gray-50";
            return (
              <button key={opt} role="radio" aria-checked={isSel} onClick={() => !submitted && setSelected(opt)} disabled={submitted}
                className={`w-full text-left px-4 py-2.5 rounded border ${cls} text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 disabled:cursor-default`}>
                {opt}
                {submitted && isCorrect && <span className="float-right text-green-600">✓</span>}
                {submitted && isSel && !isCorrect && <span className="float-right text-red-500">✗</span>}
              </button>
            );
          })}
        </div>
  {submitted && <FeedbackBanner correct={selected === question.correct} message={question.explanation || ""} />}
      </Card>
      {!submitted ? (
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
          <button onClick={onBack} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">Back</button>
          <button onClick={handleSubmit} disabled={!selected} className="px-5 py-2 text-sm font-medium text-white bg-teal-700 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Submit Answer</button>
        </div>
      ) : (
        <NavButtons onBack={onBack} onNext={onNext} />
      )}
    </div>
  );
}

function PrioritizationScreen({ onBack, onNext, onPriorityScore }: { onBack?: () => void; onNext?: () => void; onPriorityScore: (rankCorrect: boolean, justified: boolean) => void }) {
  const [ranking, setRanking] = useState<typeof PRIORITY_ITEMS>([...PRIORITY_ITEMS]);
  const [justification, setJustification] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const dragItem = useRef<number | null>(null), dragOverItem = useRef<number | null>(null);
  const handleDragStart = (idx: number) => { dragItem.current = idx; };
  const handleDragEnter = (idx: number) => { dragOverItem.current = idx; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const items = [...ranking]; const d = items[dragItem.current]; items.splice(dragItem.current, 1); items.splice(dragOverItem.current, 0, d);
    setRanking(items); dragItem.current = null; dragOverItem.current = null;
  };
  const moveItem = (idx: number, dir: number) => { const n = idx + dir; if (n < 0 || n >= ranking.length) return; const items = [...ranking]; [items[idx], items[n]] = [items[n], items[idx]]; setRanking(items); };
  const handleSubmit = () => { setSubmitted(true); const topId = ranking[0].id; onPriorityScore(topId === "alt" || topId === "contrast", justification.length > 10); };
  const isGoodTop = ranking[0].id === "alt" || ranking[0].id === "contrast";

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Prioritization Task</h2>
      <p className="text-sm text-gray-500 mb-2">Almost done! You've been given 4 confirmed WCAG violations found on a webpage. Rank them from highest to lowest priority: which should be fixed first?</p>
      <p className="text-xs text-gray-400 mb-5">Drag to reorder, or use the arrow buttons. Then explain why your #1 choice matters most.</p>
      <Card className="mb-4">
        <SectionLabel>Rank violations: #1 = fix first</SectionLabel>
        <p className="text-xs text-gray-400 mb-3">Think about: How many users are affected? How severe is the barrier? Can they work around it?</p>
        <div className="space-y-2" role="list" aria-label="Violations to rank">
          {ranking.map((item, idx) => (
            <div key={item.id} role="listitem" draggable onDragStart={() => handleDragStart(idx)} onDragEnter={() => handleDragEnter(idx)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}
              className={`flex items-center gap-3 p-3 rounded border cursor-grab active:cursor-grabbing transition-colors ${submitted ? (idx === 0 && isGoodTop ? "border-green-300 bg-green-50" : idx === 0 ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white") : "border-gray-200 bg-white hover:bg-gray-50"}`}>
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
              <span className="text-sm text-gray-700 flex-1">{item.text}</span>
              <div className="flex gap-1">
                <button onClick={() => moveItem(idx, -1)} disabled={idx === 0 || submitted} aria-label={`Move up`} className="w-7 h-7 rounded border border-gray-200 text-gray-400 hover:bg-gray-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-30">↑</button>
                <button onClick={() => moveItem(idx, 1)} disabled={idx === ranking.length - 1 || submitted} aria-label={`Move down`} className="w-7 h-7 rounded border border-gray-200 text-gray-400 hover:bg-gray-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-30">↓</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="mb-4">
        <label htmlFor="justification" className="text-sm font-medium text-gray-700 block mb-2">Why is your #1 choice the highest priority?</label>
        <textarea id="justification" value={justification} onChange={(e) => setJustification(e.target.value)} disabled={submitted}
          placeholder="Consider: How many users are affected? How severe is the barrier? Can they work around it?"
          className="w-full border border-gray-200 rounded p-3 text-sm text-gray-700 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 disabled:bg-gray-50" />
      </Card>
      {submitted && (
        <Card role="status" aria-live="polite">
          <h4 className="font-semibold text-gray-800 mb-3">{isGoodTop ? "Great prioritization!" : "Let's think about this differently..."}</h4>
          <p className="text-sm text-gray-600 mb-3">{isGoodTop ? "You correctly identified a high-severity violation as the top priority. Here's the full reasoning:" : "Missing alt text or the contrast failure should be #1 because they affect the most users with the highest severity. Here's why:"}</p>
          <div className="space-y-3">
            {[...PRIORITY_ITEMS].sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[(a.severity || "Low") as "High"|"Medium"|"Low"] - { High: 0, Medium: 1, Low: 2 }[(b.severity || "Low") as "High"|"Medium"|"Low"])) .map((item) => (
              <div key={item.id} className="bg-gray-50 rounded p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${item.severity === "High" ? "bg-red-100 text-red-700" : item.severity === "Medium" ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-600"}`}>{item.severity}</span>
                  <span className="text-sm font-medium text-gray-700">{item.text}</span>
                </div>
                <p className="text-xs text-gray-500">Impact: {item.impact} · Frequency: {item.frequency}</p>
                <p className="text-xs text-gray-600 mt-1">{item.explanation}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800"><strong>Remember these three factors:</strong> user impact (how many users are affected), severity (completely blocked vs. inconvenienced), and frequency (every page vs. rare edge case). This is how real accessibility teams prioritize remediation work.</p>
          </div>
        </Card>
      )}
      {!submitted ? (
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
          <button onClick={onBack} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">Back</button>
          <button onClick={handleSubmit} disabled={justification.length < 10} className="px-5 py-2 text-sm font-medium text-white bg-teal-700 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Submit Ranking</button>
        </div>
      ) : (
        <NavButtons onBack={onBack} onNext={onNext} nextLabel="Take Post-Test →" />
      )}
    </div>
  );
}

function ResultsScreen({ preScore, postScore, quizScores, checklistScore, priorityScore, onRestart, onJumpTo }: { preScore: number; postScore: number; quizScores: Record<string, boolean>; checklistScore: { correct: number; total: number } | null; priorityScore: { rankCorrect: boolean; justified: boolean } | null; onRestart: () => void; onJumpTo: (s: string) => void }) {
  const total = PRETEST_QUESTIONS.length, improvement = postScore - preScore;
  const lo1Score = [quizScores.quiz1, quizScores.quiz2].filter(Boolean).length, lo1Total = 2;
  const lo2Pct = checklistScore ? Math.round((checklistScore.correct / checklistScore.total) * 100) : 0;
  const lo3Met = priorityScore ? priorityScore.rankCorrect && priorityScore.justified : false;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Your Results</h2>
      <p className="text-sm text-gray-500 mb-6">Here's how you did across the entire lesson. Nice work making it through!</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="text-center"><p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">Pre-Test</p><p className="text-3xl font-bold text-gray-700">{preScore}/{total}</p></Card>
        <Card className="text-center"><p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">Post-Test</p><p className="text-3xl font-bold text-gray-800">{postScore}/{total}</p></Card>
        <Card className={`text-center ${improvement > 0 || (improvement === 0 && postScore === total) ? "border-green-200 bg-green-50" : ""}`}>
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-1">Improvement</p>
          <p className="text-3xl font-bold text-gray-800">{improvement > 0 ? `+${improvement}` : improvement === 0 && postScore === total ? "Perfect!" : `${improvement}`}</p>
        </Card>
      </div>
      <Card className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Learning Objective Performance</h3>
        <div className="space-y-4">
          {[
            { label: "LO1: Classify a webpage accessibility issue under POUR", val: `${lo1Score}/${lo1Total}`, pct: (lo1Score / lo1Total) * 100, met: lo1Score === lo1Total, jump: "pour" },
            { label: "LO2: Execute a POUR-based evaluation checklist", val: `${lo2Pct}%`, pct: lo2Pct, met: lo2Pct >= 75, jump: "checklist" },
            { label: "LO3: Rank WCAG violations by priority and justify", val: lo3Met ? "Met" : "Needs Review", pct: lo3Met ? 100 : 40, met: lo3Met, jump: "priority" },
          ].map((lo) => (
            <div key={lo.label}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-700">{lo.label}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${lo.met ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{lo.val}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${lo.met ? "bg-green-500" : "bg-amber-400"}`} style={{ width: `${lo.pct}%` }} /></div>
              {!lo.met && <button onClick={() => onJumpTo(lo.jump)} className="text-xs text-blue-600 hover:text-blue-800 mt-1 focus:outline-none focus:underline">→ Review this section</button>}
            </div>
          ))}
        </div>
      </Card>
      <Card className="mb-4">
        <h3 className="font-semibold text-gray-800 mb-2">What's next?</h3>
        <p className="text-sm text-gray-600">
          {lo1Score === lo1Total && lo2Pct >= 75 && lo3Met
            ? "Excellent work across all objectives! You're ready to evaluate real webpages using tools like WAVE, axe DevTools, or Google Lighthouse. Try running an audit on your own project or a site you use daily."
            : "Review the sections marked above, then try the lesson again. Each attempt strengthens your ability to spot and prioritize real accessibility issues."
          }
        </p>
      </Card>
      <div className="flex justify-center mt-8">
        <button onClick={onRestart} className="px-6 py-2.5 text-sm font-medium text-white bg-teal-700 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">Restart Entire Lesson</button>
      </div>
      <p className="text-center text-xs text-gray-400 mt-8">Accessibility in HCI · HCI520 Learner-centered Design · Vedant Atram · Prof. Peter Hastings</p>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────���─────────────────────────────────

const SCREENS = { INTRO: "intro", PRETEST: "pretest", POUR: "pour", WORKED: "worked", CHECKLIST: "checklist", QUIZ1: "quiz1", QUIZ2: "quiz2", PRIORITY: "priority", POSTTEST: "posttest", RESULTS: "results" };
const PROGRESS_MAP = { [SCREENS.INTRO]: 1, [SCREENS.PRETEST]: 1, [SCREENS.POUR]: 2, [SCREENS.WORKED]: 3, [SCREENS.CHECKLIST]: 4, [SCREENS.QUIZ1]: 5, [SCREENS.QUIZ2]: 6, [SCREENS.PRIORITY]: 7, [SCREENS.POSTTEST]: 8, [SCREENS.RESULTS]: 8 };

export default function App() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const [screen, setScreen] = useState(SCREENS.INTRO);
  const [preScore, setPreScore] = useState(0);
  const [postScore, setPostScore] = useState(0);
  const [quizScores, setQuizScores] = useState<Record<string, boolean>>({});
  const [checklistScore, setChecklistScore] = useState<{ correct: number; total: number } | null>(null);
  const [priorityScore, setPriorityScore] = useState<{ rankCorrect: boolean; justified: boolean } | null>(null);

  const goTo = useCallback((s: string) => {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => { const el = document.getElementById("main-content"); if (el) el.focus({ preventScroll: true }); }, 100);
  }, []);

  const restart = () => { setPreScore(0); setPostScore(0); setQuizScores({}); setChecklistScore(null); setPriorityScore(null); goTo(SCREENS.INTRO); };
  const currentProgress = PROGRESS_MAP[screen] || 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif" }}>
      <SkipLink />
      <header className="bg-white border-b-2 border-teal-600 px-4 py-3 flex items-center justify-between sticky top-0 z-10" role="banner">
        <div className="flex items-center gap-3">
          <span className="font-bold text-teal-800 text-sm tracking-tight">Accessibility in HCI</span>
          <span className="text-xs text-gray-400 hidden sm:inline">HCI520 · Vedant Atram</span>
        </div>
        <span className="text-xs text-gray-400 font-mono" aria-label={`Step ${currentProgress} of 8`}>{currentProgress}/8</span>
      </header>
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
          {screen !== SCREENS.INTRO && screen !== SCREENS.RESULTS && <ProgressBar current={currentProgress} total={8} />}
          {screen === SCREENS.INTRO && <IntroScreen onNext={() => goTo(SCREENS.PRETEST)} />}
          {screen === SCREENS.PRETEST && <TestScreen title="Pre-Test" subtitle="Let's see what you already know. Don't worry, this is just a baseline. No pressure at all!" questions={PRETEST_QUESTIONS} onComplete={(s) => { setPreScore(s); goTo(SCREENS.POUR); }} onBack={() => goTo(SCREENS.INTRO)} />}
          {screen === SCREENS.POUR && <POURScreen onBack={() => goTo(SCREENS.PRETEST)} onNext={() => goTo(SCREENS.WORKED)} />}
          {screen === SCREENS.WORKED && <WorkedExampleScreen onBack={() => goTo(SCREENS.POUR)} onNext={() => goTo(SCREENS.CHECKLIST)} />}
          {screen === SCREENS.CHECKLIST && <ChecklistScreen onBack={() => goTo(SCREENS.WORKED)} onNext={() => goTo(SCREENS.QUIZ1)} onChecklistScore={(c, t) => setChecklistScore({ correct: c, total: t })} />}
          {screen === SCREENS.QUIZ1 && <PracticeQuizScreen question={PRACTICE_Q1} screenTitle="Knowledge Check" screenSubtitle="Let's see if you can classify this real-world accessibility issue. This one's from an airline booking site, so take your time!" onBack={() => goTo(SCREENS.CHECKLIST)} onNext={() => goTo(SCREENS.QUIZ2)} onAnswer={(id, c) => setQuizScores((p) => ({ ...p, [id]: c }))} answerId="quiz1" />}
          {screen === SCREENS.QUIZ2 && <PracticeQuizScreen question={PRACTICE_Q2} screenTitle="Knowledge Check" screenSubtitle="One more! This scenario is from a healthcare patient portal. You're almost through!" onBack={() => goTo(SCREENS.QUIZ1)} onNext={() => goTo(SCREENS.PRIORITY)} onAnswer={(id, c) => setQuizScores((p) => ({ ...p, [id]: c }))} answerId="quiz2" />}
          {screen === SCREENS.PRIORITY && <PrioritizationScreen onBack={() => goTo(SCREENS.QUIZ2)} onNext={() => goTo(SCREENS.POSTTEST)} onPriorityScore={(r, j) => setPriorityScore({ rankCorrect: r, justified: j })} />}
          {screen === SCREENS.POSTTEST && <TestScreen title="Post-Test" subtitle="Same questions as before, so let's see how much you've learned!" questions={PRETEST_QUESTIONS.map((q) => ({ ...q, options: [...q.options].reverse() }))} onComplete={(s) => { setPostScore(s); goTo(SCREENS.RESULTS); }} onBack={() => goTo(SCREENS.PRIORITY)} />}
          {screen === SCREENS.RESULTS && <ResultsScreen preScore={preScore} postScore={postScore} quizScores={quizScores} checklistScore={checklistScore} priorityScore={priorityScore} onRestart={restart} onJumpTo={goTo} />}
        </div>
      </main>
    </div>
  );
}
