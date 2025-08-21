# Reactive System

The Rumious Reactive System is meticulously designed to automatically keep your user interface (UI) synchronized with your application's data. At its core, this system operates on a single, powerful principle: when data changes, it automatically notifies the parts of the UI that depend on it to update themselves. This elegant mechanism completely eliminates the need for manual DOM manipulation, allowing you to focus on the logic of your application.

### How It Works: The Core Mechanism
In Rumious, reactivity is not an abstract concept but a purposeful, well-defined mechanism built on three fundamental pillars:
 * The Data Source (State): Everything begins with a `State` object. When you create a `State` using `createState()`, you are creating a special data source. This source is intelligent; it has the inherent ability to notify its "listeners" whenever its value changes. Think of it as a central hub for your data.
 * The Connection (Binding): When you use a `State` object within your JSX code, Rumious automatically creates an invisible, yet powerful, connection between that specific DOM element and the State. This is called a binding. This binding acts as a direct line of communication, ensuring that the DOM element is always listening for changes from the State.
 * The Trigger and Update (Triggering and Updating the DOM): Whenever you modify the value of a State using methods like `set()` or `update()`, the State object immediately sends out a notification. The reactive system then receives this notification and, thanks to the bindings, knows exactly which parts of the DOM are affected. This allows Rumious to precisely and surgically update only the necessary parts of the UI, providing optimal performance without the need to re-render an entire component.

#### Reactivity with Primitive States
Before diving into objects, let's look at the simplest form of reactivity: using a State with a primitive value like a number or a string. This is the foundation of the reactive system.
```typescript
import { createApp, createState,Component } from '@rumious/core';

const app = createApp({
    root: document.body
});

// A simple State object containing a number
const countState = createState(0);

// The `<h1>` element is now bound to `countState`
app.setRootLayout(
  <div>
    <h1>Count: {countState}</h1>
    <button on:click={() => countState.update(v => v + 1)}>
      Increment
    </button>
  </div>
);

app.start();
// When the button is clicked, countState is updated.
// Rumious automatically detects this change and updates the `<h1>` element,
// without re-rendering the entire <div>.
```

In this example, the JSX expression `{countState}` creates a binding. When the `countState.update()` method is called, the value of the State changes, and Rumious efficiently updates only the text content of the `<h1>` tag.

#### Mastering Reactivity with Objects
Working with objects requires a clear understanding of how Rumious tracks changes. This is a crucial point for new developers to grasp.
 * The Correct (Reactive) Approach: To ensure reactivity, you must access the object's properties directly from the State object. By doing so, Rumious can analyze the expression within your JSX and create individual reactive bindings for each property.
    ```typescript
    import { createApp, createState,Component } from '@rumious/core';

    const app = createApp({
        root: document.body
    });

    // A State object containing user data
    const userState = createState({ name: 'Alice', age: 25 });
    
    // Both expressions are reactive.
    // Rumious will track and update 'name' and 'age' independently.
    app.setRootLayout(
      <div>
        <p>Name: {userState.get().name}</p>
        <p>Age: {userState.get().age}</p>
      </div>
    );
    
    app.start();
    // When you call setKey(), only the <p> element for 'name' is updated.
    userState.setKey('name', 'Bob');
    ```

 * The Incorrect (Non-reactive) Approach: A common mistake is to destructure or extract the value from the State into a local variable. When you do this, you unintentionally sever the connection to the reactive system. The local variable becomes a static copy of the data at that moment, and Rumious has no way of tracking it.
    ```typescript
    import { createApp, createState,Component } from '@rumious/core';

    const app = createApp({
        root: document.body
    });

    const userState = createState({ name: 'Alice', age: 25 });
    
    // Common mistake: Extracting a static value
    const user = userState.get();
    
    // This expression is NOT reactive!
    // The UI will never change when userState is updated.
    app.setRootLayout(
      <div>
        <p>Name: {user.name}</p>
        <p>Age: {user.age}</p>
      </div>
    );
    
    app.start();
    // The state is updated, but the UI still displays 'Alice' and '25'.
    userState.setKey('name', 'Bob');
    
    ```

#### Reactivity with Nodes
Rumious's reactive system is flexible enough to handle not only primitive values and objects but also DOM Nodes themselves. This allows you to dynamically swap out entire elements or even chunks of content based on your application's state. When you use a State that holds a Node as its value, Rumious will automatically insert or replace that Node in the correct position on the DOM.
Consider a scenario where you want to switch between two different messages based on a boolean state:
```typescript
import { createApp, createState,Component } from '@rumious/core';

const app = createApp({
    root: document.body
});


const showSuccessState = createState(true);

const successMessage = document.createTextNode("Success");
const errorMessage = document.createTextNode("Error");

app.setRootLayout(
  <div>
    {showSuccessState.get() ? successMessage : errorMessage}
    <button on:click={() => showSuccessState.set(!showSuccessState.get())}>
      Toggle Message
    </button>
  </div>
);

app.start();
```

In this example, the expression `{showSuccessState.get() ? successMessage : errorMessage}` is reactive. When you click the button, `showSuccessState` changes, and Rumious intelligently removes the old `<p>` element and inserts the new one in its place. This functionality provides immense power for building dynamic and complex UIs.

#### Reactivity Through State Propagation
One of the most powerful features of Rumious is its ability to pass a State object directly into a component or another function. Because the State is an object and always carries its reactive mechanism with it, its reactivity is preserved no matter where you use it. This allows for seamless data sharing across your application.
Consider this example:
```typescript
import { createApp, createState,Component } from '@rumious/core';

// A State object to track a count
const countState = createState<number>(0);

class MyButton extends Component {
  template() {
    // This component receives countState directly.
    return (
      <button on:click={() => countState.update(v => v + 1)}>Increment</button>
    );
  }
}

class MyCounter extends Component {
  template() {
    return (
      <div>
        <h1>Count: {countState}</h1>
        <MyButton />
      </div>
    );
  }
}

const app = createApp({
    root: document.body
});

app.setRootLayout(<MyCounter />);
app.start();
```

In this example, the `MyButton` component does not receive `countState` as a prop. Instead, it accesses it directly from the parent scope (closure). When MyButton calls `countState.update()`, it triggers the reactive system, and Rumious automatically updates the count displayed in the `<h1>` of the `MyCounter` component.
This demonstrates that you can share and interact with a State object throughout your application without ever losing its inherent reactivity.
