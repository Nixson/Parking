$(function(){
    $.support.cors                 = true;
});
var Parking = function(){
    return {
        uuid: null,
        balanse: 0,
        storage: window.localStorage,
        address: "http://parking.gih.ru",
        autorisation: function(){
            var self = this;
            $("#authorisation").show();
            $("#body").hide();
            console.log(self.address);
            this.post({pfind: device.uuid},function(resp){
                console.log(resp);
            });
            $.get(self.address,{pfind: device.uuid},function(resp){
                if(typeof resp.uuid != "undefined"){
                    self.uuid = resp.uuid;
                    self.balanse = resp.balanse;
                    self.sync();
                    self.loadInfo();
                }
            },'json');
        },
        post: function(data,callback){
            $.ajax({method: 'POST',url:this.address,processData: true,data: data, dataType: 'json',success: function(resp){callback(resp);}});
        },
        init: function(){
            this.uuid = window.localStorage.getItem('parking.uuid');
            console.log(this.uuid);
            $.support.cors = true;
            if(this.uuid==null){
                this.autorisation();
            }else {
                this.loadInfo();
            }
        },
        loadInfo: function(){
            var self = this;
            $("#authorisation").hide();
            $("#body").show();
            var balanse = parseFloat(this.storage.getItem("parking.info"));
            self.loadBalanse();
            setInterval(function(){
                self.loadBalanse();
            },30000);

        },
        reloadPage: function(){
            $("#balanse").text(this.balanse);
        },
        loadBalanse: function(){
            var self = this;
            $.post(self.address,{balanse: self.uuid},function(resp){
                self.balanse = parseFloat(resp);
                self.reloadPage();
            });
        },
        sync: function(){
            this.storage.setItem("parking.uuid",this.uuid);
            this.storage.setItem("parking.info",this.balanse);
        },
        loadAuth: function(login){
            var self = this;
            var auth = {};
            auth.login = $("#auth-email").val();
            auth.password = $("#auth-pass").val();
            auth.inpark = login;
            $.post(self.address,{pauth: auth},function(resp){
                if(typeof resp.uuid!="undefined"){
                    self.uuid = resp.uuid;
                    self.balanse = parseFloat(resp.balanse);
                    self.sync();
                    self.loadInfo();
                }
                else {
                    $("#auth-login").removeClass("btn-primary").addClass("btn-danger");
                    setTimeout(function(){
                        $("#auth-login").removeClass("btn-danger").addClass("btn-primary");
                    },2000);
                }
            });
        }
    };
};

var park = new Parking;

var app = {
    initialize: function() {
        this.bindEvents();
    },
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        var self = this;
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('offline', this.offline, false);
        document.addEventListener('online', this.online, false);
        $("#auth-login").on("click",function(){self.loadAuth(true);});
        $("#auth-reg").on("click",function(){self.loadAuth(false);});
    },
    storage: window.localStorage,
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        park.init();
    },
    online: function(){

    },
    offline: function(){

    }

};
