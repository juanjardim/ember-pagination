var InputState = Ember.Object.extend({
    loading  : "loading-container hidden",
    info     : "",
    state    : "",

    isValid  : function(){
        if(/error/.test(this.get("state")) || /error/.test(this.get("warning")))
            return false;
        return true;
    }.property("state"),

    hasError : function(){
        return /error/.test(this.get("state"));
    }.property("info"),

    isDisable : function(){
        if(/hidden/.test(this.get("loading")))
            return false;
        else
            return true;
    }.property("loading")

});
