var CollectionArray = Ember.ArrayProxy.extend({
    content: [],
    defaultPropertyName : ["status"],
    defaultPropertyValue : ["ACTIVE"],
    propertyName: null,
    propertyValue: null,
    filterContent: function(propertyName, propertyValue, hasPagination) {
        setFilter(this, propertyName, propertyValue);
        if(hasPagination)
            this.setPagination();
    },
    cleanFilter : function(){
        this.propertyName = null;
        this.propertyValue = null;
        this.filterContent();
        this.setPagination();
    },
    addContent : function(content){
        this.content = content;
        this.notifyPropertyChange("content");
        this.arrangedContent = undefined;
        this.filterContent();
        this.setPagination();
    },
    paginationSelector: null,
    itemsPerPage: 5,
    paginationNums: null,
    paginationItems: [],
    totalPages: 0,
    totalItems: 0,
    totalCurrentItems: 0,
    currentPage: 0,
    currentPageContent: [],
    selectedItem: null,
    setPagination: function() {
        setPagination(this, 0);
    }
});

function setPagination(context, page) {
    // console.info("setPagination", context.content);
    if (context.content === undefined || context.content.length == 0) {
        context.set("paginationNums", []);
        context.set("paginationItems", []);

        context.set("totalPages", 0);
        context.set("totalItems", 0);
        context.set("totalCurrentItems", 0);

        context.set("currentPage", 0);
        context.set("currentPageContent", []);
        return;
    }
    // Default amount of items per page
    // if (itemsPerPage == null || itemsPerPage == 0)
    //     itemsPerPage = 5;

    // Default initial page
    if (page == null)
        page = 0;

    // Split content into chunks based on items per page
    var items, chunks;
    chunks = [].concat.apply([],
        context.content.map(function(elem, i) {
            return i%context.itemsPerPage ? [] : [context.content.slice(i, i + context.itemsPerPage)];
        })
    );
    if (chunks.length == 0)
        items = context.content;
    else
        items = chunks;
    context.paginationItems = chunks; // Keep track of all chunks inside the context

    // Build page numbers array
    var pages = [],
        displayedPages = 5;
    for (var i=1; i<=chunks.length; i++) {
        if (i <= displayedPages)
            pages.push({page: i-1, text: i, visible: ""});
        else
            pages.push({page: i-1, text: i, visible: "hide"});
    }
    context.set("paginationNums", pages);

    context.set("totalPages", chunks.length);
    context.set("totalItems", context.content.length);
    context.set("totalCurrentItems", items[page].length);

    context.set("currentPage", page);
    context.set("currentPageContent", items[page]);

    Ember.run.later(this, function() {
        toggleCurrentPage(context, null, page);
        togglePageBack(context);
        togglePageNext(context);
    }, 100);
}

function toggleCurrentPage(collection, prevActive, nextActive) {
    if (prevActive != null) {
        var prevActiveSlector = $(collection.paginationSelector).find("li[yoPagingNumber="+prevActive+"]");
        prevActiveSlector.removeClass("active");
    }
    if (nextActive != null) {
        var nextActiveSlector = $(collection.paginationSelector).find("li[yoPagingNumber="+nextActive+"]");
        nextActiveSlector.addClass("active");
    }
}

function togglePageBack(collection) {
    var prevSelector = $(collection.paginationSelector).find('li[id="prev"]');
    if (collection.currentPage == 0) {
        prevSelector.addClass("disabled");
        prevSelector.find("a").css("pointer-events", "none");
    } else {
        prevSelector.removeClass("disabled");
        prevSelector.find("a").css("pointer-events", "auto");
    }
}

function togglePageNext(collection) {
    var nextSelector = $(collection.paginationSelector).find('li[id="next"]');
    if ((collection.totalPages-1) == collection.currentPage) {
        nextSelector.addClass("disabled");
        nextSelector.find("a").css("pointer-events", "none");
    } else {
        nextSelector.removeClass("disabled");
        nextSelector.find("a").css("pointer-events", "auto");
    }
}

function togglePagingBackEdges(collection, currentPage) {
    var selector = $(collection.paginationSelector).find("li[yoPagingNumber="+currentPage+"]"),
        startEdges = selector.prevAll("li:not(#prev)"),
        endEdges = selector.nextAll("li:not(#next)").slice(0, startEdges.length),
        displayedPages = 5;
    if ((startEdges.slice(0, displayedPages-1).length+1) == displayedPages) {
        $.each(startEdges.slice(0, displayedPages-1), function(index, elem) {
            $(elem).removeClass("hide");
        });
        $.each(endEdges, function(index, elem) {
            $(elem).addClass("hide");
        });
    }
}

function togglePagingNextEdges(collection, currentPage) {
    var selector = $(collection.paginationSelector).find("li[yoPagingNumber="+currentPage+"]"),
        startEdges = selector.prevAll("li:not(#prev, .hide)"),
        endEdges = selector.nextAll("li:not(#next)").slice(0, startEdges.length),
        displayedPages = 5;
    if ((startEdges.length+1) == displayedPages) {
        $.each(startEdges, function(index, elem) {
            $(elem).addClass("hide");
        });
        $.each(endEdges, function(index, elem) {
            $(elem).removeClass("hide");
        });
    }
}

function setFilter(context, propertyName, propertyValue) {
    if (context.arrangedContent === undefined || (context.arrangedContent.length == 0 && context.content.length > 0) )
        context.arrangedContent = context.content;
    if(propertyName == null && context.propertyName == null && context.defaultPropertyName == undefined)
        return;

    if(propertyName != null ){
        var index = context.defaultPropertyName.indexOf(propertyName);
        if(index >= 0)
            context.defaultPropertyValue[index] = propertyValue;
        else {
            context.propertyName = propertyName;
            context.propertyValue = propertyValue;
        }
    }

    var items = context.arrangedContent;
    if(context.defaultPropertyName != undefined){
        for(var i = 0; i < context.defaultPropertyName.length; i++){
            items = items.filterProperty(context.defaultPropertyName[i], context.defaultPropertyValue[i]);
        }
    }

    if(items == undefined || items.length == 0)
        items = context.arrangedContent;

    if(context.propertyName != null){
        var tempItems = [];
        for(var i = 0; i < items.length; i++){
            if(((items[i][context.propertyName]).toUpperCase()).indexOf(context.propertyValue) < 0)
                continue;
            tempItems.push(items[i]);
        }
        items = tempItems;
    }
    context.content = items;
    context.notifyPropertyChange("content");
}