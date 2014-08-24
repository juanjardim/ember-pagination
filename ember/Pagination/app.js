var MainApp = Em.Application.create({
    LOG_TRANSITIONS: true,
    ready: function () {
        MainApp.AppContainerView = Em.ContainerView.extend({});
        MainApp.ModalContainerView = Em.ContainerView.extend({});
        Ember.run.later(this, function() {
            MainAppController.getData();
        }, 100);
    }
});

var Cities = CollectionArray.create({
    paginationSelector: "#cities-paging",
    itemsPerPage : 6
});

MainAppController = Em.ArrayController.create({
    DataState : InputState.create(),
    sourceUrl : "http://api.openweathermap.org/data/2.5/box/city?bbox=2,32,15,37,10&cluster=yes",
    getData : function(){
        postObject(this.sourceUrl,MainAppController.SuccessData, MainAppController.DataState)
    },

    SuccessData : function(data){
        if(data.cod != "200"){
            alert("Sorry an error occurred");
            return;
        }
        Cities.addContent(data.list);
        cleanLoading(MainAppController.DataState);
    }
});

MainAppView  = Ember.View.extend({
    actions: {
        selectCity: function(city) {

        },

        searchCity : function(){
            var value = $("#searchCity").val().trim();
            if (!value)
                Cities.cleanFilter();
            else
                Cities.filterContent("name", value.toUpperCase(), true);
        }
    }
});


function postObject(url,successCallback,context){
    setLoading(context);
    $.getJSON(url, successCallback);
}

function setLoading(context){
    if(context==null)
        return;
    context.set("loading","loading-container hidden");
    context.set("loading","loading-container");
}
function cleanLoading(context){
    if(context==null)
        return;
    context.set("loading","loading-container");
    context.set("loading","loading-container hidden");
}