PaginationView = Ember.View.extend({
  actions: {
		performPageChange: function(collectionName, context) {
      PaginationController.performPageChange(collectionName, context);
    },

    performPageBack: function(collectionName) {
      PaginationController.performPageBack(collectionName);
    },

    performPageNext: function(collectionName) {
      PaginationController.performPageNext(collectionName);  
    }
  }
});