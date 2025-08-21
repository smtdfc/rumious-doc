# State Overview

In Rumious, a **State** is a special object that represents dynamic data and can change over the lifecycle of an application. It allows reactivity across the UI by notifying relevant parts when data changes.


### Creating and Accessing State
You create a state object using the `createState` function, specifying the data type and an initial value.
```typescript
import { createState } from '@rumious/core';

// Create a state for a string
const greeting = createState<string>('Hello, Rumious!');

// Create a state for a number
const counter = createState<number>(0);

// Create a state for an object
const user = createState<{ name: string; age: number }>({
  name: 'John Doe',
  age: 30,
});
```

To get the current value of a state, you use the `.get()` method.
```typescript
const currentValue = greeting.get();
console.log(currentValue); // "Hello, Rumious!"
```

### Modifying State
The way you modify state determines whether or not it triggers reactivity.

#### `set()`
This is the most common method for changing a state's value. It sets a new value and immediately notifies all listeners, causing the UI to update.
```typescript
// Initial state
const status = createState<string>('idle');

// Change the state
status.set('loading');
// The UI will now show 'loading' wherever the `status` state is used.
```

#### `update()`
Use this method when you want to calculate the new state value based on the current one. The update() method accepts a callback function that receives the current value and should return the new value.
```typescript
const count = createState<number>(0);

// Increase the count by one
count.update((currentValue) => currentValue + 1);

// The count is now 1. Let's update it again.
count.update((currentValue) => currentValue * 2);
// The count is now 2.
```

#### `setInSlient()`
This method changes the state's value without triggering any reactivity. Use it when you need to update the data internally without causing a UI render.
```typescript
const serverMessage = createState<string>('Initial message');

// The UI will NOT update, but the value is changed
serverMessage.setInSlient('A silent update from the server.');

console.log(serverMessage.get()); // "A silent update from the server."
```

#### `forceReactive()`
This method manually triggers all listeners and observers, even if the state's value has not changed. This is useful in advanced scenarios where you need to force a re-render or side effect without a value change.
```typescript
const myState = createState<object>({ data: 'old' });

// We changed the object's property directly, which doesn't trigger reactivity by default
myState.get().data = 'new';

// Manually force an update
myState.forceReactive();
```

### Using State in JSX
When you embed a state object directly into your JSX, Rumious automatically creates a reactive connection. Any changes to the state's value will automatically update the corresponding part of the DOM.
```typescript
import {
  Fragment,
  createApp,
  createState
} from '@rumious/core';

const app = createApp({
  root: document.body
});

const count = createState<number>(0);

app.setRootLayout(
  <Fragment>
    <h1>The current count is: <span>{count}</span></h1>
    <button on:click={() => count.update(v => v + 1)}>
      Increase Count
    </button>
  </Fragment>
);

app.start();
```

In this example, when you click the "Increase Count" button, count.update() changes the state's value. Rumious detects this change and updates only the `<span>` element, making the process highly efficient.

### Watching a State
If you need to perform actions that are not related to the UI—known as side effects—you can use the watch function. This allows you to run a callback function whenever a state's value changes.
```typescript
import { watch, createState } from '@rumious/core';

const username = createState<string>('guest');

// Log the new value whenever username changes
watch(username, (newUsername) => {
  console.log(`Username changed to: ${newUsername}`);
});

// This will trigger the watch callback
username.set('Alice');

// This will also trigger the watch callback
username.set('Bob');
```

This is useful for tasks such as logging, saving data to local storage, or fetching data from an API based on a state change.
