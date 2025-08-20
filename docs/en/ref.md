# Element Ref
A `Ref` is an object in Rumious that provides a way to get direct access to a DOM element within your component. It's used when you need to interact with a physical HTML element, bypassing Rumious's reactive system for specific tasks like managing focus, getting element dimensions, or using third-party libraries.

### Create a Ref

A `Ref` is created using the `createref()` function and is attached to an element using the `ref={...}` attribute.
```typescript
import { createApp,createRef } from '@rumious/core';

// Create a ref for an input element
const inputRef = createRef<HTMLInputElement>();

const app = createApp({
  root:document.getElementById("root")
});

app.setRootLayout(
  <input ref={inputRef} placeholder="Enter your name" />;
)

// Use the ref to interact with the element
setTimeout(() => {
  if (inputRef.element) {
    // Focus the input after 1 second
    inputRef.focus();
    // Set its value
    inputRef.value = 'Rumious';
    console.log(inputRef.value); // Output: 'Rumious'
  }
}, 1500);

app.start();
```

### Properties
-  `element: T | null`: This property holds the actual DOM element the ref is bound to. Its value is null until the component is rendered and the element is attached to the DOM.
    ```typescript
    const divRef = createRef<HTMLDivElement>();
    // ...
    // divRef.element is initially null
    // After the component renders:
    // divRef.element will be the actual <div> element
    ```

-  `value: string`: A getter and setter for the .value property of the element. This is commonly used with form elements like `<input>`, `<textarea>`, and `<select>`.
    ```typescript
    const myInput = createRef<HTMLInputElement>();
    // ...
    <input ref={myInput} type="text" value="initial value" />
    // ...
    console.log(myInput.value); // Output: "initial value"
    myInput.value = 'new value'; // Sets the input's value
    ```

 -  `text: string`: A getter and setter for the textContent of the element. It allows you to read or set the plain text content inside an element.
    ```typescript
    const titleRef = createRef<HTMLHeadingElement>();
    // ...
    <h1 ref={titleRef}>Hello World</h1>
    // ...
    console.log(titleRef.text); // Output: "Hello World"
    titleRef.text = 'Goodbye World'; // Changes the text content
    ```

 -  `html: string`: A getter and setter for the innerHTML of the element. This lets you read or set the HTML content inside an element. Caution: Be careful when using this to avoid XSS (Cross-Site Scripting) vulnerabilities.
    ```typescript
    const containerRef = createRef<HTMLDivElement>();
    // ...
    <div ref={containerRef}>
      <p>Initial content</p>
    </div>
    // ...
    console.log(containerRef.html); // Output: "<p>Initial content</p>"
    containerRef.html = '<span>New content</span>'; // Replaces the HTML
    ```


Methods
 -  isSet(): boolean
   Checks if the Ref has been successfully attached to a DOM element.
   if (inputRef.isSet()) {
  // Perform actions only when the ref is ready
  inputRef.focus();
}

Class Operations
 -  addClass(name: string): void
   Adds a class to the element's class list.
   myElementRef.addClass('active');

 -  removeClass(name: string): void
   Removes a class from the element's class list.
   myElementRef.removeClass('hidden');

 -  toggleClass(name: string): void
   Toggles a class on the element (adds it if it's not there, removes it if it is).
   myElementRef.toggleClass('is-open');

DOM Utilities
 -  addChild(node: Node): void
   Appends a child node to the element.
   const newParagraph = document.createElement('p');
newParagraph.textContent = 'New paragraph';
containerRef.addChild(newParagraph);

 -  clear(): void
   Removes all child nodes and content inside the element.
   // Clear all content inside the container
containerRef.clear();

 -  remove(): void
   Removes the element from the DOM and clears the internal reference.
   // Remove the divRef element from the page
divRef.remove();
console.log(divRef.isSet()); // Output: false

Attributes
 -  setAttr(name: string, value: string): void
   Sets an attribute on the element.
   myElementRef.setAttr('data-id', '123');

 -  getAttr(name: string): string | null
   Gets the value of an attribute, or null if the attribute doesn't exist.
   const id = myElementRef.getAttr('data-id');
console.log(id); // Output: '123'

 -  removeAttr(name: string): void
   Removes an attribute from the element.
   myElementRef.removeAttr('data-id');

Event Listeners
 -  on(event, listener): void
   Adds an event listener to the element.
   const handleClick = () => console.log('Click!');
myButtonRef.on('click', handleClick);

 -  off(event, listener): void
   Removes an event listener.
   myButtonRef.off('click', handleClick);

Focus Control
 -  focus(): void
   Sets focus on the element (if applicable). This is useful for form elements.
   inputRef.focus();

 -  blur(): void
   Removes focus from the element.
   inputRef.blur();

Visibility
 -  hide(): void
   Hides the element by setting style.display = 'none'.
   myElementRef.hide();

 -  show(display = 'block'): void
   Shows the element by setting the display style. The default value is 'block'.
   myElementRef.show(); // Sets display: block
mySpanRef.show('inline'); // Sets display: inline

Style Manipulation
 -  setStyle(property: string, value: string): void
   Sets a CSS property directly on the element.
   myElementRef.setStyle('color', 'red');

 -  getStyle(property: string): string
   Gets the computed value of a CSS property.
   const color = myElementRef.getStyle('color');
console.log(color); // Output: 'red'

