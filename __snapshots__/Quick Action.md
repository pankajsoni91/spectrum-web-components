# `Quick Action`

#### `loads`

```html
<div id="contents">
    <slot></slot>
    <div id="actions">
        <slot name="action"></slot>
    </div>
</div>
```

#### `loads - open`

```html
<div id="contents">
    <slot></slot>
    <div id="actions">
        <slot name="action"></slot>
    </div>
</div>
```

#### `loads - open, overlay`

```html
<div id="contents">
    <div id="overlay"></div>
    <slot></slot>
    <div id="actions">
        <slot name="action"></slot>
    </div>
</div>
```

#### `loads - open, isShiftTabbing`

```html
<div id="contents">
    <div id="actions">
        <slot name="action"></slot>
    </div>
    <slot></slot>
</div>
```
