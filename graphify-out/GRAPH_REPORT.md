# Graph Report - pagina PRO  (2026-08-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 176 nodes · 205 edges · 17 communities (9 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 15
- Community 16

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `SecretExperience()` - 10 edges
3. `include` - 6 edges
4. `setup()` - 5 edges
5. `normalizeAnswer()` - 5 edges
6. `clampPhaseIndex()` - 5 edges
7. `SecretKeySystem()` - 4 edges
8. `isAcceptedAccessCode()` - 4 edges
9. `isAcceptedPhaseAnswer()` - 4 edges
10. `isFirstPhaseAccessCode()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `submitKey()` --calls--> `normalizeSecretEntry()`  [EXTRACTED]
  components/SecretKeySystem.tsx → lib/secret-keys.ts
- `POST()` --calls--> `isAcceptedAccessCode()`  [EXTRACTED]
  app/api/access/route.ts → lib/answer-vault.ts
- `POST()` --calls--> `isFirstPhaseAccessCode()`  [EXTRACTED]
  app/api/access/route.ts → lib/answer-vault.ts
- `POST()` --calls--> `isAcceptedPhaseAnswer()`  [EXTRACTED]
  app/api/answer/route.ts → lib/answer-vault.ts
- `isAcceptedAccessCode()` --calls--> `normalizeAnswer()`  [EXTRACTED]
  lib/answer-vault.ts → lib/normalize.ts

## Import Cycles
- None detected.

## Communities (17 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (25): keypad, logicOptions, logicOrder, LogicOrderGame(), NumericMemoryGame(), numericSequence, SecretGameModal(), SecretGameModalProps (+17 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (13): Loader365(), Loader365Props, targetDigits, ScrollChoreography(), ScrollChoreographyProps, emptyProgress, medals, Progress (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, ES2022, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (15): gsap, @gsap/react, lenis, next, dependencies, gsap, @gsap/react, lenis (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.26
Nodes (9): POST(), POST(), acceptedAnswersByPhase, isAcceptedAccessCode(), isAcceptedPhaseAnswer(), isFirstPhaseAccessCode(), normalizeAnswer(), Phase (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (13): devDependencies, tailwindcss, @types/node, @types/react, @types/react-dom, @types/three, typescript, tailwindcss (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.23
Nodes (7): clampPhaseIndex(), readProgress(), SecretExperience(), choosePhase(), submitAccess(), submitPhaseAnswer(), writeProgress()

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, type, version

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (8): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude, include

## Knowledge Gaps
- **68 isolated node(s):** `SecretGameModalProps`, `SecretKeyProgress`, `NormalSecretAnimation`, `Loader365Props`, `ScrollChoreographyProps` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 99 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `phases` connect `Community 4` to `Community 1`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 3` to `Community 7`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `SecretGameModalProps`, `SecretKeyProgress`, `NormalSecretAnimation` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07899159663865546 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10822510822510822 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._