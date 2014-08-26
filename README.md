Welcome to Ember Pagination!
=====================

This is a project that will help developers with paginations of items in ember.

----------


What you need
---------


**Ember.js** its a framework for creating ambitious web applications  (see [Ember.js])


#### PaginationController

Add this controller to your Ember project in order to help with the methods that would handle the actions of next previus etc.
#### PaginationView
Here you will find the actions of the paginations.

#### Pagination.js
In this file we extended the CollectionArray in order to added features that will help the pagination.

#### typeAheadElements.js
Here we added the collection that would be used in the typeahead and also the regular expressions that would be mapped in order to filter the content.

```
var typeAheadElements = {
    'typeahead-cities': [
        {
            'exp' : /[a-zA-Z ]/,
            'category' : 'City',
            'categoryMap' : 'name',
            'collection' : 'Cities'
        }
    ]
}
```

It's important to note that the "typeahead-cities" is the label that we use in the "data-provide" of the typeahed.


See the [demo] for more fun



License
----

The MIT License (MIT)


[Ember.js]:http://emberjs.com/
[demo]:http://juanjardim.com/emberpagination
