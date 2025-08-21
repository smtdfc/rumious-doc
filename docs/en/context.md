# Context

The `Context` class in Rumious provides a powerful mechanism for managing and sharing application-wide data. It acts as a central data store, allowing you to pass values down to different components without manually "prop drilling" them through many layers. Its design is inspired by the Provider pattern, making it easy to create and access shared state.

### Initialization

The `Context` class is instantiated using the `createContext()` function. This function accepts an object as an argument, which serves as the initial data for the context.

```typescript
import { createContext } from '@rumious/core';

type UserContext {
  name:string;
  isLoggedIn: boolean,
  preferences: { theme: string' }
}

// Create a Context to manage user information
const userContext = createContext<UserContext>({
  name: 'Jane Doe',
  isLoggedIn: true,
  preferences: { theme: 'dark' }
});

type AppContext {
  language:string;
  notifications:boolean;
}

// Create another Context for application configuration
const appConfig = createContext<AppContext>({
  language: 'en',
  notifications: true
});
```

### Core Functionality

- `get(): T`: Retrieves the entire object of values currently stored in the context.

  ```typescript
  // Example
  const allValues = userContext.get();
  console.log(allValues);
  // Output: { name: 'Jane Doe', isLoggedIn: true, preferences: { theme: 'dark' } }
  ```

- `getKey<K>(name: K): T[K]`: Retrieves the value associated with a specific key. This is a non-reactive way to get a single value.

  ```typescript
  // Example
  const userName = userContext.getKey('name');
  console.log(userName);
  // Output: 'Jane Doe'
  ```

- `set(value: T)`: Replaces the entire context object with a new one. All previous values will be overwritten.

  ```typescript
  // Example
  userContext.set({
    name: 'John Doe',
    isLoggedIn: false,
    preferences: { theme: 'light' },
  });
  console.log(userContext.get());
  // Output: { name: 'John Doe', isLoggedIn: false, preferences: { theme: 'light' } }
  ```

- `setKey<K>(name: K, value: T[K])`: Updates the value for a specific key within the context object. This method does not trigger any reactivity.
  ```typescript
  // Example
  userContext.setKey('isLoggedIn', true);
  console.log(userContext.getKey('isLoggedIn'));
  // Output: true
  ```

### Event System

The Context class includes a built-in event bus, which is a great way to communicate across different parts of your application without creating tight dependencies. This system operates separately from the core value storage.

- `on(name: string, callback: ContextEventCallback)`: Registers a callback function to be executed whenever an event with the specified name is emitted.

  ```typescript
  // Example
  const onLogin = (data) => console.log('User has logged in!');
  userContext.on('login', onLogin);
  ```

- `off(name: string, callback: ContextEventCallback)`: Removes a previously registered callback function for a given event name.

  ```typescript
  // Example
  userContext.off('login', onLogin);
  ```

- `emit(name: string, data: T)`: Triggers an event with the specified name, and passes the entire context data to all registered listeners.
  ```typescript
  // Example
  userContext.emit('login', userContext.get());
  // The 'onLogin' callback will be triggered, logging to the console.
  ```

### Reactivity with State

This is where Context shines in reactive applications. The `reactivekey` method allows you to bridge the gap between static context data and the dynamic reactivity of Rumious's State objects.-

- `reactivekey<k>(key: k): state<t[k]>`: This method returns a State object that is directly linked to a specific key in the context's data. This State object can be used in your UI to automatically trigger updates whenever the value for that key changes.
  ```typescript
  // Example
  // Get a reactive state for the 'name' key
  const userNameState = userContext.reactiveKey('name');

  // You can now use this State object in a component
  // <span>{userNameState}</span>

  // When you update the State, the UI will automatically refresh.
  userNameState.set('Alexander');
  console.log(userNameState.get());
  // Output: 'Alexander'
  ```
