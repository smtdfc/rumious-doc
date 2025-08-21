# State with Object 

While a `State` can hold any value, it provides specialized methods to handle objects efficiently and reactively. These methods are designed to trigger updates for specific keys, avoiding unnecessary full object replacements. This is particularly useful for fine-grained control over UI reactivity.

### Getting and Setting Object Properties
 - `getKey<K>(key: K): T[K]`: Retrieves the value of a specific property from the state's object. This is a direct, non-reactive way to get a value.
    ```typescript
    const user = createState({
      name: 'Jane Doe',
      age: 30
    });
    
    const userName = user.getKey('name');
    console.log(userName); // 'Jane Doe'
    ```

 - `setKey<K>(key: K, value: T[K]): void`: Updates the value of a specific property within the object. This method triggers a reactive update, notifying any observers that are watching this particular key.
    ```typescript
    const user = createState({
      name: 'Jane Doe',
      age: 30
    });
    
    user.setKey('age', 31);
    // This will trigger reactivity, updating any part of the UI linked to the 'age' key.
    console.log(user.get().age); // 31
    ```

### Reactive Property Wrappers
 - `wrapKey<K>(key: K): State<T[K]>`: This is the primary method for creating fine-grained reactivity. It returns a new State object that is automatically bound to a specific property (key) of the parent object state. This is highly efficient as only the UI component observing the wrapped key will re-render when that specific key's value changes.Calling this method multiple times with the same key will always return the same State instance, ensuring consistency.
    ```typescript
    const user = createState({
      name: 'Jane Doe',
      preferences: { theme: 'light' }
    });
    
    // Create a reactive state for the 'theme' property
    const themeState = user.wrapKey('preferences').wrapKey('theme');
    
    // This state can now be used directly in JSX
    // <div>Current Theme: {themeState}</div>
    
    // When we update the parent state's key, the wrapped state updates automatically.
    user.setKey('preferences', { theme: 'dark' });
    console.log(themeState.get()); // 'dark'
    ```

 - `wrap<K>(cb: (val: T) => K): State<K>`: Creates a new reactive State that is a derived value from the parent state. The value of this new state is calculated by the provided callback function (cb). Whenever the parent state changes, the callback is re-executed, and the derived state is updated. This is perfect for displaying calculated values based on state.
    ```typescript
    const user = createState({
      firstName: 'Jane',
      lastName: 'Doe'
    });
    
    // Create a derived state for the full name
    const fullNameState = user.wrap((val) => `${val.firstName} ${val.lastName}`);
    
    // This can be used in your UI
    // <span>Welcome, {fullNameState}!</span>
    
    // When the parent state changes...
    user.setKey('firstName', 'John');
    
    // ...the derived state automatically updates.
    console.log(fullNameState.get()); // 'John Doe'
    
    ```