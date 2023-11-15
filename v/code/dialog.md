# myalert

The myalert class is a versatile dialog box designed for serving content to users, primarily used for error reporting. Serving as a substitute for the standard JavaScript alert, this class provides a flexible and customizable solution for displaying information to users within a modal or modalless dialog.

## Properties

### `proxy: HTMLDialogElement`

#### Description:

The `proxy` property represents the visual representation of the dialog box, implemented as an HTMLDialogElement. This property provides access to the underlying HTML dialog element, allowing for customization and manipulation.

---

### `anchor?: HTMLElement`

#### Description:

The optional `anchor` property specifies the HTML element to which the dialog box will be appended during initialization. If not provided, the document body is used as the default anchor. This property allows users to control the placement of the dialog within the DOM.

---

### `modal: boolean`

#### Description:

The `modal` property determines the display mode of the dialog, indicating whether it should be modal (`true`) or modalless (`false`). By default, the dialog is set to modal. Users can customize this property during class instantiation to suit the desired user interaction behavior.

---

### `data_original?: string`

#### Description:

The optional `data_original` property holds the information to be served within the dialog. It serves as the content or message displayed to the user. Users can customize this property to convey specific information or error messages within the dialog.

---

## Methods

### `constructor(anchor?: HTMLElement, modal: boolean = true, data_original?: string)`

##### Parameters:

- `anchor` (optional): The HTML element to which the dialog box will be appended. If not provided, the document body will be used as the default anchor.
- `modal` (optional, default: `true`): Specifies whether the dialog should be modal or modalless.
- `data_original` (optional): Information to be served in the dialog.

#### Description:

This constructor initializes the `myalert` class. It creates a visual representation (`proxy`), sets up the anchor element, and defines the modality of the dialog. Additionally, it instantiates the base class (`view`) to leverage its functionality. The dialog box is created on the specified anchor or the document body if no anchor is provided.

---

### `administer(): Promise<void>`

##### Description:

This method is responsible for coordinating the entire lifecycle of the dialog. It follows these steps:

1. **Open Dialog:** Invokes the private `open` method to display the dialog. There might be additional logic to fetch data from a server if necessary.
2. **Wait for User Response:** Awaits the completion of user activities within the dialog by calling the private `get_user_response` method.
3. **Close Dialog Unconditionally:** Closes the dialog unconditionally using the private `close` method.

---

### `onopen(): Promise<void>`

##### Description:

This public method is intended to be overridden in derived classes. It serves as a hook for performing any final preparations or custom actions when the dialog is opened. This could include rendering additional content, fetching dynamic data, or initializing specific behaviors.

---

## Examples

To illustrate the usage and capabilities of the `myalert` class, the following examples showcase common scenarios and use cases. Each example provides a clear demonstration of how to instantiate the class, customize its behavior, and interact with the dialog.

### Example 1

```ts
//
//Instanciate the dialog
const myDialog = new myalert(
  document.getElementById("dialogAnchor"),
  true,
  "Error: Something went wrong!"
);
//
//Serve content
myDialog.administer();
```

### Example 2

```ts
//
//Create a child class from the base class myalert to customize the proxy just before serving content
class custom_alert extends myalert {
  //
  constructor(
    anchor?: HTMLElement,
    data_original?: string,
    modal: boolean = true
  ) {
    //
    //Initialize an instance of the parent class
    super(anchor, modal, data_original);
  }
  //
  // Override the onopen method to perform a unique display
  public async onopen(): Promise<void> {
    //
    // Call the base class onopen method for any default preparations
    await super.onopen();
    //
    // Perfom additional preperation to the proxy
  }
}
//
//create an instance of the custom alert class
const report = new custom_alert(
  document.getElementById("dialogAnchor"),
  "Error: Something went wrong!",
  true
);
//
//Finally serve the report
report.administer();
```

---

# dialog
