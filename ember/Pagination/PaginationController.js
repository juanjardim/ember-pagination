var PaginationController = Em.ArrayController.create({
  performPagination: function(collectionName, itemsPerPage) {
    var collection = Ember.get(collectionName);
    Ember.run.later(this, function() {
      collection.setPagination(itemsPerPage);
    }, 1000);
  },

  performPageChange: function(collectionName, context) {
    var collection = Ember.get(collectionName), 
    		page = context.page;
    PaginationController.performActions(collection, page);
    togglePagingBackEdges(collection, page);
    togglePagingNextEdges(collection, page);
  },

  performPageBack: function(collectionName) {
    var collection = Ember.get(collectionName), 
        currentPage = collection.currentPage - 1;
    togglePagingBackEdges(collection, collection.currentPage);
    PaginationController.performActions(collection, currentPage);
  },

  performPageNext: function(collectionName) {
    var collection = Ember.get(collectionName),
        currentPage = collection.currentPage + 1;
    PaginationController.performActions(collection, currentPage);
    togglePagingNextEdges(collection, currentPage);
  },

  performActions: function(collection, currentPage) {
    // collection.selectedItem = null;
    // collection.notifyPropertyChange("selectedItem");
    toggleCurrentPage(collection, collection.currentPage, currentPage);
    collection.currentPage = currentPage;
    collection.currentPageContent = collection.paginationItems[currentPage];
    collection.notifyPropertyChange("currentPage");
    collection.notifyPropertyChange("currentPageContent");
    togglePageBack(collection);
    togglePageNext(collection);
  },

  selectedPageState: function(collectionName) {
    var collection = Ember.get(collectionName);
    Ember.run.next(this, function() {
        var currentPage = collection.currentPage, 
            selector = $(collection.paginationSelector).find("li[yoPagingNumber="+currentPage+"]");
        if (!selector.find("a").hasClass("active"))
            selector.addClass("active");
    });
  }
});