

# State with Array

When a `State` object holds an array, you can use these specialized methods to manipulate the array's contents reactively. These methods ensure that listeners and UI components are notified of specific changes, such as adding, removing, or updating elements.

### Updating Array Elements

- `setByIndex<U>(index: number, value: U)`: Updates the value of an element at a specific index in the array. This method is the reactive way to change an item.
    ```typescript
    // Example
    const fruits = createState<string[]>(['apple', 'banana', 'cherry']);
    fruits.setByIndex(1, 'blueberry');
    
    console.log(fruits.get());
    // Output: ['apple', 'blueberry', 'cherry']
    ```

### Adding New Elements

- `insertAt<U>(index: number, value: U)`: Inserts a new value into the array at the specified index. This will shift all subsequent elements to the right.
    ```typescript
    // Example
    const numbers = createState<number[]>([1, 2, 4]);
    numbers.insertAt(2, 3); // Inserts 3 at index 2
    
    console.log(numbers.get());
    // Output: [1, 2, 3, 4]
    ```

- `append<U>(value: U)`: Adds a new value to the end of the array. This is a convenient shortcut for insertAt with the last index.
    ```typescript
    // Example
    const list = createState<string[]>(['A', 'B']);
    list.append('C');
    
    console.log(list.get());
    // Output: ['A', 'B', 'C']
    ```

- `prepend<U>(value: U)`: Adds a new value to the beginning of the array. This is a shortcut for insertAt(0, value).
    ```typescript
    // Example
    const list = createState<string[]>(['B', 'C']);
    list.prepend('A');
    
    console.log(list.get());
    // Output: ['A', 'B', 'C']
    ```

### Removing Elements

- `removeAt<U>(index: number)`: Removes the element at the specified index from the array.
    ```typescript
    // Example
    const letters = createState<string[]>(['A', 'B', 'C']);
    letters.removeAt(1); // Removes 'B'
    
    console.log(letters.get());
    // Output: ['A', 'C']
    ```

### Transforming Arrays

- `map<U>(cb: (item: U, index: number) => unknown): unknown[]`: This method behaves just like the standard JavaScript `Array.prototype.map()` method. It iterates over the array, applies a callback function to each element, and returns a new array with the results.

__Note__: This method does not trigger reactivity, as it's meant for creating a new derived array, not for modifying the original state.
