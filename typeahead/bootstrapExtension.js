
!function($){
    "use strict"; // jshint ;_;
    var macType1 = /^([0-9A-Fa-f]{2}[.:-]){5}([0-9A-Fa-f]{2})$/;
    var macType2 = /^([0-9A-Fa-f]{12})$/;
    var macType3 = /^[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}\.[0-9A-Fa-f]{4}$/;
    var macType4 = /^([0-9A-Fa-f]{2}[.:-])$/;
    var customerNr = /^([0-9]){4,}$/;
    var number = /^\d+$/;
    var phoneNumber = /9[1236][0-9]{7}$|2[1-9][0-9]{7}$/;
    var name = /[.:-]/;
    var msisdn = /^9\d{8}$/;
    //var msisdn2 = /^969/;
    var ipType1 = /^\d{1,3}\./;
    var ipType2 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    var packPonSlot1 = /^ONT\-\d{1,2}\-\d{1,2}\-\d{1,3}$/;
    var packPonSlot2 = /^ont\-\d{1,2}\-\d{1,2}\-\d{1,3}$/;
    /* TYPEAHEAD PUBLIC CLASS DEFINITION
 * ================================= */
    var Typeahead = function (element, options) {
        this.$element = $(element)
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
            var val = this.$menu.find('.active').attr('data-value')
            this.$element
            .val(SearchController.setItem(val))
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
            var hasElement = false;
            var hasHistory = false;
            this.query = this.$element.val()
            this.categories = [];
            if(macType1.test(this.query) || macType2.test(this.query) || macType3.test(this.query) || macType4.test(this.query)){
                this.categories.push("Mac Address");
                hasElement = true;
                if(!hasHistory){
                    this.categories.push("Histórico");
                    hasHistory = true;
                }
            }
            if(customerNr.test(this.query)){
                this.categories.push("Nº Cliente");
                if(!hasHistory){
                    this.categories.push("Histórico");
                    hasHistory = true;
                }
               
            } 
            if(number.test(this.query)){
                this.categories.push("Nº Contribuinte");
                if(phoneNumber.test(this.query)){
                    this.categories.push("Nº Telefone");
                    if(!hasHistory){
                        this.categories.push("Histórico");
                        hasHistory = true;
                    }
                }
                if(msisdn.test(this.query)){
                    this.categories.push("MSISDN");
                    hasElement = true;
                } 
            }
            if(ipType1.test(this.query) || ipType2.test(this.query)) {
                this.categories.push("IP");
                hasElement = true;
            } 
            if(packPonSlot1.test(this.query) ||packPonSlot2.test(this.query)){
                this.categories.push("PackPonSlot");
                hasElement = true;
            }
            if(this.categories.length == 0){
                if(!name.test(this.query)){
                    this.categories.push("Nome/Apelido");
                    this.categories.push("Morada");
                }
                this.categories.push("MyZon");                
                if(!hasHistory){
                    this.categories.push("Histórico");
                    hasHistory = true;
                }
            }
            this.categories.push("Username");
            var permissions = CollaboratorController.get("Permissions");
            if(NetworkController != null && permissions != null && permissions.NetworkPermissions.bd && !hasElement)
                this.categories.push("TAG/Nome");
 
 
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
            //var items = [];
            var that = this
            items = this.getMatchItems(items);
 
            items = $(items).map(function (i, item) {
                i = $(that.options.item).attr('data-value', item)
                i.find('a').html(that.highlighter(item))
                return i[0]
            })
            var separator = $(that.options.divider).attr('class', "divider");
            items.push(separator[0]);
 
            for(var j = 0; j <= this.categories.length; j++){
                if(this.categories.get(j) == null)
                    continue;
                var value = this.categories.get(j) + "#" + item;
                var i = $(this.options.item).attr('data-value', value);
                i.find('a').html(this.categories.get(j) + ": " + this.highlighter(item))
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
 
            var val = this.$menu.find('.active').attr('data-value')
            this.$element
            .val(SearchController.setItem(val))
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
    $(document).on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
        var $this = $(this)
        if ($this.data('typeahead')) return
        e.preventDefault()
        $this.typeahead($this.data())
    })
}(window.jQuery);