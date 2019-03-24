# AF DataBinding CCC
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/52c8abec92134998a497fea899abb5cd)](https://www.codacy.com/app/TitanNanoDE/af-DataBinding?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=TitanNanoDE/af-DataBinding&amp;utm_campaign=Badge_Grade)
[![npm version](https://badge.fury.io/js/%40af-modules%2Fdatabinding.svg)](https://badge.fury.io/js/%40af-modules%2Fdatabinding)

AF DataBinding is a up coming Data Binding module for [ApplicationFrame](https://github.com/TitanNanoDE/ApplicationFrame).

This library allows fast, high performant and extensible data binding.
With the integrated extension API it is possible to add custom bindings as desired.

## Details
Bindings are processed synchronously but view updates happen asynchronously.
This allows the binding system to operate fast and non blocking.
Users also don't have to worry about accidentally starting multiple update cycles,
since there will be always be just one update cycle at the end of a call stack


## How To
Everything is constructed from html templates. To use data binding on an element
simply move the element into a html template.

```html
<template id="my-binding-snippet">
    <div class="item">{{itemText}}</div>
</template>
```

### Bind a Template
In order to bind data to a template it is required to tell the data binding engine
about the template

```JavaScript
import DataBinding from 'af-DataBinding';

let scope = {
    itemText: 'test',
};

scope = DataBinding.makeTemplate('#my-binding-snippet', scope).scope;
```

This short snippet allows to get the template processed and receive an instance
of it. Since it is often not desired to only instantiate a template, a specific
attribute has been created.

```html
<template id="my-binding-snippet" replace>
    <div class="item">{{itemText}}</div>
</template>
```

The `replace` attribute tells the binding engine to automatically replace
the template in the DOM with the new instance.
Therefore this would result in the following HTML snippet.

```html
<div class="item">test</div>
```

### repeat a template
the current implementation of the engine allows to automatically repeat a part
of a template. This can be achieved with the following construct.

```html
<template id="something-something" replace>
    <ul>
        <template bind-repeat="item in items">
            <li>{{item}}</li>
        </template>
    </ul>
</template>
```

Elementary in this example is the inner template element. It will get
automatically repeated, for every element in the `items` array on the scope,
when the surrounding template gets instantiated.
