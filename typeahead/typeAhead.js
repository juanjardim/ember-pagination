
!function($){
    "use strict"; // jshint ;

    /* TYPEAHEAD PUBLIC CLASS DEFINITION
     * ================================= */
    var Typeahead = function (element, options) {
        this.$element = $(element)
        //this.provider = options.options;
        this.options = $.extend({}, $.fn.typeahead.defaults, options)
        this.matcher = this.options.matcher || this.matcher
        this.sorter = this.options.sorter || this.sorter
        this.highlighter = this.options.highlighter || this.highlighter
        this.updater = this.options.updater || this.updater
        this.$menu = $(this.options.menu).appendTo('body')
        this.source = this.options.source
        this.shown = false
        this.listen()
    }
    Typeahead.prototype = {
        constructor: Typeahead
        ,
        select: function () {
            var propertyValue = this.$menu.find('.active').attr('data-value');
            var collectionName = this.$menu.find('.active').attr('data-collection');
            var propertyName = this.$menu.find('.active').attr('data-map');

            var collection = Ember.get(collectionName);
            collection.filterContent(propertyName, propertyValue.toUpperCase(), true);

            this.$element
                .val(propertyValue)
                .change()
            return this.hide()
        }
        ,
        updater: function (item) {
            return item
        }
        ,
        show: function () {
            var pos = $.extend({}, this.$element.offset(), {
                height: this.$element[0].offsetHeight
            })
            this.$menu.css({
                top: pos.top + pos.height
                ,
                left: pos.left
            })
            this.$menu.show()
            this.shown = true
            return this
        }
        ,
        hide: function () {
            this.$menu.hide()
            this.shown = false
            return this
        }
        ,
        lookup: function (event) {
            var items;
            this.query = this.$element.val()
            this.categories = [];

            var regularExpressions = typeAheadElements[this.options.provide];
            for(var i = 0; i < regularExpressions.length; i++){
                if((regularExpressions[i].exp).test(this.query))
                    this.categories.push(regularExpressions[i]);
            }

            items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source
            return this.renderCategories(this.query, items);
        }
        ,
        process: function (items) {
            var that = this
            items = $.grep(items, function (item) {
                return that.matcher(item)
            })
            items = this.sorter(items)
            if (!items.length) {
                return this.shown ? this.hide() : this
            }
            return this.render(items.slice(0, this.options.items)).show()
        }
        ,
        matcher: function (item) {
            return ~item.toLowerCase().indexOf(this.query.toLowerCase())
        }
        ,
        sorter: function (items) {
            var beginswith = []
                , caseSensitive = []
                , caseInsensitive = []
                , item
            while (item = items.shift()) {
                if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
                else if (~item.indexOf(this.query)) caseSensitive.push(item)
                else caseInsensitive.push(item)
            }
            return beginswith.concat(caseSensitive, caseInsensitive)
        }
        ,
        highlighter: function (item) {
            var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
            return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                return '<strong>' + match + '</strong>'
            })
        },

        clearItems : function(items){
            var temp = [];
            for(var i = 0; i < items; i++){
                if(items[i] == null || items[i] == "" || items[i] == " ")
                    continue;
                temp.push(items[i]);
            }
            return temp;
        },

        render: function (items) {
            var that = this
            items = $(items).map(function (i, item) {
                i = $(that.options.item).attr('data-value', item)
                i.find('a').html(that.highlighter(item))
                return i[0]
            })
            items.first().addClass('active')
            this.$menu.html(items)
            return this
        },

        getMatchItems : function(items){
            var that = this
            items = $.grep(items, function (item) {
                return that.matcher(item)
            })
            items = this.sorter(items)

            return items.slice(0, this.options.items);
        },


        renderCategories : function(item, items){
            if(item.trim() == ""){
                var elements = typeAheadElements[this.options.provide];
                var collectionName = elements[0].collection;
                var collection = Ember.get(collectionName);
                collection.cleanFilter();
                return;
            }
            var items = [];
            var that = this;
            if(this.categories.length == 0)
                return;
            items = this.getMatchItems(items);

            items = $(items).map(function (i, item) {
                i = $(that.options.item).attr('data-value', item)
                i.find('a').html(that.highlighter(item))
                return i[0]
            })
            /*var separator = $(that.options.divider).attr('class', "divider");
             items.push(separator[0]);*/

            for(var j = 0; j <= this.categories.length; j++){
                if(this.categories.get(j) == null)
                    continue;
                var categoryItem = this.categories.get(j);
                var value = categoryItem.category + "#" + item;
                var i = $(this.options.item).attr('data-value', item).attr('data-collection', categoryItem.collection).attr('data-map', categoryItem.categoryMap);
                i.find('a').html(categoryItem.category + ": " + this.highlighter(item))
                items.push(i[0]);
            }

            items.first().addClass('active');
            this.$menu.html(items)
            return this.show()
        },

        next: function (event) {
            var active = this.$menu.find('.active').removeClass('active')
                , next = active.next()

            if(next.hasClass("divider")){
                next.addClass('active');
                active = this.$menu.find('.active').removeClass('active')
                    , next = active.next()
            }

            if (!next.length)
                next = $(this.$menu.find('li')[0])
            next.addClass('active')
        }
        ,
        prev: function (event) {
            var active = this.$menu.find('.active').removeClass('active')
                , prev = active.prev()
            if(prev.hasClass("divider")){
                prev.addClass('active')
                active = this.$menu.find('.active').removeClass('active')
                    , prev = active.prev()
            }

            if (!prev.length)
                prev = this.$menu.find('li').last()
            prev.addClass('active')
        }
        ,
        listen: function () {
            this.$element
                .on('focus', $.proxy(this.focus, this))
                .on('blur', $.proxy(this.blur, this))
                //.on('keypress', $.proxy(this.keypress, this))
                .on('keyup', $.proxy(this.keyup, this))
            if (this.eventSupported('keydown')) {
                this.$element.on('keydown', $.proxy(this.keydown, this))
            }
            this.$menu
                .on('click', $.proxy(this.click, this))
                .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
                .on('mouseleave', 'li', $.proxy(this.mouseleave, this))

        }
        ,
        eventSupported: function(eventName) {
            var isSupported = eventName in this.$element
            if (!isSupported) {
                this.$element.setAttribute(eventName, 'return;')
                isSupported = typeof this.$element[eventName] === 'function'
            }
            return isSupported
        }
        ,
        move: function (e) {
            if (!this.shown) return
            switch(e.keyCode) {
                case 9: // tab
                case 13: // enter
                case 27: // escape
                    e.preventDefault()
                    break
                case 38: // up arrow
                    e.preventDefault()
                    this.prev()
                    break
                case 40: // down arrow
                    e.preventDefault()
                    this.next()
                    break
            }
            e.stopPropagation()
        }
        ,
        keydown: function (e) {
            this.suppressKeyPressRepeat = !~$.inArray(e.keyCode, [40,38,9,13,27])
            this.move(e)
        }
        ,
        keypress: function (e) {
            if (this.suppressKeyPressRepeat) return
            this.move(e)
        }
        ,
        keyup: function (e) {
            switch(e.keyCode) {
                case 40: // down arrow
                case 38: // up arrow
                case 16: // shift
                case 17: // ctrl
                case 18: // alt
                    break
                case 9: // tab
                case 13: // enter
                    if (!this.shown) return
                    this.select()
                    break
                case 27: // escape
                    if (!this.shown) return
                    this.hide()
                    break
                default:
                    this.lookup()
            }
            e.stopPropagation()
            e.preventDefault()
        }
        ,

        focus: function (e) {
            this.focused = true
        }
        ,
        blur: function (e) {
            this.focused = false
            if (!this.mousedover && this.shown) this.hide()
        }
        ,
        click: function (e) {
            e.stopPropagation()
            e.preventDefault()

            var propertyValue = this.$menu.find('.active').attr('data-value');
            var collectionName = this.$menu.find('.active').attr('data-collection');
            var propertyName = this.$menu.find('.active').attr('data-map');

            var collection = Ember.get(collectionName);
            collection.filterContent(propertyName, propertyValue.toUpperCase(), true);
                this.$element
                .val(propertyValue)
                .change()
            return this.hide()

        }
        ,
        mouseenter: function (e) {
            this.mousedover = true
            this.$menu.find('.active').removeClass('active')
            $(e.currentTarget).addClass('active')
        }

        ,
        mouseleave: function (e) {
            this.mousedover = false
            if (!this.focused && this.shown) this.hide()
        }
    }
    /* TYPEAHEAD PLUGIN DEFINITION
     * =========================== */
    $.fn.typeahead = function (option) {
        return this.each(function () {
            var $this = $(this)
                , data = $this.data('typeahead')
                , options = typeof option == 'object' && option
            if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }
    $.fn.typeahead.defaults = {
        source: []
        ,
        items: 8
        ,
        menu: '<ul class="typeahead dropdown-menu"></ul>'
        ,
        item: '<li><a href="#"></a></li>'
        ,
        divider : '<li></li>',
        minLength: 1
    }
    $.fn.typeahead.Constructor = Typeahead
    /* TYPEAHEAD DATA-API
     * ================== */

    var items = Object.keys(typeAheadElements);
    for(var i = 0; i < items.length; i++){
        $(document).on('focus.typeahead.data-api', '[data-provide="' + items[i] + '"]', function (e) {
            var $this = $(this)
            var element = this.attributes.getNamedItem("data-provide")
            if ($this.data(element.value)) return
            e.preventDefault()
            $this.typeahead($this.data())
        });
    }
}(window.jQuery);