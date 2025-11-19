**SoGloper** 0.8.0-alpha is a unified React library for state, logic and dataflow. It provides **minimal boilerplate**, **flexible dual operation modes**, **clean namespacing control**, **optional namespace-integrated persistence** and much more.

See the demo app using it live: [Link](https://savvyopen.github.io/so-gloper-react/)
---

## 🚀 Key Features

* **Two Operational Modes**

  * **Relax Mode** – Simple and easy-to-use, ideal for less complex projects.
  * **Control Mode** (upcoming) – Advanced features for large projects with maximum IDE support, symbolic references, and precise state management.

  * Both modes are designed to work together, if situation fits

* **Uniform Namespace Management** — Consistent naming in source code, runtime, and persistent storage.

  * Uses grouping and name conflicts detection during state creations
  
  * In Relax Mode: string literal keys in snake_case (`'group_name'` or `'group_subgroup_name'`) with optional multi-level subgroups.
  * In Control Mode (upcoming): symbolic references for maximum IDE support for autocomplete, refactoring & renaming safety, tree-shaking and more.

* **Programmatic API** — Useful for programmatic controls and debugging: `get()`, `set()`, `list()`, `reset()`, `remove()`.

  * Dynamic state creations using `createGloper` to prepare for use in component and/or in code.
  
* **Built-in and Namespace-integrated Persistence** — Supports both IndexedDB (async) and type-preserving LocalStorage (sync) out-of-the-box.

* **Lazy Load for Base State** — Base states assigned with Async/Sync functions are lazily loaded on first use (ideal for heavy instructions).

* **Multi-level get and set** (upcoming) - will support derived states and other advanced patterns.

* **Auto Immutable Update** — Support Object and Array within React component and it is designed to be off in programmatic API for typical dataflow

* **React 18+ Ready** — Fully supports concurrent rendering and transitions using `useSyncExternalStore`.

---

## Installation

For the latest release:

```bash
npm install so-gloper-react
```

---

## 📝 Relax Mode (Suitable for less complex projects)

* Define global state: createGloper('auth_token', { state: '123', persist: true });

  * This can be defined in `non-store style` for quick setup and/or in `store style` for semi IDE support
  
    > For a quick setup, it is typically done in main.tsx, but can be done at your discretion in App.tsx for simplicity

    > For semi IDE support, declare all `createGloper` as properties within an object literal in a separate file (e.g. store.ts).
	    * Requires importation of the store files to any components using them

* Access it in any component: const [token, setToken] = useGloper('auth_token');
* Access it programmatically: e.g. SoGloper.get('auth_token');

* Convenient aliases: `initGlobal = createGloper`, `useGlobal = useGloper`.

---

### Relax Mode - Non-Store Example (For Quick Setup)

```ts
// Typically in main.tsx, or cautiously in App.tsx

import { createGloper } from 'so-gloper-react';

createGloper('auth_token', { state: '123', persist: true });
```

```ts
// In any component file(s)

import { useGloper } from 'so-gloper-react';

function MyComponent() {

  const [token, setToken] = useGloper('auth_token');
  ...
}
```

---

## 📝 Relax Mode - Store Example (For Semi IDE Support)

* Use symbolic references to create states:

```ts
// cryptoStore.ts

import { createGloper } from 'so-gloper-react';

export const cryptoStore = {

  crypto_comment: createGloper('crypto_comment', { state: '' }),	// *** It is preferred the object property name and the string key name to match
  crypto_data: createGloper('crypto_data', { state: '' }),
};
```

* Consume state anywhere without worrying about initialization order:

```ts
// In any component file(s)

import { cryptoStore } from './cryptoStore.ts';
import { useGloper } from 'so-gloper-react';

function MyComponent() {

  const [cryptoData, setCryptoData] = useGloper(cryptoStore.crypto_data);
  ...
}
```
---

## 🛠 Programmatic API

* `get(snake_name)`
* `set(snake_name, value)`
* `list(groupName, {excludeSubgroups: true/false})`		Default is false
* `reset(snake_name, {withValue: x})`
* `resetAll({withValue: x})`
* `group(groupName, {excludeSubGroups: true/false})`	Default is false

```ts
import { SoGloper } from 'so-gloper-react';

// Setup in main.tsx or App.tsx for using programmatic API in developer console

SoGloper.configure({consoleDebug: true});
```


---

## ⚠️ Known Limitations

* No built-in handling for persistence failures (planned for future releases)
* LocalStorage supports primitive types only: `undefined`, `null`, `true/false`, `Number`, `String`, `Array`, `Object`.

  * `undefined` or `NaN` inside objects/arrays may not persist reliably.

---

## 📦 Demo App Overview (See the demo live: [Link](https://savvyopen.github.io/so-gloper-react/))

* **Intro View** – Introduces SoGloper syntaxes and usage.
* **Data View** – Fetch live crypto prices, add comments, state persisted with `useGloper()`.
* **Report View** – Displays persisted crypto data and comments, reset button included.
* **API View** – Display instructions to test drive the programmatic API in developer console.

---

## 🔧 Tech Stack

* React (with hash routing)
* SoGloper (state + persistence)
* No Redux, Zustand, Recoil, or middleware

---

## 🛠️ Status & Roadmap

* ✅ **Alpha** — Core API stable, demo fully functional
* 🧪 **Exploration** — Developer-friendly debugging tools
* 🔬 **Future** — Full Control Mode with symbolic references, IDE ergonomics, and advanced state flows

---